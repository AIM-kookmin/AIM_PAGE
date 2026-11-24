import 'server-only'

import { cache } from 'react'
import { createClient } from './server'
import { withStudyPostAuthors } from './study-posts'
import type {
  AboutSection,
  AboutActivity,
  AboutHistory,
  AboutContact,
  MemberProfile,
  Activity,
  StudyPostWithAuthor,
} from '@/types/supabase'
import type { Study } from '@/types/database'

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
    .eq('status', 'active')

  if (error) throw error
  return data ?? []
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('date', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

/**
 * Fetches all published study posts with author information and tags.
 *
 * @returns Promise<StudyPostWithAuthor[]> Array of published study posts with nested author and tags data
 * @throws Error if the Supabase query fails or if data validation fails
 *
 * @example
 * const posts = await getPublishedStudyPosts()
 * // posts[0].author.display_name
 * // posts[0].tags[0].tag.name
 */
export async function getPublishedStudyPosts(): Promise<StudyPostWithAuthor[]> {
  const supabase = await createClient()

  // Fetch study posts first
  const { data: posts, error: postsError } = await supabase
    .from('study_posts')
    .select(`
      *,
      tags:study_post_tags(tag:tags(id, name))
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (postsError) throw postsError
  if (!Array.isArray(posts) || posts.length === 0) {
    return []
  }

  return withStudyPostAuthors(supabase, posts as Omit<StudyPostWithAuthor, 'author'>[])
}

/** Load a public post once per request for both metadata and page rendering. */
export const getStudyPostById = cache(async (id: string): Promise<StudyPostWithAuthor | null> => {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_posts')
    .select('*, tags:study_post_tags(tag:tags(id, name))')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  const [post] = await withStudyPostAuthors(supabase, [data as Omit<StudyPostWithAuthor, 'author'>])
  return post
})

/**
 * Fetches all published studies.
 *
 * @returns Promise<Study[]> Array of published studies
 * @throws Error if the Supabase query fails
 *
 * @example
 * const studies = await getPublishedStudies()
 */
export async function getPublishedStudies(): Promise<Study[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('visibility', 'public')
    .in('status', ['active', 'completed', 'recruiting'])
    .order('start_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Study[]
}
