'use client'

import { Calendar, Users, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import type { Study } from '@/types/database'

interface StudyCardProps {
  study: Study
  onEdit: (study: Study) => void
  onDelete: (study: Study) => void
  formatDate: (dateString: string) => string
}

export default function StudyCard({
  study,
  onEdit,
  onDelete,
  formatDate
}: StudyCardProps) {
  const imageCount = study.images?.length || 0
  const participantCount = study.participants?.length || 0
  const firstImage = study.images?.[0]

  return (
    <div className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-violet-500/5">
      {/* Image */}
      <div className="relative aspect-video bg-white/5 overflow-hidden">
        {firstImage ? (
          <>
            <img
              src={firstImage}
              alt={study.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {imageCount > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-medium text-white">{imageCount}</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg backdrop-blur-sm text-xs font-medium ${
            study.status === 'active'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : study.status === 'completed'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : study.status === 'recruiting'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            {study.status === 'active' && '진행중'}
            {study.status === 'completed' && '완료'}
            {study.status === 'recruiting' && '모집중'}
            {study.status === 'cancelled' && '취소됨'}
          </div>
        </div>

        {/* Visibility Badge */}
        {study.visibility !== 'public' && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
            {study.visibility === 'private' ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-xs font-medium text-gray-300">비공개</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-xs font-medium text-gray-300">멤버만</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-violet-400 transition-colors duration-200">
          {study.title}
        </h3>

        {/* Description */}
        {study.content && (
          <p className="text-sm text-gray-400 line-clamp-2 whitespace-pre-line">
            {study.content}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/5">
          {/* Period */}
          {study.start_date && study.end_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {formatDate(study.start_date)} ~ {formatDate(study.end_date)}
              </span>
            </div>
          )}

          {/* Participants */}
          {participantCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Users className="w-3.5 h-3.5" />
              <span>{participantCount}명</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(study)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white transition-all duration-200 group/btn"
          >
            <Edit2 className="w-4 h-4 group-hover/btn:text-violet-400 transition-colors duration-200" />
            <span className="text-sm font-medium">수정</span>
          </button>
          <button
            onClick={() => onDelete(study)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 group/btn"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">삭제</span>
          </button>
        </div>
      </div>
    </div>
  )
}
