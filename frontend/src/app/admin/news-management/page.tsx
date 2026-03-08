'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, LayoutGrid, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui'
import { getAllNews, createNews, updateNews, deleteNews } from '@/entities/news/api/queries'
import { uploadNewsCardImages } from '@/shared/api/supabase/storage'
import type { News, NewsCategory } from '@/entities/news/model/types'
import { NEWS_CATEGORIES } from '@/entities/news/model/types'
import NewsPreview from './components/NewsPreview'
import MultiImageUpload from './components/MultiImageUpload'
import Notification from '../studies-management/components/Notification'

interface ImageData {
  id: string
  file: File | null
  preview: string
  url?: string
}

export default function NewsManagementPage() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'delete'>('list')
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '소식' as NewsCategory,
    date: new Date().toISOString().split('T')[0],
    link: '',
    is_active: true,
    order: 0,
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

  useEffect(() => {
    document.title = '뉴스 관리 - AIM: AI Monsters'
  }, [])

  useEffect(() => {
    fetchNews()
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

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllNews()
      setNewsList(data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
      showNotification('error', '오류', '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    const emptyForm = {
      title: '',
      subtitle: '',
      category: '소식' as NewsCategory,
      date: new Date().toISOString().split('T')[0],
      link: '',
      is_active: true,
      order: 0,
    }
    setFormData(emptyForm)
    setInitialFormData(emptyForm)
    setImages([])
  }

  const openAddView = () => {
    setEditingNews(null)
    resetForm()
    setViewMode('add')
  }

  const openEditView = (news: News) => {
    setEditingNews(news)
    const editForm = {
      title: news.title,
      subtitle: news.subtitle || '',
      category: news.category,
      date: news.date,
      link: news.link || '',
      is_active: news.is_active,
      order: news.order,
    }
    setFormData(editForm)
    setInitialFormData(editForm)

    const existingImages: ImageData[] = (news.card_images || []).map(url => ({
      id: crypto.randomUUID(),
      file: null,
      preview: url,
      url
    }))
    setImages(existingImages)
    setViewMode('edit')
  }

  const openDeleteView = (news: News) => {
    setEditingNews(news)
    setViewMode('delete')
  }

  const cancelForm = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      setViewMode('list')
      setEditingNews(null)
      resetForm()
    }
  }

  const cancelClose = () => {
    setShowConfirmDialog(false)
  }

  const confirmClose = () => {
    setViewMode('list')
    setEditingNews(null)
    resetForm()
    setShowConfirmDialog(false)
  }

  const confirmDelete = async () => {
    if (!editingNews) return

    try {
      await deleteNews(editingNews.id)
      showNotification('success', '삭제 완료', '뉴스가 삭제되었습니다.')
      setViewMode('list')
      setEditingNews(null)
      fetchNews()
    } catch (error) {
      console.error('Delete error:', error)
      showNotification('error', '오류', '삭제 중 오류가 발생했습니다.')
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!formData.title.trim()) {
      showNotification('warning', '입력 확인', '제목을 입력해주세요.')
      return
    }

    if (formData.title.length > 100) {
      showNotification('warning', '입력 확인', '제목은 100자 이내로 입력해주세요.')
      return
    }

    if (!formData.date) {
      showNotification('warning', '입력 확인', '날짜를 선택해주세요.')
      return
    }

    if (images.length > 20) {
      showNotification('warning', '입력 확인', '이미지는 최대 20개까지 업로드할 수 있습니다.')
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
        const newsId = editingNews?.id || `temp_${Date.now()}`
        uploadedUrls = await uploadNewsCardImages(newsId, newImageFiles)
      }

      // Combine existing and new image URLs
      const existingUrls = images.filter(img => img.url).map(img => img.url!)
      const allImageUrls = [...existingUrls, ...uploadedUrls]

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        category: formData.category,
        date: formData.date,
        thumbnail_url: allImageUrls.length > 0 ? allImageUrls[0] : undefined,
        card_images: allImageUrls,
        link: formData.link || undefined,
        is_active: formData.is_active,
        order: formData.order,
      }

      if (editingNews) {
        await updateNews(editingNews.id, payload)
        showNotification('success', '수정 완료', '뉴스가 성공적으로 수정되었습니다.')
      } else {
        await createNews(payload)
        showNotification('success', '생성 완료', '뉴스가 성공적으로 생성되었습니다.')
      }

      setViewMode('list')
      setEditingNews(null)
      resetForm()
      fetchNews()
    } catch (error) {
      console.error('Submit error:', error)
      showNotification('error', '오류', `${editingNews ? '수정' : '생성'} 중 오류가 발생했습니다.`)
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

  const getCategoryColor = (category: NewsCategory) => {
    const colors: Record<NewsCategory, string> = {
      '공지': 'bg-red-500/10 border-red-500/20 text-red-400',
      '행사': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      '성과': 'bg-green-500/10 border-green-500/20 text-green-400',
      '소식': 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      '기타': 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    }
    return colors[category]
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 text-sm">뉴스를 불러오는 중...</p>
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
                  {viewMode === 'edit' ? '뉴스 수정' : '새 뉴스 추가'}
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
                      {viewMode === 'edit' ? '수정 완료' : '뉴스 추가'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="max-w-[1800px] mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-8">
                <h2 className="text-lg font-semibold text-white mb-6">뉴스 정보</h2>

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
                      placeholder="예: AIM 2025 상반기 성과발표회"
                      maxLength={100}
                      required
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.title.length}/100
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      부제목
                    </label>
                    <textarea
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all duration-200 placeholder:text-gray-600"
                      placeholder="뉴스에 대한 간단한 설명을 입력하세요"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {formData.subtitle.length}/500
                    </div>
                  </div>

                  {/* Category, Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        카테고리 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as NewsCategory})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        {NEWS_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
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

                  {/* Card Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      카드 이미지
                    </label>
                    <MultiImageUpload
                      images={images}
                      onChange={setImages}
                      onError={(message) => showNotification('error', '오류', message)}
                      maxImages={20}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      최대 20개의 이미지를 업로드할 수 있습니다. 첫 번째 이미지가 썸네일로 사용됩니다.
                    </p>
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
                      placeholder="https://example.com/news-article"
                    />
                  </div>

                  {/* Order, Active */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        정렬 순서
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        공개 여부
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                        className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                          formData.is_active
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {formData.is_active ? '공개' : '비공개'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div>
              <NewsPreview
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
  if (viewMode === 'delete' && editingNews) {
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
              <span className="font-semibold text-red-400">&quot;{editingNews.title}&quot;</span>
              을(를) 정말 삭제하시겠습니까?
            </p>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-400">
                이 작업은 되돌릴 수 없습니다. 뉴스와 관련된 모든 데이터가 영구적으로 삭제됩니다.
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
              <h1 className="text-3xl font-bold text-white mb-2">뉴스 관리</h1>
              <p className="text-gray-400 text-sm">
                총 {newsList.length}개의 뉴스 · {newsList.filter(n => n.is_active).length}개 공개중
              </p>
            </div>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              새 뉴스 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {newsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <LayoutGrid className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 뉴스가 없습니다</h3>
            <p className="text-gray-500 text-sm mb-6">첫 번째 뉴스를 추가해보세요</p>
            <Button onClick={openAddView} className="gap-2">
              <Plus className="w-5 h-5" />
              뉴스 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news, index) => (
              <div
                key={news.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="group rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-white/5 overflow-hidden">
                    {news.thumbnail_url || (news.card_images && news.card_images.length > 0) ? (
                      <img
                        src={news.thumbnail_url || news.card_images[0]}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-violet-500/20 text-2xl font-bold">AIM</span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-xs font-medium ${getCategoryColor(news.category)}`}>
                        {news.category}
                      </span>
                    </div>

                    {/* Active Status */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${news.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(news.date)}</span>
                      {news.link && <ExternalLink className="w-3.5 h-3.5 ml-auto text-violet-400" />}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                      {news.title}
                    </h3>
                    {news.subtitle && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {news.subtitle}
                      </p>
                    )}
                    {news.card_images && news.card_images.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        {news.card_images.length}장의 카드 이미지
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => openEditView(news)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-violet-400 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-all duration-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => openDeleteView(news)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
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
