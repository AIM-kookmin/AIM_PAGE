import { createClient } from '@/shared/api/supabase/server'
import { getSafeRedirectPath } from '@/shared/lib/redirect'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const { data: profile, error: profileError } = await supabase
      .from('member_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.redirect(`${origin}/login?error=profile_failed`)
    }

    if (!profile) {
      return NextResponse.redirect(`${origin}/register`)
    }

    if (profile.status === 'pending') {
      return NextResponse.redirect(`${origin}/pending`)
    }

    if (profile.status === 'rejected') {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=rejected`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
