'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui'
import { getAllStudies, createStudy, updateStudy, deleteStudy } from '@/shared/api/supabase'
import { uploadStudyImages } from '@/shared/api/supabase/storage'
import type { Study } from '@/types/database'
import StudyPreview from './components/StudyPreview'
import MultiImageUpload from './components/MultiImageUpload'
import MemberSelector from './components/MemberSelector'
import StudyCard from './components/StudyCard'
import Notification from './components/Notification'

const STATUSES = [
  { value: 'recruiting', label: '모집중' },
  { value: 'active', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소됨' }
] as const

const VISIBILITIES = [
  { value: 'public', label: '전체 공개' },
  { value: 'members_only', label: '멤버만 공개' },
  { value: 'private', label: '비공개' }
] as const

interface ImageData {
  id: string
  file: File | null
  preview: string
  url?: string
}

export default function StudiesManagementPage() {
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'delete'>('list')
  const [editingStudy, setEditingStudy] = useState<Study | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    status: 'recruiting' as Study['status'],
    visibility: 'public' as Study['visibility'],
    level: '입문' as '입문' | '중급' | '심화' | '응용',
    start_date: '',
    end_date: '',
    content: '',
    link: '',
    participants: [] as string[]
  })
  const [initialFormData, setInitialFormData] = useState(formData)
  const [hasChanges, setHasChanges] = useState(false)
  const [images, setImages] = useState<ImageData[]>([])
  const [isUploading, setIsUploading] = useState(false)
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
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    document.title = '스터디 관리 - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    fetchStudies()
  }, [])

  useEffect(() => {
    setHasChanges(
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      images.some(img => img.file !== null)
    )
  }, [formData, initialFormData, images])

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
    }, 4000)
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

  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllStudies()
      setStudies(data)
    } catch (error) {
      console.error('Failed to fetch studies:', error)
      showNotification('error', '오류', '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    const emptyForm = {
      title: '',
      status: 'recruiting' as Study['status'],
      visibility: 'public' as Study['visibility'],
      level: '입문' as '입문' | '중급' | '심화' | '응용',
      start_date: '',
      end_date: '',
      content: '',
      link: '',
      participants: [] as string[]
    }
    setFormData(emptyForm)
    setInitialFormData(emptyForm)
    setImages([])
  }

  const openAddView = () => {
    setEditingStudy(null)
    resetForm()
    setViewMode('add')
  }

  const openEditView = (study: Study) => {
    setEditingStudy(study)
    const editForm = {
      title: study.title,
      status: study.status,
      visibility: study.visibility,
      level: (study.level || '입문') as '입문' | '중급' | '심화' | '응용',
      start_date: study.start_date || '',
      end_date: study.end_date || '',
      content: study.content || '',
      link: study.link || '',
      participants: study.participants || []
    }
    setFormData(editForm)
    setInitialFormData(editForm)

    // Load existing images
    const existingImages: ImageData[] = (study.images || []).map(url => ({
      id: crypto.randomUUID(),
      file: null,
      preview: url,
      url
    }))
    setImages(existingImages)
    setViewMode('edit')
  }

  const openDeleteView = (study: Study) => {
    setEditingStudy(study)
    setViewMode('delete')
  }

  const cancelForm = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      setViewMode('list')
      setEditingStudy(null)
      resetForm()
    }
  }

  const cancelClose = () => {
    setShowConfirmDialog(false)
  }

  const confirmClose = () => {
    setViewMode('list')
    setEditingStudy(null)
    resetForm()
    setShowConfirmDialog(false)
  }

  const confirmDelete = async () => {
    if (!editingStudy) return

    try {
      await deleteStudy(editingStudy.id)
      showNotification('success', '삭제 완료', '스터디가 삭제되었습니다.')
      setViewMode('list')
      setEditingStudy(null)
      fetchStudies()
    } catch (error) {
      console.error('Delete error:', error)
      showNotification('error', '오류', '삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      showNotification('warning', '입력 확인', '제목을 입력해주세요.')
      return
    }

    if (formData.title.length > 100) {
      showNotification('warning', '입력 확인', '제목은 100자 이내로 입력해주세요.')
      return
    }

    if (!formData.start_date) {
      showNotification('warning', '입력 확인', '시작일을 선택해주세요.')
      return
    }

    if (!formData.end_date) {
      showNotification('warning', '입력 확인', '종료일을 선택해주세요.')
      return
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      showNotification('warning', '입력 확인', '종료일은 시작일보다 이후여야 합니다.')
      return
    }

    if (formData.content.length > 2000) {
      showNotification('warning', '입력 확인', '내용은 2000자 이내로 입력해주세요.')
      return
    }

    if (images.length === 0) {
      showNotification('warning', '입력 확인', '최소 1개의 이미지를 업로드해주세요.')
      return
    }

    if (images.length > 10) {
      showNotification('warning', '입력 확인', '이미지는 최대 10개까지 업로드할 수 있습니다.')
      return
    }

    if (formData.link && !isValidUrl(formData.link)) {
      showNotification('warning', '입력 확인', '올바른 URL 형식을 입력해주세요.')
      return
    }

    try {
      setIsUploading(true)

      // Upload new images
      const newImageFiles = images.filter(img => img.file !== null).map(img => img.file!)
      let uploadedUrls: string[] = []

      if (newImageFiles.length > 0) {
        const studyId = editingStudy?.id || `temp_${Date.now()}`
        uploadedUrls = await uploadStudyImages(studyId, newImageFiles)
      }

      // Combine existing and new image URLs
      const existingUrls = images.filter(img => img.url).map(img => img.url!)
      const allImageUrls = [...existingUrls, ...uploadedUrls]

      const payload = {
        title: formData.title,
        status: formData.status,
        visibility: formData.visibility,
        level: formData.level,
        start_date: formData.start_date,
        end_date: formData.end_date,
        content: formData.content || undefined,
        link: formData.link || undefined,
        participants: formData.participants.length > 0 ? formData.participants : undefined,
        images: allImageUrls
      }

      if (editingStudy) {
        await updateStudy(editingStudy.id, payload)
        showNotification('success', '수정 완료', '스터디가 성공적으로 수정되었습니다.')
      } else {
        await createStudy(payload)
        showNotification('success', '생성 완료', '스터디가 성공적으로 생성되었습니다.')
      }

      setViewMode('list')
      setEditingStudy(null)
      resetForm()
      fetchStudies()
    } catch (error) {
      console.error('Submit error:', error)
      showNotification('error', '오류', `${editingStudy ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    } finally {
      setIsUploading(false)
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 text-sm">스터디를 불러오는 중...</p>
      </div>
    )
  }

  // Add/Edit Form View with Split Screen
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-[1800px] mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={cancelForm} variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  뒤로 가기
                </Button>
                <div className="h-6 w-px bg-white/10" />
                <h1 className="text-2xl font-bold text-white">
                  {viewMode === 'edit' ? '스터디 수정' : '새 스터디 추가'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-sm text-gray-400">
                    {hasChanges ? '저장되지 않은 변경사항' : '모든 변경사항 저장됨'}
                  </span>
                </div>
                <Button onClick={handleSubmit} disabled={isUploading} className="gap-2">
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      {viewMode === 'edit' ? '수정 완료' : '스터디 추가'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Toggle */}
        <div className="max-w-[1800px] mx-auto px-8 pt-8 pb-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden w-full px-4 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-400 transition-colors font-medium"
          >
            {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
          </button>
        </div>

        {/* Split Screen Layout */}
        <div className="max-w-[1800px] mx-auto px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8">
                <h2 className="text-lg font-semibold text-white mb-6">스터디 정보</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      제목 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-600"
                      placeholder="예: 딥러닝 논문 리딩 스터디"
                      maxLength={100}
                      required
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.title.length}/100
                    </div>
                  </div>

                  {/* Status, Visibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        상태 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Study['status']})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {STATUSES.map(status => (
                          <option key={status.value} value={status.value} className="bg-gray-900 text-white">{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        공개 범위 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({...formData, visibility: e.target.value as Study['visibility']})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {VISIBILITIES.map(vis => (
                          <option key={vis.value} value={vis.value} className="bg-gray-900 text-white">{vis.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Level Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      난이도 <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['입문', '중급', '심화', '응용'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({...formData, level})}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            formData.level === level
                              ? 'bg-violet-500 text-white shadow-lg hover:bg-violet-600'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        시작일 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        종료일 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      내용 <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all duration-200 placeholder:text-gray-600"
                      placeholder="스터디에 대한 설명을 입력하세요"
                      rows={4}
                      maxLength={2000}
                      required
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.content.length}/2000
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      이미지 <span className="text-red-400">*</span>
                    </label>
                    <MultiImageUpload
                      images={images}
                      onChange={setImages}
                      onError={(message) => showNotification('error', '오류', message)}
                      maxImages={10}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      최소 1개, 최대 10개의 이미지를 업로드할 수 있습니다
                    </p>
                  </div>

                  {/* Member Selector */}
                  <MemberSelector
                    selectedMembers={formData.participants}
                    onChange={(members) => setFormData({...formData, participants: members})}
                    onError={(message) => showNotification('error', '오류', message)}
                  />

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      외부 링크
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-600"
                      placeholder="https://notion.so/study-notes"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className={showPreview ? 'block' : 'hidden lg:block'}>
              <StudyPreview
                formData={formData}
                images={images}
              />
            </div>
          </div>
        </div>

        {/* Confirm Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-3">변경사항이 있습니다</h3>
              <p className="text-gray-400 mb-6">
                작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?
              </p>
              <div className="flex gap-3">
                <Button onClick={cancelClose} variant="secondary" className="flex-1">
                  계속 작성
                </Button>
                <Button onClick={confirmClose} className="flex-1 bg-red-600 hover:bg-red-700">
                  나가기
                </Button>
              </div>
            </div>
          </div>
        )}

        <Notification
          show={notification.show}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          hiding={notification.hiding}
          onClose={hideNotification}
        />
      </div>
    )
  }

  // Delete Confirmation View
  if (viewMode === 'delete' && editingStudy) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-2xl mx-auto">
          <Button onClick={() => setViewMode('list')} variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>

          <div className="rounded-2xl bg-white/[0.02] border border-red-500/20 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">삭제 확인</h1>
            <p className="text-gray-400 mb-6">
              <span className="font-semibold text-red-400">"{editingStudy.title}"</span>
              을(를) 정말 삭제하시겠습니까?
            </p>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-400">
                ⚠️ 이 작업은 되돌릴 수 없습니다. 스터디와 관련된 모든 데이터가 영구적으로 삭제됩니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setViewMode('list')} variant="secondary" className="flex-1">
                취소
              </Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                삭제
              </Button>
            </div>
          </div>
        </div>

        <Notification
          show={notification.show}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          hiding={notification.hiding}
          onClose={hideNotification}
        />
      </div>
    )
  }

  // List View
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">스터디 관리</h1>
              <p className="text-gray-400 text-sm">
                총 {studies.length}개의 스터디 · {studies.filter(s => s.status === 'active').length}개 진행중
              </p>
            </div>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              새 스터디 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {studies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <LayoutGrid className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 스터디가 없습니다</h3>
            <p className="text-gray-500 text-sm mb-6">첫 번째 스터디를 추가해보세요</p>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              스터디 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study, index) => (
              <div
                key={study.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <StudyCard
                  study={study}
                  onEdit={openEditView}
                  onDelete={openDeleteView}
                  formatDate={formatDate}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        hiding={notification.hiding}
        onClose={hideNotification}
      />
    </div>
  )
}
