import type { Metadata } from 'next'
import { getActivities } from '@/shared/api/supabase/queries.server'
import ActivitiesClient from './ActivitiesClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Activities - AIM',
  description: 'AIM의 다양한 활동과 이벤트를 확인해보세요.',
}

export default async function ActivitiesPage() {
  const activities = await getActivities()

  return <ActivitiesClient activities={activities} />
}
