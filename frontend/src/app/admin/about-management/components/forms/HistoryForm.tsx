'use client'

import { ArrowLeft } from 'lucide-react'
import { HistoryFormData } from '../../types'

interface HistoryFormProps {
  formData: HistoryFormData
  onChange: (field: keyof HistoryFormData, value: any) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  hasChanges: boolean
  mode: 'add' | 'edit'
}

export default function HistoryForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  hasChanges,
  mode,
}: HistoryFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.year) {
      alert('연도를 입력해주세요.')
      return
    }
    if (formData.year < 1900 || formData.year > 2100) {
      alert('연도는 1900년에서 2100년 사이여야 합니다.')
      return
    }
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (formData.title.length > 100) {
      alert('제목은 100자를 초과할 수 없습니다.')
      return
    }
    if (!formData.description.trim()) {
      alert('설명을 입력해주세요.')
      return
    }
    if (formData.description.length > 500) {
      alert('설명은 500자를 초과할 수 없습니다.')
      return
    }
    if (formData.order < 0) {
      alert('순서는 0 이상이어야 합니다.')
      return
    }

    onSubmit()
  }

  const isYearInvalid = formData.year && (formData.year < 1900 || formData.year > 2100)

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>뒤로 가기</span>
              </button>
              <h1 className="text-2xl font-bold text-white">
                {mode === 'add' ? '연혁 추가' : '연혁 수정'}
              </h1>
              <div
                className={`w-2 h-2 rounded-full ${
                  hasChanges ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                }`}
                title={hasChanges ? '변경사항 있음' : '저장됨'}
              />
            </div>
            <button
              type="submit"
              form="history-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <form
          id="history-form"
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 space-y-6"
        >
          {/* Year Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              연도 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.year || ''}
              onChange={(e) => onChange('year', parseInt(e.target.value) || 0)}
              min={1900}
              max={2100}
              className={`w-full bg-white/5 border text-white px-4 py-3 rounded-xl focus:ring-2 outline-none transition-all ${
                isYearInvalid
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-white/10 focus:ring-violet-500 focus:border-transparent'
              }`}
              placeholder="예: 2024"
            />
            {isYearInvalid && (
              <div className="text-xs text-red-400 mt-1">
                연도는 1900년에서 2100년 사이여야 합니다.
              </div>
            )}
            {!isYearInvalid && (
              <div className="text-xs text-gray-500 mt-1">
                1900-2100 사이의 연도를 입력하세요
              </div>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="연혁 제목을 입력하세요"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-vertical"
              placeholder="연혁 설명을 입력하세요"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Order Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              순서 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => onChange('order', parseInt(e.target.value) || 0)}
              min={0}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="0"
            />
            <div className="text-xs text-gray-500 mt-1">
              0 이상의 정수를 입력하세요
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
