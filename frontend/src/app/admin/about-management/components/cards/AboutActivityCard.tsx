'use client'

import { AboutActivity } from '@/types/supabase'
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import DragHandle from '@/shared/ui/DragHandle'

interface AboutActivityCardProps {
  activity: AboutActivity
  onEdit: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

const colorClasses = {
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
} as const

type ColorKey = keyof typeof colorClasses

export default function AboutActivityCard({
  activity,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false
}: AboutActivityCardProps) {
  const colorKey = (activity.color as ColorKey) || 'violet'
  const colorClass = colorClasses[colorKey] || colorClasses.violet

  return (
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-glow-sm hover:-translate-y-1">
      {/* Drag Handle - Desktop Only */}
      <div className="hidden md:block absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
      {/* Header with Order Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${colorClass} border`}>
          <span className="text-4xl">{activity.icon}</span>
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
          activity.is_active
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-white/5 text-white/40 border border-white/10'
        }`}>
          {activity.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
          {activity.title}
        </h3>
        <p className="text-sm text-white/60 line-clamp-2 whitespace-pre-line">
          {activity.description}
        </p>
      </div>

      {/* Color Indicator */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
        <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`} />
        <span className="text-xs text-white/40 capitalize">{activity.color}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 hover:text-violet-200 transition-all duration-200 font-medium"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm">수정</span>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 hover:text-red-200 transition-all duration-200 font-medium"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">삭제</span>
        </button>
      </div>
    </div>
  )
}
