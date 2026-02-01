import { Metadata } from 'next'
import {
  getAboutSections,
  getAboutActivities,
  getAboutHistory,
  getAboutContacts,
} from '@/shared/api/supabase/queries.server'
import AboutClient from './AboutClient'

export const revalidate = 60 // Revalidate every 60 seconds (ISR)

export const metadata: Metadata = {
  title: 'About - AIM (AI Monsters)',
  description: 'AIM (AI Monsters) 동아리 소개 페이지',
}

export default async function AboutPage() {
  // Fetch all data in parallel on the server
  const [sections, activities, history, contacts] = await Promise.all([
    getAboutSections(),
    getAboutActivities(),
    getAboutHistory(),
    getAboutContacts(),
  ])

  return (
    <AboutClient
      sections={sections}
      activities={activities}
      history={history}
      contacts={contacts}
    />
  )
}
