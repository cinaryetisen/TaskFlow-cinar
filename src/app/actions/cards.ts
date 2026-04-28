'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

async function nextCardPosition(columnId: string): Promise<string> {
  const last = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  return last ? String.fromCharCode(last.position.charCodeAt(0) + 1) : 'a'
}

export async function createCard(columnId: string, boardId: string, title: string) {
  await verifySession()
  const position = await nextCardPosition(columnId)
  await prisma.card.create({ data: { title, position, columnId } })
  revalidatePath(`/board/${boardId}`)
}

export async function updateCard(
  cardId: string,
  boardId: string,
  data: { title?: string; description?: string }
) {
  await verifySession()
  await prisma.card.update({ where: { id: cardId }, data })
  revalidatePath(`/board/${boardId}`)
}

export async function deleteCard(cardId: string, boardId: string) {
  await verifySession()
  await prisma.card.delete({ where: { id: cardId } })
  revalidatePath(`/board/${boardId}`)
}

export async function moveCard(
  cardId: string,
  boardId: string,
  newColumnId: string,
  newPosition: string
) {
  await verifySession()
  await prisma.card.update({
    where: { id: cardId },
    data: { columnId: newColumnId, position: newPosition },
  })
  revalidatePath(`/board/${boardId}`)
}
