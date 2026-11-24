import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, StudyPostWithAuthor } from '@/types/supabase'

/** Resolve auth user IDs to visible profiles; study_posts has no profile FK. */
export async function withStudyPostAuthors(
  supabase: SupabaseClient<Database>,
  posts: Omit<StudyPostWithAuthor, 'author'>[]
): Promise<StudyPostWithAuthor[]> {
  if (!posts.length) return []

  const authorIds = Array.from(new Set(posts.map(post => post.author_id)))
  const { data: profiles, error } = await supabase
    .from('member_profiles')
    .select('id, user_id, display_name, avatar_url')
    .in('user_id', authorIds)

  if (error) throw error
  const profileMap = new Map((profiles ?? []).map(({ user_id, ...profile }) => [user_id, profile]))
  return posts.map(post => ({ ...post, author: profileMap.get(post.author_id) ?? null }))
}
