'use client'

import { useState, useTransition } from 'react'
import { createCard } from '@/app/actions/cards'

type Card = { id: string; title: string; description: string | null; position: string }

type Props = {
  columnId: string
  boardId: string
  onAdded: (card: Card) => void
}

export default function AddCardForm({ columnId, boardId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const optimistic = { id: crypto.randomUUID(), title: title.trim(), description: null, position: 'z' }
    onAdded(optimistic)
    setTitle('')
    setOpen(false)
    startTransition(() => createCard(columnId, boardId, title.trim()))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-slate-200 rounded-lg px-2 py-1.5 transition-colors"
      >
        + Add a card
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent) }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Card title…"
        rows={2}
        className="w-full px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 border border-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none bg-white"
      />
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="px-3 py-1 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
