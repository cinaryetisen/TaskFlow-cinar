'use client'

import { useState, useTransition } from 'react'
import { addChecklistItem, toggleChecklistItem, deleteChecklistItem } from '@/app/actions/checklist'

type Item = { id: string; text: string; done: boolean; position: string }

type Props = {
  cardId: string
  boardId: string
  items: Item[]
  onItemsChange: React.Dispatch<React.SetStateAction<Item[]>>
}

export default function ChecklistSection({ cardId, boardId, items, onItemsChange }: Props) {
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()

  function handleToggle(item: Item) {
    onItemsChange((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))
    startTransition(() => toggleChecklistItem(item.id, boardId, !item.done))
  }

  function handleDelete(itemId: string) {
    onItemsChange((prev) => prev.filter((i) => i.id !== itemId))
    startTransition(() => deleteChecklistItem(itemId, boardId))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    const text = newText.trim()
    const optimisticId = crypto.randomUUID()
    onItemsChange((prev) => [...prev, { id: optimisticId, text, done: false, position: 'z' }])
    setNewText('')
    setAdding(false)
    const real = await addChecklistItem(cardId, boardId, text)
    onItemsChange((prev) => prev.map((i) => (i.id === optimisticId ? real : i)))
  }

  const done = items.filter((i) => i.done).length
  const total = items.length

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Checklist{total > 0 && <span className="ml-1 text-gray-400 font-normal">({done}/{total})</span>}
        </label>
      </div>

      {total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-1.5 mb-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => handleToggle(item)}
              className="accent-violet-600 w-4 h-4 cursor-pointer flex-shrink-0"
            />
            <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {item.text}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-base leading-none transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="space-y-1.5">
          <input
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            placeholder="Item text…"
            className="w-full px-2 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 border border-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-1">
            <button
              type="submit"
              disabled={!newText.trim()}
              className="px-3 py-1 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
        >
          + Add item
        </button>
      )}
    </div>
  )
}
