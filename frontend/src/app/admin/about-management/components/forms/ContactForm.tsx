'use client'

import { ArrowLeft, Mail, Github, Instagram, Phone } from 'lucide-react'
import { ContactFormData } from '../../types'

interface ContactFormProps {
  formData: ContactFormData
  onChange: (field: keyof ContactFormData, value: any) => void
  onSubmit: () => void
  onCancel: () => void
  isSubmitting: boolean
  hasChanges: boolean
  mode: 'add' | 'edit'
}

const typeOptions = [
  { value: 'email', label: '이메일', icon: Mail },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'phone', label: '전화', icon: Phone },
]

const validateValue = (type: string, value: string): boolean => {
  if (type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
  if (type === 'github' || type === 'instagram') {
    return value.startsWith('https://')
  }
  if (type === 'phone') {
    return /^[\d\s\-+()]+$/.test(value)
  }
  return true
}

const getValuePlaceholder = (type: string): string => {
  switch (type) {
    case 'email':
      return '예: aim@kookmin.ac.kr'
    case 'github':
      return '예: https://github.com/AIM-kookmin'
    case 'instagram':
      return '예: https://instagram.com/aim_kookmin'
    case 'phone':
      return '예: 02-910-4000'
    default:
      return ''
  }
}

const getValueErrorMessage = (type: string): string => {
  switch (type) {
    case 'email':
      return '올바른 이메일 형식이 아닙니다.'
    case 'github':
    case 'instagram':
      return 'URL은 https://로 시작해야 합니다.'
    case 'phone':
      return '올바른 전화번호 형식이 아닙니다. (숫자, 공백, -, +, () 허용)'
    default:
      return '올바른 형식이 아닙니다.'
  }
}

export default function ContactForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  hasChanges,
  mode,
}: ContactFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.type) {
      alert('연락처 타입을 선택해주세요.')
      return
    }
    if (!formData.label.trim()) {
      alert('라벨을 입력해주세요.')
      return
    }
    if (formData.label.length > 50) {
      alert('라벨은 50자를 초과할 수 없습니다.')
      return
    }
    if (!formData.value.trim()) {
      alert('값을 입력해주세요.')
      return
    }
    if (formData.value.length > 200) {
      alert('값은 200자를 초과할 수 없습니다.')
      return
    }
    if (!validateValue(formData.type, formData.value)) {
      alert(getValueErrorMessage(formData.type))
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
                {mode === 'add' ? '연락처 추가' : '연락처 수정'}
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
              form="contact-form"
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
          id="contact-form"
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-8 space-y-6"
        >
          {/* Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              타입 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = formData.type === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange('type', option.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-violet-500/20 border-violet-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Label Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              라벨 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => onChange('label', e.target.value)}
              maxLength={50}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              placeholder="예: 공식 이메일, 깃허브 조직, 인스타그램 계정"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.label.length}/50
            </div>
          </div>

          {/* Value Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              값 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => onChange('value', e.target.value)}
              maxLength={200}
              className={`w-full bg-white/5 border text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${
                formData.value &&
                !validateValue(formData.type, formData.value)
                  ? 'border-red-500'
                  : 'border-white/10'
              }`}
              placeholder={getValuePlaceholder(formData.type)}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-500">
                {formData.value.length}/200
              </div>
              {formData.value &&
                !validateValue(formData.type, formData.value) && (
                  <div className="text-xs text-red-500">
                    {getValueErrorMessage(formData.type)}
                  </div>
                )}
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
