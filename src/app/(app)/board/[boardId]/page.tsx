import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { logout } from '@/app/actions/auth'
import KanbanBoard from '@/components/board/KanbanBoard'
import MembersPanel from '@/components/board/MembersPanel'

type Props = { params: Promise<{ boardId: string }> }

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params
  const { userId } = await verifySession()

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      columns: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: {
              checklistItems: { orderBy: { position: 'asc' } },
              assignee: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  if (!board) notFound()

  const isOwner = board.userId === userId

  const boardMembers = [
    { id: board.user.id, name: board.user.name, email: board.user.email },
    ...board.members.map((m) => m.user),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-indigo-900 flex flex-col">
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-white border-b border-white/10 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors shrink-0">
            ← Boards
          </Link>
          <h1 className="text-base sm:text-xl font-bold truncate">{board.title}</h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <MembersPanel
            boardId={board.id}
            initialMembers={board.members}
            isOwner={isOwner}
            currentUserId={userId}
          />
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-300 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-3 sm:p-6">
        <KanbanBoard board={board} boardMembers={boardMembers} />
      </div>
    </div>
  )
}
