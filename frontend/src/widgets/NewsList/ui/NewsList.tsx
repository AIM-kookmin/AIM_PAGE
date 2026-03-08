'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import type { News, NewsCategory } from '@/entities/news/model/types'

const ALL_FILTER = '전체' as const
const CATEGORY_FILTERS: (typeof ALL_FILTER | NewsCategory)[] = ['전체', '공지', '행사', '성과', '소식', '기타']

interface NewsListProps {
  news: News[]
  onNewsClick: (news: News) => void
}

export default function NewsList({ news, onNewsClick }: NewsListProps) {
  const [activeFilter, setActiveFilter] = useState<typeof ALL_FILTER | NewsCategory>('전체')

  const filteredNews = activeFilter === '전체'
    ? news
    : news.filter((item) => item.category === activeFilter)

  const getCategoryColor = (category: NewsCategory) => {
    const colors: Record<NewsCategory, string> = {
      '공지': 'bg-red-500/10 border-red-500/20 text-red-400',
      '행사': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      '성과': 'bg-green-500/10 border-green-500/20 text-green-400',
      '소식': 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      '기타': 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    }
    return colors[category]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      className="py-24 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center p-12 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-gray-500 text-lg">등록된 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => onNewsClick(item)}
                className="group text-left rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:bg-white/[0.04] hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-white/5 overflow-hidden">
                  {item.thumbnail_url || (item.card_images && item.card_images.length > 0) ? (
                    <img
                      src={item.thumbnail_url || item.card_images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-violet-500/20 text-2xl font-bold">AIM</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Link indicator */}
                  {item.link && (
                    <div className="absolute top-3 right-3">
                      <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                        <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}
                  {item.card_images && item.card_images.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="flex -space-x-1">
                        {item.card_images.slice(0, 3).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded bg-white/10 border border-white/20"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.card_images.length}장의 카드
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}
