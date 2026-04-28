'use client'

import { useState, useTransition } from 'react'
import { createColumn } from '@/app/actions/columns'

type Column = { id: string; title: string; position: string; boardId: string }

type Props = {
  boardId: string
  onAdded: (col: Column) => void
}

export default function AddColumnForm({ boardId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const optimistic = { id: crypto.randomUUID(), title: title.trim(), position: 'z', boardId }
    onAdded(optimistic)
    setTitle('')
    setOpen(false)
    startTransition(() => createColumn(boardId, title.trim()))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 w-72 h-12 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
      >
        + Add column
      </button>
    )
  }

  return (
    <div className="flex-shrink-0 w-72 bg-slate-100 rounded-xl p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Column title…"
          className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
        />
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={pending || !title.trim()}
            className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            Add column
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
