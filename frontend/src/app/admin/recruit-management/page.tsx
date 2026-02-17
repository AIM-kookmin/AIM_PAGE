'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button, Text, Title, Loading } from '@/shared/ui'
import { getAllRecruitNotices, createRecruitNotice, updateRecruitNotice, deleteRecruitNotice } from '@/shared/api/supabase'
import type { RecruitNotice, FAQ } from '@/types/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/shared/api/supabase/client'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

type ViewMode = 'preview' | 'edit' | 'create'
type TabMode = 'notices' | 'faqs'

export default function RecruitManagementPage() {
  const [tabMode, setTabMode] = useState<TabMode>('notices')
  const [notices, setNotices] = useState<RecruitNotice[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [selectedNotice, setSelectedNotice] = useState<RecruitNotice | null>(null)
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null)
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
  const [faqFormData, setFaqFormData] = useState({
    question: '',
    answer: '',
    is_active: true
  })

  const supabase = createClient()

  useEffect(() => {
    document.title = '모집 공고 관리 - AIM: AI Monsters'
    fetchNotices()
    fetchFaqs()
  }, [])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const data = await getAllRecruitNotices()
      setNotices(data)
      if (data.length > 0 && !selectedNotice) {
        setSelectedNotice(data[0])
      }
    } catch (error) {
      console.error('데이터를 불러오는 중 오류가 발생했습니다.', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setFaqs(data || [])
      if (data && data.length > 0 && !selectedFaq) {
        setSelectedFaq(data[0])
      }
    } catch (error) {
      console.error('FAQ를 불러오는 중 오류가 발생했습니다.', error)
    }
  }

  const handleCreate = () => {
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
    setViewMode('create')
  }

  const handleCreateFaq = () => {
    setFaqFormData({
      question: '',
      answer: '',
      is_active: true
    })
    setViewMode('create')
  }

  const handleEdit = (notice: RecruitNotice) => {
    setSelectedNotice(notice)
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
    setViewMode('edit')
  }

  const handleEditFaq = (faq: FAQ) => {
    setSelectedFaq(faq)
    setFaqFormData({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active
    })
    setViewMode('edit')
  }

  const handleCancel = () => {
    setViewMode('preview')
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
    setFaqFormData({
      question: '',
      answer: '',
      is_active: true
    })
  }

  const handleSave = async () => {
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

      if (viewMode === 'edit' && selectedNotice) {
        await updateRecruitNotice(selectedNotice.id, payload)
      } else {
        await createRecruitNotice(payload)
      }

      await fetchNotices()
      setViewMode('preview')
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다.', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleSaveFaq = async () => {
    try {
      if (viewMode === 'edit' && selectedFaq) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: faqFormData.question,
            answer: faqFormData.answer,
            is_active: faqFormData.is_active
          })
          .eq('id', selectedFaq.id)

        if (error) throw error
      } else {
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) : -1
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: faqFormData.question,
            answer: faqFormData.answer,
            is_active: faqFormData.is_active,
            order: maxOrder + 1
          })

        if (error) throw error
      }

      await fetchFaqs()
      setViewMode('preview')
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다.', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (notice: RecruitNotice) => {
    if (!confirm(`"${notice.title}"을(를) 삭제하시겠습니까?`)) return

    try {
      await deleteRecruitNotice(notice.id)
      await fetchNotices()
      if (selectedNotice?.id === notice.id) {
        setSelectedNotice(notices[0] || null)
      }
    } catch (error) {
      console.error('삭제 중 오류가 발생했습니다.', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteFaq = async (faq: FAQ) => {
    if (!confirm(`"${faq.question}"을(를) 삭제하시겠습니까?`)) return

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faq.id)

      if (error) throw error

      await fetchFaqs()
      if (selectedFaq?.id === faq.id) {
        setSelectedFaq(faqs[0] || null)
      }
    } catch (error) {
      console.error('삭제 중 오류가 발생했습니다.', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleMoveFaqUp = async (faq: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id)
    if (currentIndex === 0) return

    try {
      const prevFaq = faqs[currentIndex - 1]
      const { error } = await supabase
        .from('faqs')
        .update({ order: faq.order })
        .eq('id', prevFaq.id)

      if (error) throw error

      const { error: error2 } = await supabase
        .from('faqs')
        .update({ order: prevFaq.order })
        .eq('id', faq.id)

      if (error2) throw error2

      await fetchFaqs()
    } catch (error) {
      console.error('순서 변경 중 오류가 발생했습니다.', error)
    }
  }

  const handleMoveFaqDown = async (faq: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id)
    if (currentIndex === faqs.length - 1) return

    try {
      const nextFaq = faqs[currentIndex + 1]
      const { error } = await supabase
        .from('faqs')
        .update({ order: faq.order })
        .eq('id', nextFaq.id)

      if (error) throw error

      const { error: error2 } = await supabase
        .from('faqs')
        .update({ order: nextFaq.order })
        .eq('id', faq.id)

      if (error2) throw error2

      await fetchFaqs()
    } catch (error) {
      console.error('순서 변경 중 오류가 발생했습니다.', error)
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
        <Loading text="데이터를 불러오는 중..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Title level={1} className="text-white">모집 공고 관리</Title>
          <Button onClick={tabMode === 'notices' ? handleCreate : handleCreateFaq}>
            + 새로 작성
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => {
              setTabMode('notices')
              setViewMode('preview')
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              tabMode === 'notices'
                ? 'bg-violet-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            모집 공고
          </button>
          <button
            onClick={() => {
              setTabMode('faqs')
              setViewMode('preview')
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              tabMode === 'faqs'
                ? 'bg-violet-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            자주 묻는 질문
          </button>
        </div>

        {tabMode === 'notices' ? (
          <NoticesSection
            notices={notices}
            selectedNotice={selectedNotice}
            viewMode={viewMode}
            formData={formData}
            setSelectedNotice={setSelectedNotice}
            setViewMode={setViewMode}
            setFormData={setFormData}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleCancel={handleCancel}
            handleSave={handleSave}
            loadTemplate={loadTemplate}
          />
        ) : (
          <FaqsSection
            faqs={faqs}
            selectedFaq={selectedFaq}
            viewMode={viewMode}
            faqFormData={faqFormData}
            setSelectedFaq={setSelectedFaq}
            setViewMode={setViewMode}
            setFaqFormData={setFaqFormData}
            handleEditFaq={handleEditFaq}
            handleDeleteFaq={handleDeleteFaq}
            handleMoveFaqUp={handleMoveFaqUp}
            handleMoveFaqDown={handleMoveFaqDown}
            handleCancel={handleCancel}
            handleSaveFaq={handleSaveFaq}
          />
        )}
      </div>
    </div>
  )
}

// Notices Section Component
function NoticesSection({
  notices,
  selectedNotice,
  viewMode,
  formData,
  setSelectedNotice,
  setViewMode,
  setFormData,
  handleEdit,
  handleDelete,
  handleCancel,
  handleSave,
  loadTemplate
}: any) {
  const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false }
  )

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* 왼쪽: 공고 목록 */}
      <div className="col-span-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <Title level={3} className="text-white mb-4">공고 목록</Title>
          <div className="space-y-3">
            {notices.length === 0 ? (
              <Text variant="secondary" size="sm">
                등록된 공고가 없습니다.
              </Text>
            ) : (
              notices.map((notice: RecruitNotice) => (
                <div
                  key={notice.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedNotice?.id === notice.id
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => {
                    setSelectedNotice(notice)
                    setViewMode('preview')
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Title level={4} className="text-white text-sm">
                      {notice.title}
                    </Title>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notice.is_open && new Date(notice.end_at) > new Date()
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notice.is_open && new Date(notice.end_at) > new Date() ? '모집중' : '마감'}
                    </span>
                  </div>
                  <Text variant="secondary" size="sm" className="mb-2 line-clamp-2">
                    {notice.short_description || '설명이 없습니다.'}
                  </Text>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{new Date(notice.start_at).toLocaleDateString()}</span>
                    <span>~</span>
                    <span>{new Date(notice.end_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleEdit(notice)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      수정
                    </Button>
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleDelete(notice)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽: 미리보기 또는 편집 폼 */}
      <div className="col-span-8">
        {viewMode === 'preview' && selectedNotice ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Title level={2} className="text-white mb-2">
                  {selectedNotice.title}
                </Title>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <span>시작: {new Date(selectedNotice.start_at).toLocaleDateString()}</span>
                  <span>종료: {new Date(selectedNotice.end_at).toLocaleDateString()}</span>
                  <span className={`px-3 py-1 rounded-full ${
                    selectedNotice.is_open && new Date(selectedNotice.end_at) > new Date()
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedNotice.is_open && new Date(selectedNotice.end_at) > new Date() ? '모집중' : '마감'}
                  </span>
                </div>
              </div>
              <Button onClick={() => handleEdit(selectedNotice)} size="sm">
                수정
              </Button>
            </div>

            {selectedNotice.target_audience && (
              <div className="mb-4">
                <Text className="text-white/80 font-medium">지원 대상</Text>
                <Text variant="secondary">{selectedNotice.target_audience}</Text>
              </div>
            )}

            {selectedNotice.recruit_count && (
              <div className="mb-4">
                <Text className="text-white/80 font-medium">모집 인원</Text>
                <Text variant="secondary">{selectedNotice.recruit_count}</Text>
              </div>
            )}

            {selectedNotice.recruit_method && (
              <div className="mb-4">
                <Text className="text-white/80 font-medium">선발 방법</Text>
                <Text variant="secondary">{selectedNotice.recruit_method}</Text>
              </div>
            )}

            {selectedNotice.external_form_url && (
              <div className="mb-6">
                <Text className="text-white/80 font-medium mb-2">지원서 링크</Text>
                <a
                  href={selectedNotice.external_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline break-all"
                >
                  {selectedNotice.external_form_url}
                </a>
              </div>
            )}

            <div className="border-t border-white/10 pt-6 mt-6">
              <Title level={3} className="text-white mb-4">상세 내용</Title>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-6 mt-8">{children}</h1>,
                    h2: ({children}) => (
                      <h2 className="text-xl font-bold text-white mb-4 mt-8 flex items-center gap-3">
                        <span className="w-1 h-6 bg-violet-500 rounded-full" />
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => <h3 className="text-lg font-semibold text-white/90 mb-3 mt-6">{children}</h3>,
                    p: ({children}) => <p className="text-white/70 mb-4 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="text-white/70 mb-6 space-y-2 list-disc list-inside">{children}</ul>,
                    ol: ({children}) => <ol className="text-white/70 mb-6 space-y-2 list-decimal list-inside">{children}</ol>,
                    li: ({children}) => <li className="text-white/70">{children}</li>,
                    strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({children}) => <em className="text-white/80 italic">{children}</em>,
                    a: ({href, children}) => (
                      <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="border-l-2 border-violet-500/50 pl-6 py-2 text-white/60 italic my-6">
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className="text-violet-300 bg-white/10 px-2 py-1 rounded text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-white/10 border border-white/20 p-4 rounded-lg overflow-x-auto my-4">
                        {children}
                      </pre>
                    ),
                    hr: () => <hr className="border-white/20 my-8" />,
                    table: ({children}) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full border border-white/20">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-white/5">{children}</thead>,
                    tbody: ({children}) => <tbody>{children}</tbody>,
                    tr: ({children}) => <tr className="border-b border-white/10">{children}</tr>,
                    th: ({children}) => <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>,
                    td: ({children}) => <td className="px-4 py-2 text-white/70">{children}</td>,
                  }}
                >
                  {selectedNotice.body_md}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (viewMode === 'edit' || viewMode === 'create') ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <Title level={2} className="text-white">
                {viewMode === 'create' ? '새 공고 작성' : '공고 수정'}
              </Title>
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="ghost">
                  취소
                </Button>
                <Button onClick={handleSave}>
                  저장
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <label className="block text-white font-medium mb-2">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="예: 2024년 1학기 신입 부원 모집"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">간단한 설명</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="한 줄로 요약"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              {/* 마크다운 에디터 */}
              <div>
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
                  />
                </div>
              </div>

              {/* 날짜 및 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">모집 시작일 *</label>
                  <input
                    type="date"
                    value={formData.start_at}
                    onChange={(e) => setFormData({...formData, start_at: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">모집 마감일 *</label>
                  <input
                    type="date"
                    value={formData.end_at}
                    onChange={(e) => setFormData({...formData, end_at: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
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
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <Text variant="secondary">
              공고를 선택하거나 새로 작성해주세요.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

// FAQs Section Component
function FaqsSection({
  faqs,
  selectedFaq,
  viewMode,
  faqFormData,
  setSelectedFaq,
  setViewMode,
  setFaqFormData,
  handleEditFaq,
  handleDeleteFaq,
  handleMoveFaqUp,
  handleMoveFaqDown,
  handleCancel,
  handleSaveFaq
}: any) {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* 왼쪽: FAQ 목록 */}
      <div className="col-span-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <Title level={3} className="text-white mb-4">FAQ 목록</Title>
          <div className="space-y-3">
            {faqs.length === 0 ? (
              <Text variant="secondary" size="sm">
                등록된 FAQ가 없습니다.
              </Text>
            ) : (
              faqs.map((faq: FAQ, index: number) => (
                <div
                  key={faq.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedFaq?.id === faq.id
                      ? 'bg-primary-500/20 border-primary-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => {
                    setSelectedFaq(faq)
                    setViewMode('preview')
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Title level={4} className="text-white text-sm flex-1">
                      Q{index + 1}. {faq.question}
                    </Title>
                    <span className={`px-2 py-1 rounded-full text-xs ml-2 ${
                      faq.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {faq.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <Text variant="secondary" size="sm" className="mb-3 line-clamp-2">
                    {faq.answer}
                  </Text>
                  <div className="flex gap-2">
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleMoveFaqUp(faq)
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleMoveFaqDown(faq)
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={index === faqs.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleEditFaq(faq)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      수정
                    </Button>
                    <Button
                      onClick={(e: any) => {
                        e.stopPropagation()
                        handleDeleteFaq(faq)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽: 미리보기 또는 편집 폼 */}
      <div className="col-span-8">
        {viewMode === 'preview' && selectedFaq ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Title level={2} className="text-white mb-4">
                  {selectedFaq.question}
                </Title>
                <div className="prose prose-invert max-w-none">
                  <Text className="text-white/80 text-lg whitespace-pre-line leading-relaxed">
                    {selectedFaq.answer}
                  </Text>
                </div>
              </div>
              <Button onClick={() => handleEditFaq(selectedFaq)} size="sm">
                수정
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <Text variant="secondary" size="sm">
                상태: {selectedFaq.is_active ? '활성' : '비활성'}
              </Text>
            </div>
          </div>
        ) : (viewMode === 'edit' || viewMode === 'create') ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <Title level={2} className="text-white">
                {viewMode === 'create' ? '새 FAQ 작성' : 'FAQ 수정'}
              </Title>
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="ghost">
                  취소
                </Button>
                <Button onClick={handleSaveFaq}>
                  저장
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">질문 *</label>
                <input
                  type="text"
                  value={faqFormData.question}
                  onChange={(e) => setFaqFormData({...faqFormData, question: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="예: 프로그래밍 경험이 없어도 지원할 수 있나요?"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">답변 *</label>
                <textarea
                  value={faqFormData.answer}
                  onChange={(e) => setFaqFormData({...faqFormData, answer: e.target.value})}
                  rows={10}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="답변을 입력하세요..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="faq-is-active"
                  checked={faqFormData.is_active}
                  onChange={(e) => setFaqFormData({...faqFormData, is_active: e.target.checked})}
                  className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
                />
                <label htmlFor="faq-is-active" className="ml-2 text-white">
                  FAQ 공개
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            <Text variant="secondary">
              FAQ를 선택하거나 새로 작성해주세요.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
