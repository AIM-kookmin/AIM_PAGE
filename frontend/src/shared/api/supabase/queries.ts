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

type Tables = Database['public']['Tables']
type MemberProfileUpdate = Tables['member_profiles']['Update']
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

export async function getAllRecruitNotices(): Promise<RecruitNotice[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recruit_notices')
    .select('*')
    .order('created_at', { ascending: false })

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
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
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

export async function getAllMembersAdmin(): Promise<MemberProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .order('created_at', { ascending: false })

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
