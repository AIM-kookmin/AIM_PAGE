'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthContext'
import { createClient } from '@/shared/api/supabase/client'
import { Button, Loading } from '@/shared/ui'
import type { MemberStatus } from '@/types/supabase'

export default function PendingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const supabase = createClient()
  
  const [status, setStatus] = useState<MemberStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<{
    displayName: string
    createdAt: string
  } | null>(null)

  useEffect(() => {
    document.title = '승인 대기 - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      if (authLoading) return
      
      if (!isAuthenticated || !user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('member_profiles')
        .select('status, display_name, created_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile) {
        router.push('/register')
        return
      }

      setStatus(profile.status as MemberStatus)
      setProfileData({
        displayName: profile.display_name,
        createdAt: profile.created_at
      })

      if (profile.status === 'active') {
        router.push('/profile')
      }

      setLoading(false)
    }

    checkStatus()
  }, [isAuthenticated, user, authLoading, router, supabase])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const refreshStatus = async () => {
    if (!user) return
    setLoading(true)
    
    const { data: profile } = await supabase
      .from('member_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.status === 'active') {
      router.push('/profile')
    } else if (profile) {
      setStatus(profile.status as MemberStatus)
    }
    
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading size="lg" text="상태 확인 중..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[20px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[15px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex text-2xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                AIM
              </span>
              <span className="ml-2 text-gray-400">AI Monsters</span>
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {status === 'pending' && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-5xl">⏳</span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    승인 대기 중
                  </h1>
                  <p className="text-gray-400">
                    <span className="text-violet-400 font-semibold">{profileData?.displayName}</span>님의 가입 요청이<br />
                    운영진 검토를 기다리고 있습니다.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">요청일</span>
                    <span className="text-gray-300">
                      {profileData?.createdAt && new Date(profileData.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">상태</span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                      검토 중
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  승인까지 보통 1-2일 정도 소요됩니다.<br />
                  문의사항은 <a href="mailto:aim@kookmin.ac.kr" className="text-violet-400 hover:underline">aim@kookmin.ac.kr</a>로 연락해주세요.
                </p>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={refreshStatus}
                    variant="primary"
                    className="w-full"
                  >
                    상태 새로고침
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full"
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            )}

            {status === 'rejected' && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-5xl">✕</span>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    가입이 승인되지 않았습니다
                  </h1>
                  <p className="text-gray-400">
                    죄송합니다. 가입 요청이 승인되지 않았습니다.<br />
                    자세한 내용은 운영진에게 문의해주세요.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <a
                    href="mailto:aim@kookmin.ac.kr"
                    className="block w-full px-4 py-3 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-semibold transition-all duration-300 text-center"
                  >
                    운영진에게 문의하기
                  </a>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full"
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
