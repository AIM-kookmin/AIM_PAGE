'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Github, Linkedin, Instagram, Globe } from 'lucide-react'
import { Button, Card, Text, Title, Subtitle, Loading } from '@/shared/ui'
import { useAuth } from '@/shared/providers/AuthContext'
import { getMyProfile, updateMemberProfile } from '@/shared/api/supabase'
import { APP_NAME } from '@/lib/config'
import {
  normalizeGitHub,
  normalizeLinkedIn,
  normalizeInstagram,
  normalizeBlog,
  validateGitHub,
  validateLinkedIn,
  validateInstagram,
  validateBlog,
  type MemberLinks
} from '@/shared/lib/socialLinks'

interface ProfileData {
  displayName: string
  studentId: string
  position: string
  department: string
  generation: number
  bio: string
  isPublic: boolean
  links: MemberLinks
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    studentId: '',
    position: '',
    department: '',
    generation: 0,
    bio: '',
    isPublic: true,
    links: { github: '', linkedin: '', instagram: '', blog: '' }
  })

  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    hiding?: boolean
  }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    hiding: false
  })

  useEffect(() => {
    document.title = `프로필 - ${APP_NAME}`
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      alert('로그인이 필요합니다.')
      router.push('/login')
    } else if (isAuthenticated) {
      fetchProfile()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profile = await getMyProfile()
      
      if (profile) {
        setProfileData({
          displayName: profile.display_name || user?.name || '',
          studentId: profile.student_id || '',
          position: profile.position || '',
          department: profile.department || '',
          generation: profile.generation || 0,
          bio: profile.bio || '',
          isPublic: profile.is_public ?? true,
          links: {
            github: (profile.links as MemberLinks)?.github || '',
            linkedin: (profile.links as MemberLinks)?.linkedin || '',
            instagram: (profile.links as MemberLinks)?.instagram || '',
            blog: (profile.links as MemberLinks)?.blog || '',
          }
        })
      } else {
        // 프로필이 없는 경우 기본값 (Auth user 정보 사용)
        setProfileData(prev => ({
          ...prev,
          displayName: user?.name || ''
        }))
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error)
      showNotification('error', '오류', '프로필 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      hiding: false
    })
    
    setTimeout(() => {
      hideNotification()
    }, 3000)
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, hiding: true }))
    setTimeout(() => {
      setNotification({
        show: false,
        type: 'info',
        title: '',
        message: '',
        hiding: false
      })
    }, 300)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSaving(true)

      // Normalize social links
      const normalizedGithub = normalizeGitHub(profileData.links.github || '')
      const normalizedLinkedin = normalizeLinkedIn(profileData.links.linkedin || '')
      const normalizedInstagram = normalizeInstagram(profileData.links.instagram || '')
      const normalizedBlog = normalizeBlog(profileData.links.blog || '')

      // Validate non-empty links
      if (normalizedGithub && !validateGitHub(normalizedGithub)) {
        showNotification('error', '오류', 'GitHub 사용자명이 올바르지 않습니다.')
        setSaving(false)
        return
      }
      if (normalizedLinkedin && !validateLinkedIn(normalizedLinkedin)) {
        showNotification('error', '오류', 'LinkedIn 사용자명이 올바르지 않습니다.')
        setSaving(false)
        return
      }
      if (normalizedInstagram && !validateInstagram(normalizedInstagram)) {
        showNotification('error', '오류', 'Instagram 사용자명이 올바르지 않습니다.')
        setSaving(false)
        return
      }
      if (normalizedBlog && !validateBlog(normalizedBlog)) {
        showNotification('error', '오류', '블로그 URL이 올바르지 않습니다.')
        setSaving(false)
        return
      }

      const updates = {
        display_name: profileData.displayName,
        student_id: profileData.studentId,
        position: profileData.position,
        department: profileData.department,
        generation: profileData.generation,
        bio: profileData.bio,
        is_public: profileData.isPublic,
        links: {
          github: normalizedGithub,
          linkedin: normalizedLinkedin,
          instagram: normalizedInstagram,
          blog: normalizedBlog
        }
      }

      const updatedProfile = await updateMemberProfile(user.id, updates)

      if (updatedProfile) {
        showNotification('success', '저장 완료', '프로필이 성공적으로 업데이트되었습니다.')
      } else {
        throw new Error('프로필 업데이트 실패')
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      showNotification('error', '오류', '프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading text="프로필을 불러오는 중..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <Title level={1} className="text-white mb-2">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              프로필 관리
            </span>
          </Title>
          <Subtitle className="text-gray-400">
            프로필 정보를 관리하세요
          </Subtitle>
        </div>

        {/* 프로필 정보 */}
        <Card className="p-8">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    표시 이름 *
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="표시될 이름을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    학번
                  </label>
                  <input
                    type="text"
                    value={profileData.studentId}
                    onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="20241234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    직책
                  </label>
                  <input
                    type="text"
                    value={profileData.position}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-gray-400 placeholder-gray-600 cursor-not-allowed opacity-60"
                    placeholder="부원, 운영진 등"
                    disabled
                    readOnly
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    * 직책은 관리자만 변경할 수 있습니다
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    학과
                  </label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="소프트웨어학부 등"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    기수
                  </label>
                  <input
                    type="number"
                    value={profileData.generation || ''}
                    onChange={(e) => setProfileData({ ...profileData, generation: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    placeholder="1, 2, 3..."
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    자기소개
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                    rows={4}
                    placeholder="자기소개를 입력하세요"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={profileData.isPublic}
                      onChange={(e) => setProfileData({ ...profileData, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/[0.02] text-violet-500 focus:ring-2 focus:ring-violet-500/50"
                    />
                    <span className="text-gray-400 group-hover:text-white transition-colors">
                      프로필 공개 (부원 페이지에 표시)
                    </span>
                  </label>
                </div>

                {/* 소셜 링크 */}
                <div className="md:col-span-2 pt-6 mt-6 border-t border-white/5">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">소셜 링크</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* GitHub */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Github className="w-4 h-4" /> GitHub
                      </label>
                      <input
                        type="text"
                        value={profileData.links.github}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          links: { ...profileData.links, github: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="username"
                      />
                      <p className="text-xs text-gray-600 mt-1">사용자명만 입력</p>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </label>
                      <input
                        type="text"
                        value={profileData.links.linkedin}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          links: { ...profileData.links, linkedin: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="username"
                      />
                      <p className="text-xs text-gray-600 mt-1">사용자명만 입력</p>
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Instagram className="w-4 h-4" /> Instagram
                      </label>
                      <input
                        type="text"
                        value={profileData.links.instagram}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          links: { ...profileData.links, instagram: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="username"
                      />
                      <p className="text-xs text-gray-600 mt-1">사용자명만 입력</p>
                    </div>

                    {/* Blog */}
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Globe className="w-4 h-4" /> Blog
                      </label>
                      <input
                        type="text"
                        value={profileData.links.blog}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          links: { ...profileData.links, blog: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="https://blog.example.com"
                      />
                      <p className="text-xs text-gray-600 mt-1">전체 URL 입력</p>
                    </div>

                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </Card>
      </main>

      {/* 알림 */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`${
              notification.hiding ? 'animate-slide-out-right' : 'animate-slide-in-right'
            } bg-gray-800 border-l-4 ${
              notification.type === 'success'
                ? 'border-green-500'
                : notification.type === 'error'
                ? 'border-red-500'
                : notification.type === 'warning'
                ? 'border-yellow-500'
                : 'border-violet-500'
            } rounded-lg shadow-xl p-4 min-w-[320px] max-w-md`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {notification.type === 'error' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <Title level={4} className="text-white text-sm font-medium">
                  {notification.title}
                </Title>
                {notification.message && (
                  <Text className="text-gray-300 text-sm mt-1">
                    {notification.message}
                  </Text>
                )}
              </div>
              <button
                onClick={hideNotification}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {!notification.hiding && (
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 animate-progress" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
