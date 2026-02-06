import { createClient } from './client'
import type {
  Database,
  AboutSection,
  AboutActivity,
  AboutHistory,
  AboutContact,
  RecruitNotice,
  MemberProfile,
  Activity,
  StudyPostWithAuthor,
} from '@/types/supabase'
import type { Study, StudyInsert, StudyUpdate } from '@/types/database'

type Tables = Database['public']['Tables']
type RecruitNoticeInsert = Tables['recruit_notices']['Insert']
type RecruitNoticeUpdate = Tables['recruit_notices']['Update']
type AboutSectionInsert = Tables['about_sections']['Insert']
type AboutSectionUpdate = Tables['about_sections']['Update']
type AboutActivityInsert = Tables['about_activities']['Insert']
type AboutActivityUpdate = Tables['about_activities']['Update']
type AboutHistoryInsert = Tables['about_history']['Insert']
type AboutHistoryUpdate = Tables['about_history']['Update']
type AboutContactInsert = Tables['about_contacts']['Insert']
type AboutContactUpdate = Tables['about_contacts']['Update']
type ActivityInsert = Tables['activities']['Insert']
type ActivityUpdate = Tables['activities']['Update']

interface OrderUpdate {
  id: string
  order: number
}

export async function getAboutSections(): Promise<AboutSection[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutActivities(): Promise<AboutActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_activities')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutHistory(): Promise<AboutHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_history')
    .select('*')
    .eq('is_active', true)
    .order('year', { ascending: false })
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAboutContacts(): Promise<AboutContact[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_contacts')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getActiveRecruitNotice(): Promise<RecruitNotice | null> {
  const supabase = createClient()
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('recruit_notices')
    .select('*')
    .eq('is_open', true)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAllRecruitNotices(limit?: number): Promise<RecruitNotice[]> {
  const supabase = createClient()
  let query = supabase
    .from('recruit_notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getRecruitNoticeById(id: string): Promise<RecruitNotice | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recruit_notices')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getPublicMembers(): Promise<MemberProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('is_public', true)
    .order('generation', { ascending: true })
    .order('display_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getMemberById(id: string): Promise<MemberProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllActivities(limit?: number): Promise<Activity[]> {
  const supabase = createClient()
  let query = supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function createActivity(
  data: ActivityInsert
): Promise<Activity> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('activities')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateActivity(
  id: string,
  updates: ActivityUpdate
): Promise<Activity | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getPublishedStudyPosts(): Promise<StudyPostWithAuthor[]> {
  const supabase = createClient()
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

export async function getStudyPostById(id: string): Promise<StudyPostWithAuthor | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_posts')
    .select(`
      *,
      author:member_profiles!author_id(id, display_name, avatar_url),
      tags:study_post_tags(tag:tags(id, name))
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as StudyPostWithAuthor | null
}

export async function getMyProfile(): Promise<MemberProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateMemberProfile(
  userId: string,
  updates: Partial<MemberProfile>
): Promise<MemberProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllMembersAdmin(limit?: number): Promise<MemberProfile[]> {
  const supabase = createClient()
  let query = supabase
    .from('member_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getRecentMembersAdmin(limit: number = 5): Promise<MemberProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function adminUpdateMember(
  id: string,
  updates: Partial<MemberProfile>
): Promise<MemberProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminDeleteMember(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('member_profiles')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAdminDashboardStats(): Promise<{
  totalMembers: number
  totalActivities: number
  totalStudies: number
}> {
  const supabase = createClient()
  
  const [membersResult, activitiesResult, studiesResult] = await Promise.all([
    supabase.from('member_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('activities').select('id', { count: 'exact', head: true }),
    supabase.from('study_posts').select('id', { count: 'exact', head: true }),
  ])

  return {
    totalMembers: membersResult.count ?? 0,
    totalActivities: activitiesResult.count ?? 0,
    totalStudies: studiesResult.count ?? 0,
  }
}



export async function createRecruitNotice(
  data: RecruitNoticeInsert
): Promise<RecruitNotice> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('recruit_notices')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateRecruitNotice(
  id: string,
  updates: RecruitNoticeUpdate
): Promise<RecruitNotice | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recruit_notices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRecruitNotice(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('recruit_notices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllAboutSections(): Promise<AboutSection[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAboutSection(
  data: AboutSectionInsert
): Promise<AboutSection> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('about_sections')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateAboutSection(
  id: string,
  updates: AboutSectionUpdate
): Promise<AboutSection | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_sections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAboutSection(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('about_sections')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllAboutActivities(): Promise<AboutActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_activities')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAboutActivity(
  data: AboutActivityInsert
): Promise<AboutActivity> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('about_activities')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateAboutActivity(
  id: string,
  updates: AboutActivityUpdate
): Promise<AboutActivity | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_activities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAboutActivity(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('about_activities')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllAboutHistory(): Promise<AboutHistory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_history')
    .select('*')
    .order('year', { ascending: false })
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAboutHistoryItem(
  data: AboutHistoryInsert
): Promise<AboutHistory> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('about_history')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateAboutHistoryItem(
  id: string,
  updates: AboutHistoryUpdate
): Promise<AboutHistory | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_history')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAboutHistoryItem(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('about_history')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllAboutContacts(): Promise<AboutContact[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_contacts')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAboutContact(
  data: AboutContactInsert
): Promise<AboutContact> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('about_contacts')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateAboutContact(
  id: string,
  updates: AboutContactUpdate
): Promise<AboutContact | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('about_contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAboutContact(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('about_contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getPendingMembers(): Promise<MemberProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function approveMember(id: string): Promise<MemberProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectMember(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('member_profiles')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function getActiveMembers(): Promise<MemberProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ============================================================================
// Studies Management
// ============================================================================

export async function getAllStudies(limit?: number): Promise<Study[]> {
  const supabase = createClient()
  let query = supabase
    .from('studies')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as Study[]
}

export async function getActiveStudies(): Promise<Study[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as Study[]
}

export async function getStudyById(id: string): Promise<Study | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Study | null
}

export async function createStudy(studyData: StudyInsert): Promise<Study> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('studies')
    .insert(studyData)
    .select()
    .single()

  if (error) throw error
  return data as Study
}

export async function updateStudy(id: string, updates: StudyUpdate): Promise<Study> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('studies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Study
}

export async function deleteStudy(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('studies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// Batch Order Updates
// ============================================================================

export async function updateAboutSectionsOrder(
  updates: OrderUpdate[]
): Promise<void> {
  const supabase = createClient()

  const promises = updates.map(({ id, order }) =>
    supabase
      .from('about_sections')
      .update({ order, updated_at: new Date().toISOString() })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw error
}

export async function updateAboutActivitiesOrder(
  updates: OrderUpdate[]
): Promise<void> {
  const supabase = createClient()

  const promises = updates.map(({ id, order }) =>
    supabase
      .from('about_activities')
      .update({ order, updated_at: new Date().toISOString() })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw error
}

export async function updateAboutHistoryOrder(
  updates: OrderUpdate[]
): Promise<void> {
  const supabase = createClient()

  const promises = updates.map(({ id, order }) =>
    supabase
      .from('about_history')
      .update({ order, updated_at: new Date().toISOString() })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw error
}

export async function updateAboutContactsOrder(
  updates: OrderUpdate[]
): Promise<void> {
  const supabase = createClient()

  const promises = updates.map(({ id, order }) =>
    supabase
      .from('about_contacts')
      .update({ order, updated_at: new Date().toISOString() })
      .eq('id', id)
  )

  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw error
}
