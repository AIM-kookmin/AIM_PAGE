import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_REQUIRED_PATHS = ['/profile', '/admin', '/pending']

function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Redirects must retain refreshed or cleared session cookies.
  const redirectWithCookies = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url))
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  if (user && isAuthRequiredPath(pathname)) {
    const { data: profile, error } = await supabase
      .from('member_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      const response = NextResponse.json(
        { error: '회원 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } }
      )
      supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
      return response
    }

    if (!profile) {
      return redirectWithCookies('/register')
    }

    if (profile.status === 'pending') {
      return pathname === '/pending' ? supabaseResponse : redirectWithCookies('/pending')
    }

    if (profile.status === 'rejected') {
      await supabase.auth.signOut()
      return redirectWithCookies('/login?error=rejected')
    }

    if (pathname === '/pending' && profile.status === 'active') {
      return redirectWithCookies('/profile')
    }
  }

  if (!user && isAuthRequiredPath(pathname)) {
    const next = encodeURIComponent(`${pathname}${request.nextUrl.search}`)
    return redirectWithCookies(`/login?next=${next}`)
  }

  return supabaseResponse
}
