import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, StudyPostWithAuthor } from '@/types/supabase'
import { withStudyPostAuthors } from '../study-posts'

const query = { select: jest.fn().mockReturnThis(), in: jest.fn() }
const from = jest.fn(() => query)
const supabase = { from } as unknown as SupabaseClient<Database>
const posts: Omit<StudyPostWithAuthor, 'author'>[] = [
  { id: 'post-1', author_id: 'auth-user-1', tags: [] },
  { id: 'post-2', author_id: 'auth-user-1', tags: [] },
  { id: 'post-3', author_id: 'private-user', tags: [] },
].map(post => ({ ...post, study_id: null, title: 'Post', content_md: '', cover_url: null, status: 'published', created_at: '2026-01-01', updated_at: '2026-01-01' }))

beforeEach(() => jest.clearAllMocks())

it('joins on auth user IDs once and tolerates profiles hidden by RLS', async () => {
  query.in.mockResolvedValue({
    data: [{ id: 'different-profile-id', user_id: 'auth-user-1', display_name: 'AIM Member', avatar_url: null }],
    error: null,
  })
  const result = await withStudyPostAuthors(supabase, posts)
  expect(query.in).toHaveBeenCalledWith('user_id', ['auth-user-1', 'private-user'])
  expect(result[0].author).toEqual({ id: 'different-profile-id', display_name: 'AIM Member', avatar_url: null })
  expect(result[1].author).toEqual(result[0].author)
  expect(result[2].author).toBeNull()
})

it('skips profile lookups for an empty post list', async () => {
  expect(await withStudyPostAuthors(supabase, [])).toEqual([])
  expect(from).not.toHaveBeenCalled()
})

it('propagates database failures for the route error boundary', async () => {
  const error = new Error('Database unavailable')
  query.in.mockResolvedValue({ data: null, error })
  await expect(withStudyPostAuthors(supabase, posts)).rejects.toBe(error)
})
