'use client'

import { AboutActivity } from '@/types/supabase'
import { Pencil, Trash2 } from 'lucide-react'

interface AboutActivityCardProps {
  activity: AboutActivity
  onEdit: () => void
  onDelete: () => void
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

export function AboutActivityCard({ activity, onEdit, onDelete }: AboutActivityCardProps) {
  const colorKey = (activity.color as ColorKey) || 'violet'
  const colorClass = colorClasses[colorKey] || colorClasses.violet

  return (
    <div className="group rounded-2xl bg-white/[0.02] border border-white/5 p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-glow-sm hover:-translate-y-1">
      {/* Header with Order Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${colorClass} border`}>
          <span className="text-4xl">{activity.icon}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
            #{activity.order}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
            activity.is_active
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {activity.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
          {activity.title}
        </h3>
        <p className="text-sm text-white/60 line-clamp-2">
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 text-white/80 hover:text-white transition-all duration-200"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm font-medium">Edit</span>
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-red-400 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  )
}
