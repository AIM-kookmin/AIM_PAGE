import { act, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/shared/api/supabase/client'
import { AuthProvider, useAuth } from '../AuthContext'

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }))

const router = { push: jest.fn(), refresh: jest.fn() }
const unsubscribe = jest.fn()
const profileQuery = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn() }
let emit: (event: AuthChangeEvent, session: Session | null) => void
const supabase = {
  auth: {
    onAuthStateChange: jest.fn(callback => {
      emit = callback
      return { data: { subscription: { unsubscribe } } }
    }),
    signOut: jest.fn(),
  },
  from: jest.fn(() => profileQuery),
  rpc: jest.fn(),
}
const session: Session = {
  access_token: 'test-token', refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer',
  user: { id: 'user-1', email: 'member@example.com', user_metadata: { role: 'admin' }, app_metadata: {}, aud: 'authenticated', created_at: '2026-01-01T00:00:00Z' },
}

function Consumer() {
  const { user, isLoading, isAdmin } = useAuth()
  return <div>{isLoading ? 'loading' : user ? `${user.role}:${isAdmin}` : 'anonymous'}</div>
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
  jest.mocked(useRouter).mockReturnValue(router as never)
  jest.mocked(createClient).mockReturnValue(supabase as never)
  profileQuery.maybeSingle.mockResolvedValue({ data: { status: 'active' }, error: null })
  supabase.rpc.mockResolvedValue({ data: true, error: null })
})

afterEach(() => jest.useRealTimers())

it('initializes anonymously and unsubscribes on unmount', () => {
  const { unmount } = render(<AuthProvider><Consumer /></AuthProvider>)
  act(() => emit('INITIAL_SESSION', null))
  expect(screen.getByText('anonymous')).toBeInTheDocument()
  unmount()
  expect(unsubscribe).toHaveBeenCalledTimes(1)
})

it('defers database calls outside the auth callback and ignores metadata roles', async () => {
  render(<AuthProvider><Consumer /></AuthProvider>)
  act(() => emit('INITIAL_SESSION', session))
  expect(screen.getByText('member:false')).toBeInTheDocument()
  expect(supabase.from).not.toHaveBeenCalled()
  await act(async () => { jest.runOnlyPendingTimers() })
  expect(screen.getByText('admin:true')).toBeInTheDocument()
})

it.each([null, { status: 'pending' }, { status: 'rejected' }])(
  'allows public browsing without forced onboarding redirects: %s', async profile => {
    profileQuery.maybeSingle.mockResolvedValue({ data: profile, error: null })
    render(<AuthProvider><Consumer /></AuthProvider>)
    act(() => emit('INITIAL_SESSION', session))
    await act(async () => { jest.runOnlyPendingTimers() })
    expect(screen.getByText('member:false')).toBeInTheDocument()
    expect(router.push).not.toHaveBeenCalled()
  }
)

it('ignores an old admin lookup that finishes after logout', async () => {
  let resolveAdmin!: (value: { data: boolean; error: null }) => void
  supabase.rpc.mockReturnValue(new Promise(resolve => { resolveAdmin = resolve }))
  render(<AuthProvider><Consumer /></AuthProvider>)
  act(() => emit('INITIAL_SESSION', session))
  await act(async () => { jest.runOnlyPendingTimers() })
  act(() => emit('SIGNED_OUT', null))
  await act(async () => { resolveAdmin({ data: true, error: null }) })
  expect(screen.getByText('anonymous')).toBeInTheDocument()
})
