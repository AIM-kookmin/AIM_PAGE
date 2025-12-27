'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthContext'
import { createClient } from '@/shared/api/supabase/client'
import { Button, Loading } from '@/shared/ui'

interface FormData {
  displayName: string
  studentId: string
  department: string
  year: string
  generation: string
  bio: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [step, setStep] = useState<'check' | 'form' | 'complete'>('check')
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    studentId: '',
    department: '',
    year: '',
    generation: '',
    bio: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Register - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return
      
      if (!isAuthenticated || !user) {
        setStep('check')
        return
      }

      const { data: profile } = await supabase
        .from('member_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile) {
        if (profile.status === 'pending') {
          router.push('/pending')
        } else if (profile.status === 'active') {
          router.push('/profile')
        }
      } else {
        setFormData(prev => ({
          ...prev,
          displayName: user.name || ''
        }))
        setStep('form')
      }
    }

    checkProfile()
  }, [isAuthenticated, user, authLoading, router, supabase])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register`
      }
    })
    if (error) {
      setError('Google 로그인에 실패했습니다.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('member_profiles')
        .insert({
          user_id: user.id,
          display_name: formData.displayName,
          student_id: formData.studentId,
          department: formData.department,
          year: formData.year,
          generation: formData.generation ? parseInt(formData.generation) : null,
          bio: formData.bio,
          status: 'pending',
          is_public: true
        })

      if (insertError) throw insertError
      
      setStep('complete')
    } catch (err) {
      console.error('Registration error:', err)
      setError('가입 요청 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading size="lg" text="로딩 중..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center text-2xl font-bold text-white mb-8">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
              AIM
            </span>
            <span className="ml-2 text-gray-400">AI Monsters</span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {step === 'check' && '회원가입'}
            {step === 'form' && '추가 정보 입력'}
            {step === 'complete' && '가입 요청 완료'}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/5 backdrop-blur-xl py-8 px-4 border border-white/10 sm:rounded-2xl sm:px-10">
            
            {step === 'check' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-300 mb-6">
                    AIM 동아리 가입을 위해<br />
                    <span className="text-violet-400 font-semibold">국민대학교 Google 계정</span>으로 로그인해주세요.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 계속하기
                </button>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/login" className="text-primary-400 hover:text-primary-300">
                      로그인하기
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-6">
                  <p className="text-sm text-violet-300">
                    <span className="font-semibold">{user?.email}</span> 계정으로 로그인되었습니다.
                  </p>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-white mb-1">
                    이름 *
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-white mb-1">
                    학번 *
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                    placeholder="20241234"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-white mb-1">
                    학과 *
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                    placeholder="소프트웨어학부"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-white mb-1">
                      학년 *
                    </label>
                    <select
                      id="year"
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                    >
                      <option value="">선택</option>
                      <option value="1학년">1학년</option>
                      <option value="2학년">2학년</option>
                      <option value="3학년">3학년</option>
                      <option value="4학년">4학년</option>
                      <option value="대학원생">대학원생</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="generation" className="block text-sm font-medium text-white mb-1">
                      기수 *
                    </label>
                    <input
                      id="generation"
                      name="generation"
                      type="number"
                      required
                      min="1"
                      value={formData.generation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-white mb-1">
                    자기소개 (선택)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none"
                    placeholder="간단한 자기소개를 입력해주세요"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '요청 중...' : '가입 요청하기'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  가입 요청 후 운영진의 승인을 거쳐 활동할 수 있습니다.
                </p>
              </form>
            )}

            {step === 'complete' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">✓</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">가입 요청이 완료되었습니다!</h3>
                  <p className="text-gray-400">
                    운영진의 승인 후 AIM 활동을 시작할 수 있습니다.<br />
                    승인까지 1-2일 정도 소요될 수 있습니다.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Link
                    href="/"
                    className="block w-full px-4 py-3 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-semibold transition-all duration-300 text-center"
                  >
                    홈으로 돌아가기
                  </Link>
                  <Link
                    href="/pending"
                    className="block w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all duration-300 text-center border border-white/10"
                  >
                    승인 대기 상태 확인
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
