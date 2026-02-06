'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import type { EditContext } from '../types'

interface DeleteConfirmViewProps {
  itemType: EditContext
  itemTitle: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

const _typeLabels: Record<EditContext, string> = {
  sections: '섹션',
  activities: '활동',
  history: '히스토리',
  contact: '연락처',
}

export default function DeleteConfirmView({
  itemType,
  itemTitle,
  onConfirm,
  onCancel,
  isDeleting
}: DeleteConfirmViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 max-w-lg mx-auto">
      {/* Warning Icon */}
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-400" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">
        정말 삭제하시겠습니까?
      </h2>

      {/* Item Preview */}
      <p className="text-lg text-violet-400 mb-4">
        &ldquo;{itemTitle}&rdquo;
      </p>

      {/* Warning Message */}
      <p className="text-gray-400 text-sm mb-8 text-center">
        이 작업은 되돌릴 수 없습니다.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isDeleting}
        >
          취소
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          loading={isDeleting}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </Button>
      </div>
    </div>
  )
}
