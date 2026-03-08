import { createClient } from '@/shared/api/supabase/client'
import type { News, NewsInsert, NewsUpdate } from '../model/types'

export async function getAllNews(limit?: number): Promise<News[]> {
  const supabase = createClient()
  let query = supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as News[]
}

export async function getActiveNews(): Promise<News[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_active', true)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as News[]
}

export async function getNewsById(id: string): Promise<News | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as News | null
}

export async function createNews(newsData: NewsInsert): Promise<News> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('news') as any)
    .insert(newsData)
    .select()
    .single()

  if (error) throw error
  return data as News
}

export async function updateNews(id: string, updates: NewsUpdate): Promise<News> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('news') as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as News
}

export async function deleteNews(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) throw error
}
