'use client'

import { Card } from '@/shared/ui/Card'
import { Title, Text } from '@/shared/ui/Text'
import type { MemberProfile } from '@/types/supabase'

interface MemberCardProps {
  member: MemberProfile
  onEdit: (member: MemberProfile) => void
  onDelete: (member: MemberProfile) => void
  className?: string
}

export function MemberCard({ member, onEdit, onDelete, className = '' }: MemberCardProps) {
  return (
    <Card className={`hover:border-cyan-500 transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">
            {member.display_name.charAt(0)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(member)}
            className="text-cyan-400 hover:text-cyan-300 text-sm px-2 py-1 bg-gray-700 rounded border border-gray-600 hover:border-cyan-500 transition-colors"
          >
            ✏️ 편집
          </button>
          <button
            onClick={() => onDelete(member)}
            className="text-red-400 hover:text-red-300 text-sm px-2 py-1 bg-gray-700 rounded border border-gray-600 hover:border-red-500 transition-colors"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Title level={3} className="text-white">
          {member.display_name}
        </Title>
        {member.student_id && (
          <Text variant="muted" size="sm">
            학번: {member.student_id}
          </Text>
        )}
        {member.department && (
          <Text variant="muted" size="sm">
            {member.department}
          </Text>
        )}
        {member.generation && (
          <Text variant="muted" size="sm" className="font-semibold text-pink-400">
            {member.generation}기
          </Text>
        )}
        {member.position && (
          <Text variant="muted" size="sm">
            {member.position}
          </Text>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {new Date(member.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  )
}
