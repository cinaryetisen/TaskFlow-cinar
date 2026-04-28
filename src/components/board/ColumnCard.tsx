'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import CardItem from './CardItem'
import AddCardForm from './AddCardForm'
import { deleteColumn, updateColumnTitle } from '@/app/actions/columns'

type ChecklistItem = { id: string; text: string; done: boolean; position: string }
type BoardMember = { id: string; name: string | null; email: string }
type Card = {
  id: string
  title: string
  description: string | null
  position: string
  columnId: string
  dueDate: string | null
  assigneeId: string | null
  assignee: BoardMember | null
  checklistItems: ChecklistItem[]
}
type Column = { id: string; title: string; position: string; boardId: string; cards: Card[] }

type Props = {
  column: Column
  boardId: string
  boardMembers: BoardMember[]
  overlay?: boolean
  onCardAdded: (card: Card) => void
  onCardDeleted: (cardId: string) => void
  onColumnDeleted: () => void
}

export default function ColumnCard({ column, boardId, boardMembers, overlay, onCardAdded, onCardDeleted, onColumnDeleted }: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [, startTransition] = useTransition()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleTitleBlur() {
    setEditingTitle(false)
    if (title.trim() && title !== column.title) {
      startTransition(() => updateColumnTitle(column.id, boardId, title.trim()))
    } else {
      setTitle(column.title)
    }
  }

  function handleDelete() {
    onColumnDeleted()
    startTransition(() => deleteColumn(column.id, boardId))
  }

  const cardIds = column.cards.map((c) => c.id)

  return (
    <div
      ref={setNodeRef}
      style={overlay ? undefined : style}
      className={`flex-shrink-0 w-[280px] sm:w-72 bg-slate-100 rounded-xl flex flex-col max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-8rem)] ${overlay ? 'shadow-2xl rotate-2' : ''}`}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        suppressHydrationWarning
        {...attributes}
        {...listeners}
      >
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="flex-1 bg-white border border-violet-400 rounded px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        ) : (
          <h3
            className="font-semibold text-gray-800 text-sm truncate flex-1 cursor-text"
            onDoubleClick={() => !overlay && setEditingTitle(true)}
          >
            {title}
            <span className="ml-1 text-gray-400 font-normal">({column.cards.length})</span>
          </h3>
        )}

        {!overlay && (
          <button
            onClick={handleDelete}
            className="ml-2 text-gray-400 hover:text-red-500 text-lg leading-none transition-colors"
            title="Delete column"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              boardId={boardId}
              boardMembers={boardMembers}
              onDeleted={() => onCardDeleted(card.id)}
            />
          ))}
        </SortableContext>
      </div>

      {!overlay && (
        <div className="px-2 pb-2">
          <AddCardForm
            columnId={column.id}
            boardId={boardId}
            onAdded={(card) => onCardAdded({ ...card, columnId: column.id })}
          />
        </div>
      )}
    </div>
  )
}
