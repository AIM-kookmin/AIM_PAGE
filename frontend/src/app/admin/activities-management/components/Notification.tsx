'use client'

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface NotificationProps {
  show: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  hiding?: boolean
  onClose: () => void
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const COLORS = {
  success: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: 'text-green-400',
    progress: 'bg-green-500'
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'text-red-400',
    progress: 'bg-red-500'
  },
  warning: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
    progress: 'bg-yellow-500'
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: 'text-blue-400',
    progress: 'bg-blue-500'
  }
}

export default function Notification({
  show,
  type,
  title,
  message,
  hiding,
  onClose
}: NotificationProps) {
  if (!show) return null

  const Icon = ICONS[type]
  const colors = COLORS[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-xl border ${colors.border} rounded-xl p-4 w-96 shadow-2xl transition-all duration-300 ${
        hiding ? 'animate-slide-out-right opacity-0 translate-x-4' : 'animate-slide-in-right'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${colors.text} mb-0.5`}>
            {title}
          </h4>
          {message && (
            <p className="text-gray-400 text-sm leading-relaxed">
              {message}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-500 hover:text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-xl overflow-hidden">
        <div className={`h-full ${colors.progress} animate-progress`} />
      </div>
    </div>
  )
}
