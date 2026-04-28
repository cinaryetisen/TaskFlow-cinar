import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { prisma } from '@/lib/prisma'
import { logout } from '@/app/actions/auth'
import { createBoard } from '@/app/actions/boards'

export default async function DashboardPage() {
  const { userId } = await verifySession()

  const boards = await prisma.board.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Boards</h2>
          <form action={createBoard} className="flex gap-2">
            <input
              name="title"
              type="text"
              placeholder="Board name"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              New board
            </button>
          </form>
        </div>

        {boards.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            No boards yet. Create one to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-400 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900 truncate">{board.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
