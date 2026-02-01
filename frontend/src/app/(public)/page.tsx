import { createClient } from '@/shared/api/supabase/server'
import HomeClient from './HomeClient'

// ✅ Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
export const revalidate = 60

async function getHomePageData() {
  const supabase = await createClient()

  // ✅ Parallel fetching - all queries execute simultaneously
  const [
    { data: heroSections },
    { data: activities },
    { data: achievementsData }
  ] = await Promise.all([
    supabase
      .from('about_sections')
      .select('*')
      .eq('is_active', true)
      .order('order')
      .limit(1)
      .single(),
    supabase
      .from('about_activities')
      .select('*')
      .eq('is_active', true)
      .order('order'),
    supabase
      .from('about_history')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false })
  ])

  // Transform achievements to match expected type
  interface AchievementItem {
    id: string
    year: number
    title: string
    description: string
    category?: string
  }
  const achievements = (achievementsData || []).map((item: AchievementItem) => ({
    id: item.id,
    year: item.year,
    title: item.title,
    description: item.description,
    category: (item.category || 'milestone') as 'award' | 'event' | 'milestone',
  }))

  return {
    heroData: heroSections ? {
      title: 'AIM',
      subtitle: 'AI Monsters',
      description: heroSections.content,
      badge: heroSections.title,
    } : undefined,
    activities: activities || [],
    achievements,
  }
}

export default async function HomePage() {
  const { heroData, activities, achievements } = await getHomePageData()

  return (
    <HomeClient
      heroData={heroData}
      activities={activities}
      achievements={achievements}
    />
  )
}
