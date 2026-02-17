'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui'
import { getAllActivities, createActivity, updateActivity, deleteActivity } from '@/shared/api/supabase'
import { uploadActivityCover } from '@/shared/api/supabase/storage'
import type { Activity } from '@/types/supabase'
import ActivityPreview from './components/ActivityPreview'
import ImageUploadZone from './components/ImageUploadZone'
import ActivityCard from './components/ActivityCard'
import Notification from './components/Notification'

const CATEGORIES = [
  { value: 'competition', label: '대회' },
  { value: 'seminar', label: '세미나' },
  { value: 'workshop', label: '워크샵' },
  { value: 'project', label: '프로젝트' },
  { value: 'social', label: '친목' },
  { value: 'etc', label: '기타' }
] as const

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'delete'>('list')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'etc' as Activity['category'],
    date: '',
    description: '',
    image_url: '',
    link: '',
    location: '',
    participants: '',
    organizer: '',
    is_active: true
  })
  const [initialFormData, setInitialFormData] = useState(formData)
  const [hasChanges, setHasChanges] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
    document.title = '활동 관리 - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    fetchActivities()
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

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllActivities()
      setActivities(data)
    } catch {
      showNotification('error', '오류', '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    const emptyForm = {
      title: '',
      category: 'etc' as Activity['category'],
      date: '',
      description: '',
      image_url: '',
      link: '',
      location: '',
      participants: '',
      organizer: '',
      is_active: true
    }
    setFormData(emptyForm)
    setInitialFormData(emptyForm)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (file: File | null) => {
    if (!file) return

    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({...formData, image_url: ''})
  }

  const openAddView = () => {
    setEditingActivity(null)
    resetForm()
    setViewMode('add')
  }

  const openEditView = (activity: Activity) => {
    setEditingActivity(activity)
    const editForm = {
      title: activity.title,
      category: activity.category,
      date: activity.date,
      description: activity.description || '',
      image_url: activity.image_url || '',
      link: activity.link || '',
      location: activity.location || '',
      participants: activity.participants?.toString() || '',
      organizer: activity.organizer || '',
      is_active: activity.is_active
    }
    setFormData(editForm)
    setInitialFormData(editForm)
    setImageFile(null)
    setImagePreview(activity.image_url || null)
    setViewMode('edit')
  }

  const openDeleteView = (activity: Activity) => {
    setEditingActivity(activity)
    setViewMode('delete')
  }

  const cancelForm = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      setViewMode('list')
      setEditingActivity(null)
      resetForm()
    }
  }

  const cancelClose = () => {
    setShowConfirmDialog(false)
  }

  const confirmClose = () => {
    setViewMode('list')
    setEditingActivity(null)
    resetForm()
    setShowConfirmDialog(false)
  }

  const confirmDelete = async () => {
    if (!editingActivity) return

    try {
      await deleteActivity(editingActivity.id)
      showNotification('success', '삭제 완료', '활동이 삭제되었습니다.')
      setViewMode('list')
      setEditingActivity(null)
      fetchActivities()
    } catch {
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

    if (!formData.date) {
      showNotification('warning', '입력 확인', '날짜를 선택해주세요.')
      return
    }

    try {
      setIsUploading(true)
      let imageUrl = formData.image_url

      if (imageFile) {
        const activityId = editingActivity?.id || `temp_${Date.now()}`
        imageUrl = await uploadActivityCover(activityId, imageFile)
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        date: formData.date,
        description: formData.description || null,
        image_url: imageUrl || null,
        link: formData.link || null,
        location: formData.location || null,
        participants: formData.participants ? parseInt(formData.participants) : null,
        organizer: formData.organizer || null,
        is_active: formData.is_active
      }

      if (editingActivity) {
        await updateActivity(editingActivity.id, payload)
        showNotification('success', '수정 완료', '활동이 성공적으로 수정되었습니다.')
      } else {
        await createActivity(payload)
        showNotification('success', '생성 완료', '활동이 성공적으로 생성되었습니다.')
      }

      setViewMode('list')
      setEditingActivity(null)
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error('Submit error:', error)
      showNotification('error', '오류', `${editingActivity ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    } finally {
      setIsUploading(false)
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

  const getCategoryLabel = (category: Activity['category']) => {
    return CATEGORIES.find(c => c.value === category)?.label || category
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 text-sm">활동을 불러오는 중...</p>
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
                  {viewMode === 'edit' ? '활동 수정' : '새 활동 추가'}
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
                      {viewMode === 'edit' ? '수정 완료' : '활동 추가'}
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
                <h2 className="text-lg font-semibold text-white mb-6">활동 정보</h2>

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
                      placeholder="예: 2024 AI 해커톤 참가"
                      maxLength={100}
                      required
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.title.length}/100
                    </div>
                  </div>

                  {/* Category & Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        카테고리 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as Activity['category']})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-gray-900 text-white">{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        날짜 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all duration-200 placeholder:text-gray-600"
                      placeholder="활동에 대한 간단한 설명"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.description.length}/500
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      이미지
                    </label>
                    <ImageUploadZone
                      imagePreview={imagePreview}
                      onImageChange={handleImageChange}
                      onRemoveImage={removeImage}
                      onError={(message) => showNotification('error', '오류', message)}
                    />
                  </div>

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
                      placeholder="https://blog.example.com/post"
                    />
                  </div>

                  {/* Location, Participants, Organizer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        장소
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-600"
                        placeholder="국민대학교"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        참가자 수
                      </label>
                      <input
                        type="number"
                        value={formData.participants}
                        onChange={(e) => setFormData({...formData, participants: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-600"
                        placeholder="15"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        주최자
                      </label>
                      <input
                        type="text"
                        value={formData.organizer}
                        onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-600"
                        placeholder="AIM 동아리"
                      />
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-violet-600 bg-white/5 border-white/20 rounded focus:ring-violet-500 focus:ring-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer">
                      활동을 공개합니다 (비활성화 시 사용자에게 표시되지 않습니다)
                    </label>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className={showPreview ? 'block' : 'hidden lg:block'}>
              <ActivityPreview
                formData={formData}
                imagePreview={imagePreview}
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
  if (viewMode === 'delete' && editingActivity) {
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
              <span className="font-semibold text-red-400">"{editingActivity.title}"</span>
              을(를) 정말 삭제하시겠습니까?
            </p>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-400">
                ⚠️ 이 작업은 되돌릴 수 없습니다. 활동과 관련된 모든 데이터가 영구적으로 삭제됩니다.
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
              <h1 className="text-3xl font-bold text-white mb-2">활동 관리</h1>
              <p className="text-gray-400 text-sm">
                총 {activities.length}개의 활동 · {activities.filter(a => a.is_active).length}개 공개 중
              </p>
            </div>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              새 활동 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <LayoutGrid className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 활동이 없습니다</h3>
            <p className="text-gray-500 text-sm mb-6">첫 번째 활동을 추가해보세요</p>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              활동 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ActivityCard
                  activity={activity}
                  onEdit={openEditView}
                  onDelete={openDeleteView}
                  getCategoryLabel={getCategoryLabel}
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
