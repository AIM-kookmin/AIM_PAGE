'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { APP_NAME } from '@/lib/config'
import { useAuth } from '@/app/providers/AuthContext'
import { createClient } from '@/shared/api/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.title = `Login - ${APP_NAME}`

    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam === 'rejected') {
      setError('가입이 승인되지 않았습니다. 운영진에게 문의해주세요.')
    } else if (errorParam === 'auth_failed') {
      setError('인증에 실패했습니다. 다시 시도해주세요.')
    }
  }, [])

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading || !user) return

      const { data: profile } = await supabase
        .from('member_profiles')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile) {
        router.push('/register')
      } else if (profile.status === 'pending') {
        router.push('/pending')
      } else if (profile.status === 'active') {
        router.push('/')
      }
    }

    checkUserStatus()
  }, [user, authLoading, router, supabase])

  const handleGoogleLogin = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError('Google 로그인에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message || '로그인에 실패했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(30%, 30%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-center py-12 px-4 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center mb-8">
            <span className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              AIM
            </span>
          </Link>
          <h1 className="text-center text-3xl font-bold text-white mb-2">
            로그인
          </h1>
          <p className="text-center text-gray-500">
            AIM 부원이신가요?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors">
              회원가입
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-600">또는</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="your.email@kookmin.ac.kr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              문의:{' '}
              <a href="mailto:aim.club@kookmin.ac.kr" className="text-violet-400 hover:text-violet-300">
                aim.club@kookmin.ac.kr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
