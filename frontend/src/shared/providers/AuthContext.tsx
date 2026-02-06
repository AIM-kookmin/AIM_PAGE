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
  /** @deprecated Supabase handles tokens internally. Use getSession() if needed. */
  token: string | null
  /** @deprecated Use signIn methods instead */
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: Error | null }>
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
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(mapSupabaseUser(initialSession?.user ?? null))
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

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        return { error: new Error(error.message) }
      }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [supabase])

  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name ?? email.split('@')[0],
            role: 'member',
          },
        },
      })
      if (error) {
        return { error: new Error(error.message) }
      }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [supabase])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/')
  }, [supabase, router])

  const getSession = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    return currentSession
  }, [supabase])

  /** @deprecated Use signIn() instead */
  const login = useCallback((_token: string, newUser: User) => {
    console.warn('login() is deprecated. Use signIn() for Supabase authentication.')
    setUser(newUser)
  }, [])

  const value: AuthContextType = {
    user,
    token: session?.access_token ?? null,
    login,
    logout,
    signIn,
    signUp,
    isAuthenticated: !!session && !!user,
    isAdmin: user?.role === 'admin',
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
