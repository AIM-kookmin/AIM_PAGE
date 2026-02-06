'use client'

import { Calendar, Image as ImageIcon, ExternalLink, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Activity } from '@/types/supabase'

interface ActivityCardProps {
  activity: Activity
  onEdit: (activity: Activity) => void
  onDelete: (activity: Activity) => void
  getCategoryLabel: (category: Activity['category']) => string
  formatDate: (date: string) => string
}

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
  getCategoryLabel,
  formatDate
}: ActivityCardProps) {
  return (
    <div className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden flex flex-col hover:shadow-glow-sm hover:-translate-y-1">
      {/* Image */}
      {activity.image_url ? (
        <div className="relative w-full h-48 bg-white/[0.02] overflow-hidden">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {activity.link && (
            <div className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-48 bg-white/[0.02] flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-700 group-hover:text-gray-600 transition-colors duration-200" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
            {getCategoryLabel(activity.category)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(activity.date)}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-violet-300 transition-colors">
          {activity.title}
        </h3>

        {activity.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
            {activity.description}
          </p>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4 pt-3 border-t border-white/5">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
            activity.is_active
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
          }`}>
            {activity.is_active ? (
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
            onClick={() => onEdit(activity)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            수정
          </button>
          <button
            onClick={() => onDelete(activity)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
