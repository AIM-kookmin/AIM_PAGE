import { createClient } from './server'
import type {
  AboutSection,
  AboutActivity,
  AboutHistory,
  AboutContact,
  MemberProfile,
  Activity,
  StudyPostWithAuthor,
} from '@/types/supabase'

export async function getAboutSections(): Promise<AboutSection[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('about_sections')
    .select('id, title, content, order, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutActivities(): Promise<AboutActivity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('about_activities')
    .select('id, title, description, icon, color, order, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutHistory(): Promise<AboutHistory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('about_history')
    .select('id, year, title, description, order, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('year', { ascending: false })
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutContacts(): Promise<AboutContact[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('about_contacts')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getPublicMembers(): Promise<MemberProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('is_public', true)

  if (error) throw error
  return data ?? []
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

export async function getPublishedStudyPosts(): Promise<StudyPostWithAuthor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_posts')
    .select(`
      *,
      author:member_profiles!author_id(id, display_name, avatar_url),
      tags:study_post_tags(tag:tags(id, name))
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as StudyPostWithAuthor[]
}
