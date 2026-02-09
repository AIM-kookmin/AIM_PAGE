'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/api/supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
}

interface AuthContextType {
  user: User | null
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  /** Get current Supabase session (for API calls) */
  getSession: () => Promise<Session | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.user_metadata?.name ?? supabaseUser.email?.split('@')[0] ?? 'Unknown',
    role: supabaseUser.user_metadata?.role ?? 'member',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const checkProfileAndAdmin = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('member_profiles')
        .select('status, position')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Failed to check profile:', error)
        setIsAdmin(false)
        return
      }

      // 프로필이 없으면 → 미가입 상태 → /register로 리다이렉트
      if (!profile) {
        setIsAdmin(false)
        router.push('/register')
        return
      }

      // 가입 대기 중 → /pending으로 리다이렉트
      if (profile.status === 'pending') {
        setIsAdmin(false)
        router.push('/pending')
        return
      }

      // 거절된 계정 → 로그아웃
      if (profile.status === 'rejected') {
        setIsAdmin(false)
        try { await supabase.auth.signOut() } catch {}
        router.push('/login?error=rejected')
        return
      }

      // active 계정만 관리자 여부 체크
      const adminPositions = ['운영진', '관리자', '회장']
      setIsAdmin(profile.status === 'active' && adminPositions.includes(profile.position ?? ''))
    } catch (error) {
      console.error('Failed to check profile:', error)
      setIsAdmin(false)
    }
  }, [supabase, router])

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(mapSupabaseUser(initialSession?.user ?? null))

        // profile/admin 체크는 로딩을 막지 않도록 비동기로 실행
        if (initialSession?.user) {
          checkProfileAndAdmin(initialSession.user.id)
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(mapSupabaseUser(newSession?.user ?? null))

        if (newSession?.user) {
          checkProfileAndAdmin(newSession.user.id)
        } else {
          setIsAdmin(false)
        }

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    // 즉시 UI 상태 초기화
    setUser(null)
    setSession(null)
    setIsAdmin(false)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
    router.push('/')
    router.refresh()
  }, [supabase, router])

  const getSession = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    return currentSession
  }, [supabase])

  const value: AuthContextType = {
    user,
    logout,
    isAuthenticated: !!session && !!user,
    isAdmin,
    isLoading,
    getSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
