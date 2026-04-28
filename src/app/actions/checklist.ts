'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function addChecklistItem(cardId: string, boardId: string, text: string) {
  await verifySession()
  const last = await prisma.checklistItem.findFirst({
    where: { cardId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const position = last ? String.fromCharCode(last.position.charCodeAt(0) + 1) : 'a'
  const item = await prisma.checklistItem.create({ data: { text, cardId, position } })
  revalidatePath(`/board/${boardId}`)
  return item
}

export async function toggleChecklistItem(itemId: string, boardId: string, done: boolean) {
  await verifySession()
  await prisma.checklistItem.update({ where: { id: itemId }, data: { done } })
  revalidatePath(`/board/${boardId}`)
}

export async function deleteChecklistItem(itemId: string, boardId: string) {
  await verifySession()
  await prisma.checklistItem.delete({ where: { id: itemId } })
  revalidatePath(`/board/${boardId}`)
}
