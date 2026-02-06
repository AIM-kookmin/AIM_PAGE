import { useState, useCallback, useRef, useEffect } from 'react'
import type { SaveStatus } from '../components/SaveIndicator'

interface UseReorderWithSaveProps<T extends { id: string; order: number }> {
  initialItems: T[]
  onSave: (items: T[]) => Promise<void>
  debounceMs?: number
}

export interface UseReorderReturn<T extends { id: string; order: number }> {
  items: T[]
  setItems: (items: T[]) => void
  saveStatus: SaveStatus
  handleReorder: (newOrder: T[]) => void
  moveItem: (fromIndex: number, direction: 'up' | 'down') => void
}

export default function useReorderWithSave<T extends { id: string; order: number }>({
  initialItems,
  onSave,
  debounceMs = 500,
}: UseReorderWithSaveProps<T>): UseReorderReturn<T> {
  // Local state for items
  const [items, setItems] = useState<T[]>(initialItems)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Ref for previous items (error recovery)
  const previousItemsRef = useRef<T[]>(initialItems)

  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Ref to track if save is pending
  const pendingItemsRef = useRef<T[] | null>(null)

  // Update items when initialItems change
  useEffect(() => {
    setItems(initialItems)
    previousItemsRef.current = initialItems
  }, [initialItems])

  // Auto-save logic with error handling
  const performSave = useCallback(
    async (itemsToSave: T[]) => {
      setSaveStatus('saving')
      try {
        await onSave(itemsToSave)
        setSaveStatus('saved')
        previousItemsRef.current = itemsToSave
        pendingItemsRef.current = null

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Failed to save reorder:', error)
        setSaveStatus('error')

        // Revert to previous order on error
        setItems(previousItemsRef.current)
        pendingItemsRef.current = null

        // Reset error status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      }
    },
    [onSave]
  )

  // Handle reorder with optimistic update and debounced save
  const handleReorder = useCallback(
    (newOrder: T[]) => {
      // CRITICAL: Update order values based on new array position
      const reorderedItems = newOrder.map((item, index) => ({
        ...item,
        order: index,
      }))

      // Optimistic UI update
      setItems(reorderedItems)
      pendingItemsRef.current = reorderedItems

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        if (pendingItemsRef.current) {
          performSave(pendingItemsRef.current)
        }
      }, debounceMs)
    },
    [debounceMs, performSave]
  )

  // Move item up or down (keyboard support)
  const moveItem = useCallback(
    (fromIndex: number, direction: 'up' | 'down') => {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

      // Boundary checks
      if (toIndex < 0 || toIndex >= items.length) {
        return
      }

      // Create new array with swapped items
      const newItems = [...items]
      const temp = newItems[fromIndex]
      newItems[fromIndex] = newItems[toIndex]
      newItems[toIndex] = temp

      // Update order values
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }))

      handleReorder(reorderedItems)
    },
    [items, handleReorder]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    items,
    setItems,
    saveStatus,
    handleReorder,
    moveItem,
  }
}
