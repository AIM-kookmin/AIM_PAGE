'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users } from 'lucide-react'
import type { Study } from '@/types/database'
import StudyDetailModal from './components/StudyDetailModal'

interface StudiesClientProps {
  studies: Study[]
}

export default function StudiesClient({ studies }: StudiesClientProps) {
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null)

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="min-h-[50vh] flex items-center justify-center pt-20 px-4"
        >
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Studies
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AIM 부원들의 깊이 있는 학습 기록
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-8 rounded-full" />
          </div>
        </motion.section>

        {/* Studies List */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-24 px-4"
        >
          <div className="max-w-5xl mx-auto">
            {studies.length === 0 ? (
              <div className="text-center p-12 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-gray-500 text-lg">등록된 스터디가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studies.map((study) => (
                  <StudyListItem
                    key={study.id}
                    study={study}
                    onClick={() => setSelectedStudy(study)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>

      {/* Study Detail Modal */}
      <StudyDetailModal
        study={selectedStudy}
        isOpen={!!selectedStudy}
        onClose={() => setSelectedStudy(null)}
      />
    </div>
  )
}

interface StudyListItemProps {
  study: Study
  onClick: () => void
}

function StudyListItem({ study, onClick }: StudyListItemProps) {
  const getStatusBadge = (status: Study['status']) => {
    const badges = {
      recruiting: { text: '모집중', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
      active: { text: '진행중', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
      completed: { text: '완료', color: 'bg-gray-500/10 border-gray-500/20 text-gray-400' },
      cancelled: { text: '취소', color: 'bg-red-500/10 border-red-500/20 text-red-400' },
    }
    return badges[status]
  }

  const getDifficultyBadge = (level: Study['level']) => {
    const badges = {
      '입문': { text: '입문', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
      '중급': { text: '중급', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
      '심화': { text: '심화', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
      '응용': { text: '응용', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
    }
    return badges[level]
  }

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return null

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
      })
    }

    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    if (startDate) {
      return `${formatDate(startDate)} -`
    }
    return formatDate(endDate!)
  }

  const images = study.images && study.images.length > 0 ? study.images : [study.cover_url].filter((url): url is string => Boolean(url))
  const thumbnail = images.length > 0 ? images[0] : null
  const statusBadge = getStatusBadge(study.status)
  const difficultyBadge = getDifficultyBadge(study.level)
  const dateRange = formatDateRange(study.start_date, study.end_date)
  const participantCount = study.participants ? study.participants.length : 0

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group text-left"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-white/5 border border-white/5">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={study.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-violet-500/20 text-xl font-bold">AIM</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg md:text-xl font-bold text-white truncate group-hover:text-violet-300 transition-colors mb-1">
          {study.title}
        </h3>
        <div className="flex items-center gap-3 flex-wrap text-sm text-gray-400">
          {dateRange && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateRange}
            </span>
          )}
          {participantCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {participantCount}명
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusBadge.color}`}>
          {statusBadge.text}
        </span>
        <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${difficultyBadge.color}`}>
          {difficultyBadge.text}
        </span>
      </div>
    </button>
  )
}
