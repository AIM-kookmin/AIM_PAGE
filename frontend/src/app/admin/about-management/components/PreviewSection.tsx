'use client'

import React from 'react'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/shared/ui'
import SaveIndicator from './SaveIndicator'
import type { SaveStatus } from './SaveIndicator'

interface PreviewSectionProps {
  id: string
  title: string
  description: string
  count: number
  onAdd: () => void
  addLabel: string
  saveStatus: SaveStatus
  isEmpty: boolean
  emptyMessage: string
  children: React.ReactNode
}

export default function PreviewSection({
  id,
  title,
  description,
  count,
  onAdd,
  addLabel,
  saveStatus,
  isEmpty,
  emptyMessage,
  children,
}: PreviewSectionProps) {
  return (
    <section
      id={id}
      className="py-12 border-b border-white/5 last:border-b-0"
    >
      {isEmpty ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            첫 번째 항목을 추가해보세요
          </p>
          <Button onClick={onAdd}>
            <Plus className="w-5 h-5 mr-2" />
            {addLabel}
          </Button>
        </div>
      ) : (
        // Content with Header
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-500">{count}개 항목</p>
            </div>
            <div className="flex items-center gap-4">
              <SaveIndicator status={saveStatus} />
              <Button onClick={onAdd}>
                <Plus className="w-4 h-4 mr-2" />
                {addLabel}
              </Button>
            </div>
          </div>
          {children}
        </>
      )}
    </section>
  )
}
