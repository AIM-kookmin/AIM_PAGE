'use client'

import { Calendar, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import type { AboutHistory } from '@/types/supabase'

interface HistoryCardProps {
  history: AboutHistory
  onEdit: () => void
  onDelete: () => void
}

export default function HistoryCard({
  history,
  onEdit,
  onDelete
}: HistoryCardProps) {
  return (
    <div className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 p-6 hover:shadow-glow-sm hover:-translate-y-1">
      {/* Header: Year and Order */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-5 h-5 text-violet-400" />
          <span className="text-4xl font-bold text-violet-400">
            {history.year}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
          순서: {history.order}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300 transition-colors">
        {history.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
        {history.description}
      </p>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4 pt-3 border-t border-white/5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          history.is_active
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
        }`}>
          {history.is_active ? (
            <>
              <Eye className="w-3 h-3" />
              공개
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              비공개
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          수정
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
      </div>
    </div>
  )
}
