import type { Metadata } from 'next'
import { getActiveNews } from '@/entities/news/api/queries.server'
import NewsClient from './NewsClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News - AIM',
  description: 'AI Monsters의 최신 소식과 활동을 확인하세요.',
}

export default async function NewsPage() {
  const news = await getActiveNews()

  return <NewsClient news={news} />
}
