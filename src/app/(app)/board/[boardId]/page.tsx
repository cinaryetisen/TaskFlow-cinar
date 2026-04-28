import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { logout } from '@/app/actions/auth'
import KanbanBoard from '@/components/board/KanbanBoard'

type Props = { params: Promise<{ boardId: string }> }

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params
  const { userId } = await verifySession()

  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          cards: { orderBy: { position: 'asc' } },
        },
      },
    },
  })

  if (!board) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-indigo-900 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">
            ← Boards
          </Link>
          <h1 className="text-xl font-bold">{board.title}</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-300 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <KanbanBoard board={board} />
      </div>
    </div>
  )
}
