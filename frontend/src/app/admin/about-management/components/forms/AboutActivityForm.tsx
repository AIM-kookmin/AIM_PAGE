'use client'

import { ArrowLeft } from 'lucide-react'
import { AboutActivityFormData } from '../../types'

interface AboutActivityFormProps {
  formData: AboutActivityFormData
  onChange: (field: keyof AboutActivityFormData, value: string | number) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  hasChanges: boolean
  mode: 'add' | 'edit'
}

const colorOptions = [
  { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
]

export default function AboutActivityForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  hasChanges,
  mode,
}: AboutActivityFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
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
    if (!formData.icon.trim()) {
      alert('아이콘을 입력해주세요.')
      return
    }
    if (formData.icon.length > 2) {
      alert('아이콘은 2자를 초과할 수 없습니다.')
      return
    }
    if (!formData.color) {
      alert('색상을 선택해주세요.')
      return
    }
    if (formData.order < 0) {
      alert('순서는 0 이상이어야 합니다.')
      return
    }

    onSubmit()
  }

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
                {mode === 'add' ? '활동 추가' : '활동 수정'}
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
              form="activity-form"
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
          id="activity-form"
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 space-y-6"
        >
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
              placeholder="활동 제목을 입력하세요"
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
              placeholder="활동 설명을 입력하세요"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Icon Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              아이콘 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => onChange('icon', e.target.value)}
              maxLength={2}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="이모지를 입력하세요 (예: 🚀, 💡, 🎯)"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.icon.length}/2
            </div>
          </div>

          {/* Color Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              색상 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.color}
              onChange={(e) => onChange('color', e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            >
              <option value="" disabled className="bg-gray-900">
                색상을 선택하세요
              </option>
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value} className="bg-gray-900">
                  {color.label}
                </option>
              ))}
            </select>
            {formData.color && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    colorOptions.find((c) => c.value === formData.color)?.class
                  }`}
                />
                <span className="text-xs text-gray-400 capitalize">
                  {formData.color}
                </span>
              </div>
            )}
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
