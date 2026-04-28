'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateCard, deleteCard } from '@/app/actions/cards'

type Card = { id: string; title: string; description: string | null; position: string; columnId: string }

type Props = {
  card: Card
  boardId: string
  overlay?: boolean
  onDeleted?: () => void
}

export default function CardItem({ card, boardId, overlay, onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [, startTransition] = useTransition()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleSave() {
    setOpen(false)
    startTransition(() => updateCard(card.id, boardId, { title, description }))
  }

  function handleDelete() {
    setOpen(false)
    onDeleted?.()
    startTransition(() => deleteCard(card.id, boardId))
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={overlay ? undefined : style}
        className={`bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group ${
          overlay ? 'shadow-xl rotate-1' : 'hover:border-violet-300'
        } ${isDragging ? 'opacity-40' : ''}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm text-gray-800 leading-snug break-words flex-1">{card.title}</p>
          {!overlay && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(true) }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs transition-opacity shrink-0"
            >
              ✎
            </button>
          )}
        </div>
        {card.description && (
          <p className="text-xs text-gray-400 mt-1 truncate">{card.description}</p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Card</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Add a description…"
            />

            <div className="flex gap-2 justify-between">
              <button
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Delete card
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
