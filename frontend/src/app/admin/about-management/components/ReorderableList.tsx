'use client'

import { Reorder } from 'framer-motion'
import { useEffect, useRef } from 'react'
import SaveIndicator, { type SaveStatus } from './SaveIndicator'

interface ReorderableListProps<T extends { id: string; order: number }> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, handlers?: { onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean }) => React.ReactNode
  saveStatus: SaveStatus
  onKeyboardMove?: (fromIndex: number, direction: 'up' | 'down') => void
}

export default function ReorderableList<T extends { id: string; order: number }>({
  items,
  onReorder,
  renderItem,
  saveStatus,
  onKeyboardMove,
}: ReorderableListProps<T>) {
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    onReorder(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    onReorder(newItems)
  }

  // Keyboard handler for Alt+Up/Down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!onKeyboardMove || !e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) {
        return
      }

      e.preventDefault()

      // Find the currently focused item
      const activeElement = document.activeElement
      if (!activeElement) return

      // Find which item is focused
      let focusedIndex = -1
      itemRefs.current.forEach((element, id) => {
        if (element.contains(activeElement)) {
          focusedIndex = items.findIndex((item) => item.id === id)
        }
      })

      if (focusedIndex === -1) return

      const direction = e.key === 'ArrowUp' ? 'up' : 'down'
      onKeyboardMove(focusedIndex, direction)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onKeyboardMove, items])

  return (
    <div>
      {/* SaveIndicator in top-right */}
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Reorder.Group with grid layout */}
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onReorder}
        className="flex flex-col gap-4 max-w-4xl mx-auto"
      >
        {items.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            whileDrag={{
              scale: 1.02,
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
            }}
            transition={{ duration: 0.2 }}
            ref={(el: HTMLLIElement | null) => {
              if (el) {
                itemRefs.current.set(item.id, el)
              } else {
                itemRefs.current.delete(item.id)
              }
            }}
          >
            {renderItem(item, {
              onMoveUp: () => handleMoveUp(index),
              onMoveDown: () => handleMoveDown(index),
              isFirst: index === 0,
              isLast: index === items.length - 1
            })}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}
