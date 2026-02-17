'use client'

import { Reorder } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { AboutHistory } from '@/types/supabase'
import HistoryCard from './cards/HistoryCard'
import SaveIndicator, { type SaveStatus } from './SaveIndicator'

interface ReorderableHistoryListProps {
  items: AboutHistory[]
  onReorder: (items: AboutHistory[]) => void
  onEdit: (item: AboutHistory) => void
  onDelete: (item: AboutHistory) => void
  saveStatus: SaveStatus
}

export default function ReorderableHistoryList({
  items,
  onReorder,
  onEdit,
  onDelete,
  saveStatus,
}: ReorderableHistoryListProps) {
  // Group items by year (descending)
  const groupedByYear = items.reduce((acc, item) => {
    const year = item.year
    if (!acc[year]) acc[year] = []
    acc[year].push(item)
    return acc
  }, {} as Record<number, AboutHistory[]>)

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a) // Descending

  const handleYearGroupReorder = (year: number, newOrder: AboutHistory[]) => {
    // Normalize order within this year group (0, 1, 2...)
    const normalizedGroup = newOrder.map((item, index) => ({
      ...item,
      order: index,
    }))

    // Merge with other years' items
    const otherYears = items.filter(item => item.year !== year)
    const allItems = [...otherYears, ...normalizedGroup]

    onReorder(allItems)
  }

  const handleMoveUp = (year: number, index: number) => {
    if (index === 0) return
    const yearItems = [...groupedByYear[year]]
    ;[yearItems[index - 1], yearItems[index]] = [yearItems[index], yearItems[index - 1]]
    handleYearGroupReorder(year, yearItems)
  }

  const handleMoveDown = (year: number, index: number) => {
    const yearItems = groupedByYear[year]
    if (index === yearItems.length - 1) return
    const newYearItems = [...yearItems]
    ;[newYearItems[index], newYearItems[index + 1]] = [newYearItems[index + 1], newYearItems[index]]
    handleYearGroupReorder(year, newYearItems)
  }

  return (
    <div>
      {/* SaveIndicator in top-right */}
      <div className="flex justify-end mb-4">
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Year-grouped reorderable lists */}
      <div className="space-y-8">
        {years.map(year => {
          const yearItems = groupedByYear[year]

          return (
            <div key={year}>
              {/* Non-draggable year header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
                <Calendar className="w-5 h-5 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">{year}</h2>
                <span className="text-sm text-white/40">({yearItems.length}개 항목)</span>
              </div>

              {/* Reorderable items within this year */}
              <Reorder.Group
                axis="y"
                values={yearItems}
                onReorder={(newOrder) => handleYearGroupReorder(year, newOrder)}
                className="flex flex-col gap-4 max-w-4xl mx-auto"
              >
                {yearItems.map((item, index) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <HistoryCard
                      history={item}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      onMoveUp={() => handleMoveUp(year, index)}
                      onMoveDown={() => handleMoveDown(year, index)}
                      isFirst={index === 0}
                      isLast={index === yearItems.length - 1}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )
        })}
      </div>
    </div>
  )
}
