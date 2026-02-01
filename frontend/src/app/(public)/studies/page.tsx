import type { Metadata } from 'next'
import { getPublishedStudyPosts } from '@/shared/api/supabase/queries.server'
import StudiesClient from './StudiesClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Studies - AIM',
  description: 'AIM 부원들의 깊이 있는 학습 기록. 기술을 탐구하고 지식을 공유하는 공간입니다.',
}

export default async function StudiesPage() {
  const posts = await getPublishedStudyPosts()

  return <StudiesClient posts={posts} />
}
