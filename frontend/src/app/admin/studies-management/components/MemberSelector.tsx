'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, Check } from 'lucide-react'
import { getActiveMembers } from '@/shared/api/supabase'
import type { MemberProfile } from '@/types/supabase'

interface MemberSelectorProps {
  selectedMembers: string[]
  onChange: (members: string[]) => void
  onError: (message: string) => void
}

export default function MemberSelector({
  selectedMembers,
  onChange,
  onError
}: MemberSelectorProps) {
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await getActiveMembers()
      setMembers(data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
      onError('멤버 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.student_id && member.student_id.includes(searchQuery))
  )

  const toggleMember = (memberName: string) => {
    if (selectedMembers.includes(memberName)) {
      onChange(selectedMembers.filter(m => m !== memberName))
    } else {
      onChange([...selectedMembers, memberName])
    }
  }

  const removeMember = (memberName: string) => {
    onChange(selectedMembers.filter(m => m !== memberName))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        참여 멤버
      </label>

      {/* Selected Members Display */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          {selectedMembers.map(memberName => {
            const isActive = members.some(m => m.display_name === memberName)
            return (
              <div
                key={memberName}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                  isActive
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                    : 'bg-gray-500/10 border-gray-500/30 text-gray-400 opacity-60'
                }`}
              >
                <span>{memberName}{!isActive && ' (비활성)'}</span>
                <button
                  type="button"
                  onClick={() => removeMember(memberName)}
                  className="hover:bg-violet-500/30 rounded-full p-0.5 transition-colors duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
          >
            전체 삭제
          </button>
        </div>
      )}

      {/* Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
        >
          <span className="text-gray-400">
            {selectedMembers.length > 0
              ? `${selectedMembers.length}명 선택됨`
              : '멤버 선택하기'}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름 또는 학번 검색..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Member List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-2" />
                  로딩 중...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  검색 결과가 없습니다
                </div>
              ) : (
                filteredMembers.map(member => {
                  const isSelected = selectedMembers.includes(member.display_name)
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.display_name)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors duration-200 ${
                        isSelected ? 'bg-violet-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-violet-300">
                              {member.display_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-left">
                          <div className="text-sm font-medium text-white">
                            {member.display_name}
                          </div>
                          {member.student_id && (
                            <div className="text-xs text-gray-400">
                              {member.student_id}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-violet-400" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {filteredMembers.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                <div className="text-xs text-gray-400 text-center">
                  총 {filteredMembers.length}명의 멤버
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
