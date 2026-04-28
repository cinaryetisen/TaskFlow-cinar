'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import ColumnCard from './ColumnCard'
import CardItem from './CardItem'
import AddColumnForm from './AddColumnForm'
import { moveCard } from '@/app/actions/cards'
import { reorderColumns } from '@/app/actions/columns'

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
type Board = { id: string; title: string; columns: Column[] }

export default function KanbanBoard({ board, boardMembers }: { board: Board; boardMembers: BoardMember[] }) {
  const [columns, setColumns] = useState<Column[]>(board.columns)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  function onDragStart({ active }: DragStartEvent) {
    const col = columns.find((c) => c.id === active.id)
    if (col) { setActiveColumn(col); return }
    const card = columns.flatMap((c) => c.cards).find((c) => c.id === active.id)
    if (card) setActiveCard(card)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return
    const activeCard = columns.flatMap((c) => c.cards).find((c) => c.id === active.id)
    if (!activeCard) return

    const sourceColId = activeCard.columnId
    const targetColId = columns.find((c) => c.id === over.id)?.id
      ?? columns.find((c) => c.cards.some((card) => card.id === over.id))?.id

    if (!targetColId || sourceColId === targetColId) return

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColId) return { ...col, cards: col.cards.filter((c) => c.id !== active.id) }
        if (col.id === targetColId) return { ...col, cards: [...col.cards, { ...activeCard, columnId: targetColId }] }
        return col
      })
    )
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null)
    setActiveColumn(null)
    if (!over || active.id === over.id) return

    const isColumnDrag = columns.some((c) => c.id === active.id)

    if (isColumnDrag) {
      const oldIndex = columns.findIndex((c) => c.id === active.id)
      const newIndex = columns.findIndex((c) => c.id === over.id)
      if (oldIndex === newIndex) return

      const reordered = arrayMove(columns, oldIndex, newIndex).map((col, i) => ({
        ...col,
        position: String.fromCharCode(97 + i),
      }))
      setColumns(reordered)
      startTransition(() =>
        reorderColumns(board.id, reordered.map((c) => ({ id: c.id, position: c.position })))
      )
      return
    }

    const draggedCard = columns.flatMap((c) => c.cards).find((c) => c.id === active.id)
    if (!draggedCard) return

    const targetCol = columns.find((c) => c.id === over.id || c.cards.some((card) => card.id === over.id))
    if (!targetCol) return

    const targetCards = targetCol.cards
    const overIndex = targetCards.findIndex((c) => c.id === over.id)
    const newPosition = overIndex === -1
      ? String.fromCharCode((targetCards[targetCards.length - 1]?.position.charCodeAt(0) ?? 96) + 1)
      : overIndex === 0
        ? String.fromCharCode(targetCards[0].position.charCodeAt(0) - 1)
        : String.fromCharCode(
            Math.floor(
              (targetCards[overIndex - 1].position.charCodeAt(0) + targetCards[overIndex].position.charCodeAt(0)) / 2
            )
          )

    startTransition(() => moveCard(draggedCard.id, board.id, targetCol.id, newPosition))
  }

  const columnIds = columns.map((c) => c.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 sm:gap-4 items-start h-full">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <ColumnCard
              key={col.id}
              column={col}
              boardId={board.id}
              boardMembers={boardMembers}
              onCardAdded={(card) =>
                setColumns((prev) =>
                  prev.map((c) => (c.id === col.id ? { ...c, cards: [...c.cards, card] } : c))
                )
              }
              onCardDeleted={(cardId) =>
                setColumns((prev) =>
                  prev.map((c) => ({ ...c, cards: c.cards.filter((card) => card.id !== cardId) }))
                )
              }
              onColumnDeleted={() =>
                setColumns((prev) => prev.filter((c) => c.id !== col.id))
              }
            />
          ))}
        </SortableContext>

        <AddColumnForm
          boardId={board.id}
          onAdded={(col) => setColumns((prev) => [...prev, { ...col, cards: [] }])}
          onRealId={(optimisticId, realId) =>
            setColumns((prev) =>
              prev.map((c) => (c.id === optimisticId ? { ...c, id: realId } : c))
            )
          }
        />
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeCard && <CardItem card={activeCard} boardId={board.id} boardMembers={boardMembers} overlay />}
            {activeColumn && (
              <ColumnCard
                column={activeColumn}
                boardId={board.id}
                boardMembers={boardMembers}
                overlay
                onCardAdded={() => {}}
                onCardDeleted={() => {}}
                onColumnDeleted={() => {}}
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}
