'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { lexMiddle } from '@/lib/position'

async function nextPosition(boardId: string): Promise<string> {
  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  return last ? String.fromCharCode(last.position.charCodeAt(0) + 1) : 'a'
}

export async function createColumn(boardId: string, title: string) {
  await verifySession()
  const position = await nextPosition(boardId)
  const column = await prisma.column.create({ data: { title, position, boardId } })
  revalidatePath(`/board/${boardId}`)
  return column
}

export async function updateColumnTitle(columnId: string, boardId: string, title: string) {
  await verifySession()
  await prisma.column.update({ where: { id: columnId }, data: { title } })
  revalidatePath(`/board/${boardId}`)
}

export async function deleteColumn(columnId: string, boardId: string) {
  await verifySession()
  await prisma.column.delete({ where: { id: columnId } })
  revalidatePath(`/board/${boardId}`)
}

export async function reorderColumns(
  boardId: string,
  columns: { id: string; position: string }[]
) {
  await verifySession()
  await Promise.all(
    columns.map((c) => prisma.column.update({ where: { id: c.id }, data: { position: c.position } }))
  )
  revalidatePath(`/board/${boardId}`)
}
