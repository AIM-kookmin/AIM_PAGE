import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_REQUIRED_PATHS = ['/profile', '/admin']

function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PATHS.some(path => pathname.startsWith(path))
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

  if (pathname === '/pending') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  if (user && isAuthRequiredPath(pathname)) {
    const { data: profile } = await supabase
      .from('member_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.redirect(new URL('/register', request.url))
    }

    if (profile.status === 'pending') {
      return NextResponse.redirect(new URL('/pending', request.url))
    }

    if (profile.status === 'rejected') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=rejected', request.url))
    }
  }

  if (!user && isAuthRequiredPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
