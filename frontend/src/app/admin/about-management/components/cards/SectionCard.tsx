'use client'

import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import type { AboutSection } from '@/types/supabase'

interface SectionCardProps {
  section: AboutSection
  onEdit: () => void
  onDelete: () => void
}

export default function SectionCard({
  section,
  onEdit,
  onDelete
}: SectionCardProps) {
  return (
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/5 p-6 transition-all duration-300 overflow-hidden hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-glow-sm hover:-translate-y-1 cursor-pointer">
      {/* Order Badge - Top Right */}
      <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium">
        #{section.order}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-3 pr-12 group-hover:text-violet-300 transition-colors">
        {section.title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
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
