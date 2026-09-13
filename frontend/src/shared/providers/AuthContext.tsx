'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
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
    role: 'member',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [supabase] = useState(createClient)

  useEffect(() => {
    let revision = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const checkAdmin = async (userId: string, currentRevision: number) => {
      try {
        const [{ data: profile, error: profileError }, { data: admin, error: adminError }] = await Promise.all([
          supabase.from('member_profiles').select('status').eq('user_id', userId).maybeSingle(),
          supabase.rpc('is_admin'),
        ])

        if (currentRevision === revision) {
          setIsAdmin(!profileError && !adminError && profile?.status === 'active' && admin === true)
        }
      } catch (error) {
        console.error('Failed to check admin status:', error)
        if (currentRevision === revision) setIsAdmin(false)
      }
    }

    // INITIAL_SESSION initializes state. Keep Supabase queries outside the auth
    // callback so they do not wait on the auth lock held by this event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        const currentRevision = ++revision
        clearTimeout(timer)
        setSession(newSession)
        setUser(mapSupabaseUser(newSession?.user ?? null))
        setIsAdmin(false)
        setIsLoading(false)

        if (newSession?.user) {
          timer = setTimeout(() => {
            void checkAdmin(newSession.user.id, currentRevision)
          }, 0)
        }

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }
      }
    )

    return () => {
      revision++
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [supabase, router])

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
    user: user ? { ...user, role: isAdmin ? 'admin' : 'member' } : null,
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
