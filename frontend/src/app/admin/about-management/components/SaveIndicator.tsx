'use client'

import { Check, Loader2, AlertCircle } from 'lucide-react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-white/60" />
          <span className="text-white/60">저장 중...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">저장됨</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-red-400">저장 실패</span>
        </>
      )}
    </div>
  )
}
