export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      about_sections: {
        Row: {
          id: string
          title: string
          content: string
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_activities: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          color: string
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          color: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          color?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_history: {
        Row: {
          id: string
          year: number
          title: string
          description: string
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          title: string
          description: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          title?: string
          description?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_contacts: {
        Row: {
          id: string
          type: string
          label: string
          value: string
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          label: string
          value: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          label?: string
          value?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recruit_notices: {
        Row: {
          id: string
          title: string
          body_md: string
          start_at: string
          end_at: string
          is_open: boolean
          external_form_url: string | null
          target_audience: string | null
          recruit_count: string | null
          recruit_method: string | null
          short_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body_md: string
          start_at: string
          end_at: string
          is_open?: boolean
          external_form_url?: string | null
          target_audience?: string | null
          recruit_count?: string | null
          recruit_method?: string | null
          short_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body_md?: string
          start_at?: string
          end_at?: string
          is_open?: boolean
          external_form_url?: string | null
          target_audience?: string | null
          recruit_count?: string | null
          recruit_method?: string | null
          short_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          student_id: string | null
          position: string | null
          department: string | null
          year: string | null
          generation: number | null
          bio: string | null
          one_liner: string | null
          avatar_url: string | null
          links: Json | null
          is_public: boolean
          status: 'pending' | 'active' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          student_id?: string | null
          position?: string | null
          department?: string | null
          year?: string | null
          generation?: number | null
          bio?: string | null
          one_liner?: string | null
          avatar_url?: string | null
          links?: Json | null
          is_public?: boolean
          status?: 'pending' | 'active' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          student_id?: string | null
          position?: string | null
          department?: string | null
          year?: string | null
          generation?: number | null
          bio?: string | null
          one_liner?: string | null
          avatar_url?: string | null
          links?: Json | null
          is_public?: boolean
          status?: 'pending' | 'active' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          title: string
          category: string
          date: string
          description: string | null
          gallery_urls: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          date: string
          description?: string | null
          gallery_urls?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          date?: string
          description?: string | null
          gallery_urls?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      study_posts: {
        Row: {
          id: string
          study_id: string | null
          author_id: string
          title: string
          content_md: string
          cover_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id?: string | null
          author_id: string
          title: string
          content_md: string
          cover_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          study_id?: string | null
          author_id?: string
          title?: string
          content_md?: string
          cover_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      study_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "study_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      member_status: 'pending' | 'active' | 'rejected'
    }
    CompositeTypes: Record<string, never>
  }
}

export type MemberStatus = 'pending' | 'active' | 'rejected'

export type AboutSection = Database['public']['Tables']['about_sections']['Row']
export type AboutActivity = Database['public']['Tables']['about_activities']['Row']
export type AboutHistory = Database['public']['Tables']['about_history']['Row']
export type AboutContact = Database['public']['Tables']['about_contacts']['Row']
export type RecruitNotice = Database['public']['Tables']['recruit_notices']['Row']
export type MemberProfile = Database['public']['Tables']['member_profiles']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type StudyPost = Database['public']['Tables']['study_posts']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']

export interface StudyPostWithAuthor extends StudyPost {
  author: MemberProfile | null
  tags: Array<{ tag: { id: string; name: string } }>
}
