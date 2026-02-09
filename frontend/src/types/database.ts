/**
 * Database Type Definitions
 * Auto-generated types for Supabase tables
 */

// ============================================================================
// Activities
// ============================================================================

export interface Activity {
  id: string
  title: string
  category: 'competition' | 'seminar' | 'workshop' | 'project' | 'social' | 'etc'
  date: string // YYYY-MM-DD
  description: string | null
  image_url: string | null
  gallery_urls: string[] | null // JSON array of image URLs
  link: string | null
  is_active: boolean
  order: number
  location: string | null
  participants: number | null
  organizer: string | null
  created_at: string
  updated_at: string
}

export interface ActivityInsert {
  title: string
  category: Activity['category']
  date: string
  description?: string
  image_url?: string
  gallery_urls?: string[]
  link?: string
  is_active?: boolean
  order?: number
  location?: string
  participants?: number
  organizer?: string
}

export interface ActivityUpdate {
  title?: string
  category?: Activity['category']
  date?: string
  description?: string
  image_url?: string
  gallery_urls?: string[]
  link?: string
  is_active?: boolean
  order?: number
  location?: string
  participants?: number
  organizer?: string
}

// ============================================================================
// Studies
// ============================================================================

export interface Study {
  id: string
  title: string
  description: string | null
  status: 'recruiting' | 'active' | 'completed' | 'cancelled'
  visibility: 'public' | 'private' | 'members_only'
  start_date: string | null
  end_date: string | null
  max_members: number
  current_members: number
  is_recruiting: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  level: '입문' | '중급' | '심화' | '응용' // Korean difficulty level
  schedule: string | null
  meeting_type: 'offline' | 'online' | 'hybrid'
  cover_url: string | null
  syllabus: string | null
  prerequisites: string | null
  order: number
  created_by: string | null
  images: string[] | null // Array of image URLs
  participants: string[] | null // Array of member names
  link: string | null // External link
  content: string | null // Study content/description
  created_at: string
  updated_at: string
}

export interface StudyInsert {
  title: string
  description?: string
  status?: Study['status']
  visibility?: Study['visibility']
  start_date?: string
  end_date?: string
  max_members?: number
  is_recruiting?: boolean
  difficulty?: Study['difficulty']
  level?: Study['level']
  schedule?: string
  meeting_type?: Study['meeting_type']
  cover_url?: string
  syllabus?: string
  prerequisites?: string
  order?: number
  created_by?: string
  images?: string[]
  participants?: string[]
  link?: string
  content?: string
}

export interface StudyUpdate {
  title?: string
  description?: string
  status?: Study['status']
  visibility?: Study['visibility']
  start_date?: string
  end_date?: string
  max_members?: number
  is_recruiting?: boolean
  difficulty?: Study['difficulty']
  level?: Study['level']
  schedule?: string
  meeting_type?: Study['meeting_type']
  cover_url?: string
  syllabus?: string
  prerequisites?: string
  order?: number
  images?: string[]
  participants?: string[]
  link?: string
  content?: string
}

// ============================================================================
// Study Posts
// ============================================================================

export interface StudyPost {
  id: string
  study_id: string | null
  author_id: string
  title: string
  content_md: string
  excerpt: string | null
  cover_url: string | null
  status: 'draft' | 'published' | 'archived'
  read_time: number
  view_count: number
  like_count: number
  order: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface StudyPostInsert {
  study_id?: string
  author_id: string
  title: string
  content_md: string
  excerpt?: string
  cover_url?: string
  status?: StudyPost['status']
  order?: number
}

export interface StudyPostUpdate {
  study_id?: string
  title?: string
  content_md?: string
  excerpt?: string
  cover_url?: string
  status?: StudyPost['status']
  order?: number
}

export interface StudyPostWithAuthor extends StudyPost {
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  tags: Array<{
    tag: {
      id: string
      name: string
    }
  }>
}

// ============================================================================
// Tags
// ============================================================================

export interface Tag {
  id: string
  name: string
}

export interface TagInsert {
  name: string
}

// ============================================================================
// Study Members
// ============================================================================

export interface StudyMember {
  id: string
  study_id: string
  member_id: string
  role: 'leader' | 'member'
  status: 'active' | 'inactive' | 'completed'
  joined_at: string
  left_at: string | null
  notes: string | null
}

export interface StudyMemberInsert {
  study_id: string
  member_id: string
  role?: StudyMember['role']
  status?: StudyMember['status']
  notes?: string
}

export interface StudyMemberUpdate {
  role?: StudyMember['role']
  status?: StudyMember['status']
  left_at?: string
  notes?: string
}

export interface StudyMemberWithProfile extends StudyMember {
  member_profile: {
    id: string
    display_name: string
    avatar_url: string | null
    position: string | null
    generation: number | null
  }
}
