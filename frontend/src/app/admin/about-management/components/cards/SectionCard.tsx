'use client'

import { Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import type { AboutSection } from '@/types/supabase'
import { DragHandle } from '@/shared/ui'

interface SectionCardProps {
  section: AboutSection
  onEdit: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

export default function SectionCard({
  section,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false
}: SectionCardProps) {
  return (
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-6 transition-all duration-300 overflow-hidden hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-glow-sm hover:-translate-y-1 cursor-pointer">
      {/* Drag Handle - Top Left - Desktop Only */}
      <div className="hidden md:block absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DragHandle />
      </div>

      {/* Mobile Reorder Buttons - Top Right */}
      {(onMoveUp || onMoveDown) && (
        <div className="md:hidden absolute top-4 right-4 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp?.()
            }}
            disabled={isFirst}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isFirst
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400'
            }`}
            aria-label="위로 이동"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown?.()
            }}
            disabled={isLast}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLast
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400'
            }`}
            aria-label="아래로 이동"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:text-violet-300 transition-colors">
        {section.title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem] whitespace-pre-line">
        {section.content}
      </p>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4 pt-3 border-t border-white/5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          section.is_active
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
        }`}>
          {section.is_active ? (
            <>
              <Eye className="w-3 h-3" />
              활성
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              비활성
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          수정
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
      </div>
    </div>
  )
}
