'use client'

import React, { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { useLenisControl } from '@/shared/hooks'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  submitText?: string
  cancelText?: string
  showSubmitButton?: boolean
  showCancelButton?: boolean
  submitDisabled?: boolean
  submitVariant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = '저장',
  cancelText = '취소',
  showSubmitButton = true,
  showCancelButton = true,
  submitDisabled = false,
  submitVariant = 'primary',
  maxWidth = '4xl'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  useLenisControl(isOpen)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  }

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
      style={{ backdropFilter: 'blur(8px) saturate(150%)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-gray-800 border border-gray-700 rounded-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-bold text-white">
            {title}
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {onSubmit ? (
            <form onSubmit={handleSubmit} className="space-y-6" id="modal-form">
              {children}
            </form>
          ) : (
            children
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            {showCancelButton && (
              <Button type="button" onClick={onClose} variant="ghost">
                {cancelText}
              </Button>
            )}
            {showSubmitButton && onSubmit && (
              <Button
                type="submit"
                form="modal-form"
                variant={submitVariant}
                disabled={submitDisabled}
              >
                {submitText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render modal using React Portal to document.body
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default Modal
