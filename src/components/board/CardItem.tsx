'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateCard, deleteCard } from '@/app/actions/cards'
import ChecklistSection from './ChecklistSection'

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

type Props = {
  card: Card
  boardId: string
  boardMembers: BoardMember[]
  overlay?: boolean
  onDeleted?: () => void
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

function toDatePart(iso: string | null) {
  return iso ? iso.split('T')[0] : ''
}

function formatDueDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = due.getTime() - today.getTime()
  const day = 86400000
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  if (diff === day) return 'Tomorrow'
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dueDateClass(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = due.getTime() - today.getTime()
  if (diff < 0) return 'text-red-600 bg-red-50'
  if (diff === 0) return 'text-orange-600 bg-orange-50'
  return 'text-gray-500 bg-gray-100'
}

export default function CardItem({ card, boardId, boardMembers, overlay, onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDateInput, setDueDateInput] = useState(toDatePart(card.dueDate))
  const [assigneeId, setAssigneeId] = useState(card.assigneeId ?? '')
  const [displayTitle, setDisplayTitle] = useState(card.title)
  const [displayDescription, setDisplayDescription] = useState(card.description ?? '')
  const [displayDueDate, setDisplayDueDate] = useState(toDatePart(card.dueDate))
  const [displayAssigneeId, setDisplayAssigneeId] = useState(card.assigneeId ?? '')
  const [checklistItems, setChecklistItems] = useState(card.checklistItems)
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
    setDisplayTitle(title)
    setDisplayDescription(description)
    setDisplayDueDate(dueDateInput)
    setDisplayAssigneeId(assigneeId)
    setOpen(false)
    startTransition(() =>
      updateCard(card.id, boardId, {
        title,
        description,
        dueDate: dueDateInput ? new Date(dueDateInput) : null,
        assigneeId: assigneeId || null,
      })
    )
  }

  function handleDelete() {
    setOpen(false)
    onDeleted?.()
    startTransition(() => deleteCard(card.id, boardId))
  }

  const total = checklistItems.length
  const done = checklistItems.filter((i) => i.done).length
  const displayAssignee = boardMembers.find((m) => m.id === displayAssigneeId) ?? null

  return (
    <>
      <div
        ref={setNodeRef}
        style={overlay ? undefined : style}
        className={`bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group ${
          overlay ? 'shadow-xl rotate-1' : 'hover:border-violet-300'
        } ${isDragging ? 'opacity-40' : ''}`}
        suppressHydrationWarning
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm text-gray-800 leading-snug break-words flex-1">{displayTitle}</p>
          {!overlay && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(true) }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs transition-opacity shrink-0"
            >
              ✎
            </button>
          )}
        </div>

        {displayDescription && (
          <p className="text-xs text-gray-400 mt-1 truncate">{displayDescription}</p>
        )}

        {(displayDueDate || displayAssignee) && (
          <div className="flex items-center justify-between mt-1.5 gap-2">
            {displayDueDate ? (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${dueDateClass(displayDueDate)}`}>
                {formatDueDate(displayDueDate)}
              </span>
            ) : <span />}
            {displayAssignee && (
              <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-bold leading-none">
                  {initials(displayAssignee.name, displayAssignee.email)}
                </span>
              </div>
            )}
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className="bg-violet-400 h-1 rounded-full transition-all"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 shrink-0">{done}/{total}</span>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Add a description…"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">Unassigned</option>
                  {boardMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name ?? m.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ChecklistSection
              cardId={card.id}
              boardId={boardId}
              items={checklistItems}
              onItemsChange={setChecklistItems}
            />

            <div className="flex gap-2 justify-between border-t border-gray-100 pt-4">
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
