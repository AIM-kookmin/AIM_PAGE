import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/shared/api/supabase/admin'
import type { Database } from '@/types/supabase'

const memberCreateSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  profile: z.object({
    display_name: z.string().min(1, '표시명은 필수입니다'),
    student_id: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    year: z.string().optional(),
    generation: z.number().optional(),
    bio: z.string().optional(),
    is_public: z.boolean().optional(),
    avatar_url: z.string().optional(),
    one_liner: z.string().optional(),
  })
})

async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase.rpc('is_admin')
  return data === true
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const parseResult = memberCreateSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => issue.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }
    
    const { email, password, profile } = parseResult.data

    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { data: profileData, error: profileError } = await getSupabaseAdmin()
      .from('member_profiles')
      .insert({
        ...profile,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      await getSupabaseAdmin().auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ user: authData.user, profile: profileData }, { status: 201 })
  } catch (error) {
    console.error('Member creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // First, get the member_profile id
    const { data: profile } = await getSupabaseAdmin()
      .from('member_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profile) {
      // Delete all study_posts authored by this member
      const { error: postsError } = await getSupabaseAdmin()
        .from('study_posts')
        .delete()
        .eq('author_id', profile.id)

      if (postsError) {
        console.error('Study posts deletion failed:', postsError)
        return NextResponse.json({ error: 'Failed to delete user posts' }, { status: 400 })
      }
    }

    // Delete member profile
    const { error: profileError } = await getSupabaseAdmin()
      .from('member_profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      console.error('Profile deletion failed:', profileError)
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 400 })
    }

    // Delete auth user
    const { error: authError } = await getSupabaseAdmin().auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth user deletion failed:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Member deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
