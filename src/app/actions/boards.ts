'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export async function createBoard(formData: FormData) {
  const { userId } = await verifySession()
  const title = formData.get('title') as string
  if (!title?.trim()) return

  const board = await prisma.board.create({
    data: { title: title.trim(), userId },
  })

  revalidatePath('/dashboard')
  redirect(`/board/${board.id}`)
}

export async function deleteBoard(boardId: string) {
  const { userId } = await verifySession()
  await prisma.board.deleteMany({ where: { id: boardId, userId } })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
