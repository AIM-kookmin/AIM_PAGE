/** @jest-environment node */

import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { updateSession } from '../middleware'

jest.mock('@supabase/ssr', () => ({ createServerClient: jest.fn() }))

interface SessionCookie {
  name: string
  value: string
  options?: { path?: string; maxAge?: number; httpOnly?: boolean }
}

const query = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
}
const supabase = {
  auth: { getUser: jest.fn(), signOut: jest.fn() },
  from: jest.fn(() => query),
}
let writeCookies: (cookies: SessionCookie[]) => void

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(createServerClient).mockImplementation((_url, _key, options) => {
    writeCookies = (options?.cookies as { setAll: typeof writeCookies }).setAll
    return supabase as never
  })
  supabase.auth.getUser.mockImplementation(async () => {
    writeCookies([{ name: 'session', value: 'refreshed', options: { path: '/', httpOnly: true } }])
    return { data: { user: { id: 'user-1' } }, error: null }
  })
  supabase.auth.signOut.mockImplementation(async () => {
    writeCookies([{ name: 'session', value: '', options: { path: '/', maxAge: 0 } }])
    return { error: null }
  })
  query.maybeSingle.mockResolvedValue({ data: { status: 'active' }, error: null })
})

const request = (path: string) => new NextRequest(`https://aim.example${path}`)

it('preserves the requested URL and refreshed cookies when login is required', async () => {
  supabase.auth.getUser.mockImplementation(async () => {
    writeCookies([{ name: 'session', value: '', options: { path: '/', maxAge: 0 } }])
    return { data: { user: null }, error: null }
  })
  const response = await updateSession(request('/admin/news-management?view=list'))
  const location = new URL(response.headers.get('location')!)
  expect(location.pathname).toBe('/login')
  expect(location.searchParams.get('next')).toBe('/admin/news-management?view=list')
  expect(response.cookies.get('session')?.maxAge).toBe(0)
})

it('keeps session refresh cookies when redirecting an unregistered user', async () => {
  query.maybeSingle.mockResolvedValue({ data: null, error: null })
  const response = await updateSession(request('/profile'))
  expect(response.headers.get('location')).toBe('https://aim.example/register')
  expect(response.cookies.get('session')).toMatchObject({ value: 'refreshed', httpOnly: true })
  expect(response.headers.get('cache-control')).toContain('no-store')
})

it('preserves cleared cookies when rejecting a signed-in account', async () => {
  query.maybeSingle.mockResolvedValue({ data: { status: 'rejected' }, error: null })
  const response = await updateSession(request('/admin'))
  expect(response.headers.get('location')).toBe('https://aim.example/login?error=rejected')
  expect(response.cookies.get('session')).toMatchObject({ value: '', maxAge: 0 })
})

it('sends pending members to the pending page without a redirect loop', async () => {
  query.maybeSingle.mockResolvedValue({ data: { status: 'pending' }, error: null })
  const protectedResponse = await updateSession(request('/profile'))
  expect(protectedResponse.headers.get('location')).toBe('https://aim.example/pending')
  const pendingResponse = await updateSession(request('/pending'))
  expect(pendingResponse.headers.get('location')).toBeNull()
})

it('returns approved members from the pending page to their profile', async () => {
  const response = await updateSession(request('/pending'))
  expect(response.headers.get('location')).toBe('https://aim.example/profile')
})

it('reports a profile lookup failure without pretending the user is unregistered', async () => {
  query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'Database unavailable' } })
  const response = await updateSession(request('/profile'))
  expect(response.status).toBe(503)
  expect(response.headers.get('location')).toBeNull()
  expect(response.cookies.get('session')?.value).toBe('refreshed')
})

it.each(['/about', '/news', '/administrator', '/profile-picture'])(
  'keeps public paths accessible: %s', async path => {
    const response = await updateSession(request(path))
    expect(response.headers.get('location')).toBeNull()
    expect(supabase.from).not.toHaveBeenCalled()
  }
)
