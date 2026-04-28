'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function inviteMember(boardId: string, email: string) {
  const { userId } = await verifySession()

  const board = await prisma.board.findFirst({ where: { id: boardId, userId } })
  if (!board) return { error: 'Not authorized' }

  const target = await prisma.user.findUnique({ where: { email } })
  if (!target) return { error: 'No account found with that email' }
  if (target.id === userId) return { error: 'You are already the owner' }

  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: target.id } },
  })
  if (existing) return { error: 'User is already a member' }

  await prisma.boardMember.create({ data: { boardId, userId: target.id } })
  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function removeMember(boardId: string, targetUserId: string) {
  const { userId } = await verifySession()

  const board = await prisma.board.findFirst({ where: { id: boardId } })
  if (!board) return { error: 'Board not found' }

  const isOwner = board.userId === userId
  const isSelf = targetUserId === userId

  if (!isOwner && !isSelf) return { error: 'Not authorized' }
  if (targetUserId === board.userId) return { error: 'Cannot remove the owner' }

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId: targetUserId } },
  })
  revalidatePath(`/board/${boardId}`)
  return { success: true }
}
