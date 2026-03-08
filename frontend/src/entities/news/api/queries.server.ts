import { createClient } from '@/shared/api/supabase/server'
import type { News } from '../model/types'

/**
 * Fetches all active news items, ordered by date descending.
 *
 * @returns Promise<News[]> Array of active news items
 * @throws Error if the Supabase query fails
 */
export async function getActiveNews(): Promise<News[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_active', true)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as News[]
}
