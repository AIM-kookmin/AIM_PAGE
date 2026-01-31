'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button, Text, Title, Loading, Modal } from '@/shared/ui'
import { getAllRecruitNotices, createRecruitNotice, updateRecruitNotice, deleteRecruitNotice } from '@/shared/api/supabase'
import type { RecruitNotice } from '@/types/supabase'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

export default function RecruitManagementPage() {
  const [notices, setNotices] = useState<RecruitNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingNotice, setDeletingNotice] = useState<RecruitNotice | null>(null)
  const [editingNotice, setEditingNotice] = useState<RecruitNotice | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    body_md: '',
    start_at: '',
    end_at: '',
    is_open: true,
    external_form_url: '',
    target_audience: '',
    recruit_count: '',
    recruit_method: '',
    short_description: ''
  })
  const [initialFormData, setInitialFormData] = useState(formData)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
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
    document.title = '모집 공고 관리 - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    fetchNotices()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialFormData))
  }, [formData, initialFormData])

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
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

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const data = await getAllRecruitNotices()
      setNotices(data)
    } catch {
      console.error('네트워크 오류: 데이터를 불러오는 중 오류가 발생했습니다.')
      showNotification('error', '오류', '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingNotice(null)
    setFormData({
      title: '',
      body_md: '',
      start_at: '',
      end_at: '',
      is_open: true,
      external_form_url: '',
      target_audience: '',
      recruit_count: '',
      recruit_method: '',
      short_description: ''
    })
    setInitialFormData({
      title: '',
      body_md: '',
      start_at: '',
      end_at: '',
      is_open: true,
      external_form_url: '',
      target_audience: '',
      recruit_count: '',
      recruit_method: '',
      short_description: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      setShowModal(false)
      setEditingNotice(null)
      setFormData({
        title: '',
        body_md: '',
        start_at: '',
        end_at: '',
        is_open: true,
        external_form_url: '',
        target_audience: '',
        recruit_count: '',
        recruit_method: '',
        short_description: ''
      })
      setInitialFormData({
        title: '',
        body_md: '',
        start_at: '',
        end_at: '',
        is_open: true,
        external_form_url: '',
        target_audience: '',
        recruit_count: '',
        recruit_method: '',
        short_description: ''
      })
    }
  }

  const cancelClose = () => {
    setShowConfirmDialog(false)
  }

  const confirmClose = () => {
    setShowModal(false)
    setEditingNotice(null)
    setFormData({
      title: '',
      body_md: '',
      start_at: '',
      end_at: '',
      is_open: true,
      external_form_url: '',
      target_audience: '',
      recruit_count: '',
      recruit_method: '',
      short_description: ''
    })
    setInitialFormData({
      title: '',
      body_md: '',
      start_at: '',
      end_at: '',
      is_open: true,
      external_form_url: '',
      target_audience: '',
      recruit_count: '',
      recruit_method: '',
      short_description: ''
    })
    setShowConfirmDialog(false)
  }

  const handleEdit = (notice: RecruitNotice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      body_md: notice.body_md,
      start_at: notice.start_at.split('T')[0],
      end_at: notice.end_at.split('T')[0],
      is_open: notice.is_open,
      external_form_url: notice.external_form_url || '',
      target_audience: notice.target_audience || '',
      recruit_count: notice.recruit_count || '',
      recruit_method: notice.recruit_method || '',
      short_description: notice.short_description || ''
    })
    setInitialFormData({
      title: notice.title,
      body_md: notice.body_md,
      start_at: notice.start_at.split('T')[0],
      end_at: notice.end_at.split('T')[0],
      is_open: notice.is_open,
      external_form_url: notice.external_form_url || '',
      target_audience: notice.target_audience || '',
      recruit_count: notice.recruit_count || '',
      recruit_method: notice.recruit_method || '',
      short_description: notice.short_description || ''
    })
    setShowModal(true)
  }

  const openDeleteModal = (notice: RecruitNotice) => {
    setDeletingNotice(notice)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingNotice(null)
  }

  const confirmDelete = async () => {
    if (!deletingNotice) return

    try {
      await deleteRecruitNotice(deletingNotice.id)
      showNotification('success', '삭제 완료', '모집 공고가 삭제되었습니다.')
      closeDeleteModal()
      fetchNotices()
    } catch {
      showNotification('error', '오류', '삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    try {
      const payload = {
        title: formData.title,
        body_md: formData.body_md,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        is_open: formData.is_open,
        external_form_url: formData.external_form_url || null,
        target_audience: formData.target_audience || null,
        recruit_count: formData.recruit_count || null,
        recruit_method: formData.recruit_method || null,
        short_description: formData.short_description || null
      }

      if (editingNotice) {
        await updateRecruitNotice(editingNotice.id, payload)
      } else {
        await createRecruitNotice(payload)
      }
      
      showNotification('success', editingNotice ? '수정 완료' : '생성 완료', `모집 공고가 성공적으로 ${editingNotice ? '수정' : '생성'}되었습니다.`)
      setShowModal(false)
      setEditingNotice(null)
      setFormData({
        title: '',
        body_md: '',
        start_at: '',
        end_at: '',
        is_open: true,
        external_form_url: '',
        target_audience: '',
        recruit_count: '',
        recruit_method: '',
        short_description: ''
      })
      setInitialFormData({
        title: '',
        body_md: '',
        start_at: '',
        end_at: '',
        is_open: true,
        external_form_url: '',
        target_audience: '',
        recruit_count: '',
        recruit_method: '',
        short_description: ''
      })
      fetchNotices()
    } catch {
      showNotification('error', '오류', `${editingNotice ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    }
  }

  const loadTemplate = () => {
    const template = `# AIM 동아리 모집

## 📢 모집 개요
AIM(AI Monsters)은 인공지능과 머신러닝에 관심 있는 학생들이 모여 함께 공부하고 프로젝트를 진행하는 동아리입니다.

## 🎯 모집 대상
- 전 학년 (학과 무관)
- AI/ML에 관심이 있는 모든 학생
- 프로그래밍 경험 무관 (열정만 있으면 OK!)

## 📅 활동 내용
- 정기 스터디 (주 1회)
- 프로젝트 진행
- 세미나 및 워크샵
- 대회 참가

## 💡 지원 방법
아래 지원서 링크를 통해 지원해주세요!`
    
    setFormData({...formData, body_md: template})
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading text="모집 공고를 불러오는 중..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title level={1} className="text-white">모집 공고 관리</Title>
          <Button onClick={openAddModal}>
            + 새 공고 작성
          </Button>
        </div>

        <div className="grid gap-6">
          {notices.length === 0 ? (
            <div className="text-center py-12">
              <Text variant="secondary" size="lg">
                아직 등록된 모집 공고가 없습니다.
              </Text>
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Title level={3} className="text-white">
                        {notice.title}
                      </Title>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        notice.is_open && new Date(notice.end_at) > new Date()
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {notice.is_open && new Date(notice.end_at) > new Date() ? '모집중' : '마감'}
                      </span>
                    </div>
                    <Text variant="secondary" size="sm" className="mb-2">
                      {notice.short_description || '설명이 없습니다.'}
                    </Text>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>시작: {new Date(notice.start_at).toLocaleDateString()}</span>
                      <span>종료: {new Date(notice.end_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(notice)} variant="ghost" size="sm">
                      수정
                    </Button>
                    <Button onClick={() => openDeleteModal(notice)} variant="ghost" size="sm">
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 모집 공고 작성/수정 모달 */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingNotice ? '모집 공고 수정' : '새 모집 공고 작성'}
        maxWidth="4xl"
        onSubmit={handleSubmit}
        submitText={editingNotice ? '수정' : '작성'}
        cancelText="취소"
      >
        {/* 기본 정보 */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white font-medium mb-2">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="예: 2024년 1학기 신입 부원 모집"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">간단한 설명</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({...formData, short_description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="한 줄로 요약 (선택)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">지원 대상</label>
              <input
                type="text"
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="예: 전 학년"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">모집 인원</label>
              <input
                type="text"
                value={formData.recruit_count}
                onChange={(e) => setFormData({...formData, recruit_count: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="예: 15명 내외"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">선발 방법</label>
            <input
              type="text"
              value={formData.recruit_method}
              onChange={(e) => setFormData({...formData, recruit_method: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="예: 서류 + 면접"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">지원서 링크</label>
            <input
              type="url"
              value={formData.external_form_url}
              onChange={(e) => setFormData({...formData, external_form_url: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="https://forms.google.com/..."
            />
          </div>
        </div>

        {/* 마크다운 에디터 - react-md-editor 사용 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-white font-medium">상세 내용 (Markdown) *</label>
            <Button type="button" onClick={loadTemplate} variant="ghost" size="sm">
              템플릿 로드
            </Button>
          </div>
          <div data-color-mode="dark">
            <MDEditor
              value={formData.body_md}
              onChange={(val) => setFormData({...formData, body_md: val || ''})}
              height={400}
              preview="live"
              hideToolbar={false}
            />
          </div>
        </div>

        {/* 날짜 및 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-white font-medium mb-2">모집 시작일 *</label>
            <input
              type="date"
              value={formData.start_at}
              onChange={(e) => setFormData({...formData, start_at: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">모집 마감일 *</label>
            <input
              type="date"
              value={formData.end_at}
              onChange={(e) => setFormData({...formData, end_at: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="isOpen"
            checked={formData.is_open}
            onChange={(e) => setFormData({...formData, is_open: e.target.checked})}
            className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
          />
          <label htmlFor="isOpen" className="ml-2 text-white">
            모집 공고 공개
          </label>
        </div>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="삭제 확인"
        submitText="삭제"
        onSubmit={confirmDelete}
      >
        <div className="space-y-4">
          <Text className="text-white">
            {deletingNotice && (
              <>
                <span className="font-semibold text-red-400">
                  "{deletingNotice.title}"
                </span>
                을(를) 삭제하시겠습니까?
              </>
            )}
          </Text>
          <Text variant="secondary" size="sm">
            이 작업은 되돌릴 수 없습니다.
          </Text>
        </div>
      </Modal>

      {/* 변경사항 확인 다이얼로그 */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={cancelClose}
        title="변경사항이 있습니다"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Text className="text-white">
            작성 중인 내용이 있습니다. 정말로 닫으시겠습니까?
          </Text>
          <div className="flex justify-end gap-3">
            <Button onClick={cancelClose} variant="secondary">
              계속 작성
            </Button>
            <Button onClick={confirmClose} className="bg-red-600 hover:bg-red-700">
              닫기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 알림 (우상단 토스트) */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 bg-gray-800 border ${
            notification.type === 'success' ? 'border-green-500' : 'border-red-500'
          } rounded-lg p-4 w-80 shadow-2xl ${
            notification.hiding ? 'animate-slide-out-right' : 'animate-slide-in-right'
          }`}>
          <div className="flex items-start gap-3">
            <div className={`w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-2xl ml-2">
              {notification.type === 'success' ? '✓' : '⚠️'}
            </span>
            <div className="flex-1">
              <Title level={4} className={`mb-1 ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {notification.title}
              </Title>
              <Text variant="secondary" size="sm">
                {notification.message}
              </Text>
            </div>
            <Button onClick={hideNotification} variant="ghost" size="sm" className="hover:bg-gray-700 -mt-1">
              ✕
            </Button>
          </div>
          {/* 진행 바 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
            <div className={`h-full ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } animate-progress`}></div>
          </div>
        </div>
      )}
    </div>
  )
}
