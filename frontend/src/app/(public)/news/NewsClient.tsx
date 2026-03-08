'use client'

import { useState } from 'react'
import type { News } from '@/entities/news/model/types'
import { NewsHero } from '@/widgets/NewsHero'
import { NewsList } from '@/widgets/NewsList'
import { NewsDetailModal } from '@/widgets/NewsDetailModal'

interface NewsClientProps {
  news: News[]
}

export default function NewsClient({ news }: NewsClientProps) {
  const [selectedNews, setSelectedNews] = useState<News | null>(null)

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
        <NewsHero />
        <NewsList news={news} onNewsClick={(item) => setSelectedNews(item)} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>

      {/* News Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  )
}
