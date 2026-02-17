'use client'

import { useEffect, useState } from 'react'
import { Button, Text, Title, Subtitle, Loading, Modal } from '@/shared/ui'
import { DataTable } from '@/shared/ui/DataTable'
import { CardGrid } from '@/shared/ui/CardGrid'
import { ViewToggle } from '@/shared/ui/ViewToggle'
import { MemberCard } from '@/entities/member'
import { adminUpdateMember, uploadMemberAvatar, getPendingMembers, approveMember, rejectMember, getActiveMembers } from '@/shared/api/supabase'
import type { MemberProfile } from '@/types/supabase'

interface EditMemberData {
  display_name: string
  student_id: string
  position: string
  department: string
  generation: number
  bio: string
  is_public: boolean
  avatar_url: string
  one_liner: string
}

export default function MemberManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active')
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [pendingMembers, setPendingMembers] = useState<MemberProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [deletingMember, setDeletingMember] = useState<MemberProfile | null>(null)
  const [editingMember, setEditingMember] = useState<MemberProfile | null>(null)
  
  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvUploading, setCsvUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [selectedMembers, setSelectedMembers] = useState<MemberProfile[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  
  // New member creation state
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  
  const [formData, setFormData] = useState<EditMemberData>({
    display_name: '',
    student_id: '',
    position: '',
    department: '',
    generation: 0,
    bio: '',
    is_public: true,
    avatar_url: '',
    one_liner: ''
  })
  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    confirmText?: string
    onConfirm?: () => void
    hiding?: boolean
  }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: undefined,
    hiding: false
  })

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, confirmText?: string, onConfirm?: () => void) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      confirmText,
      onConfirm,
      hiding: false
    })
    
    if (!confirmText) {
      setTimeout(() => {
        hideNotification()
      }, 3000)
    }
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, hiding: true }))
    setTimeout(() => {
      setNotification({
        show: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: '',
        onConfirm: undefined,
        hiding: false
      })
    }, 300)
  }

  const handleNotificationConfirm = () => {
    if (notification.onConfirm) {
      notification.onConfirm()
    }
    hideNotification()
  }

  useEffect(() => {
    fetchMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('card')
      }
    }

    handleResize() // Check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  const fetchMembers = async () => {
    try {
      const [activeData, pendingData] = await Promise.all([
        getActiveMembers(),
        getPendingMembers()
      ])
      setMembers(activeData)
      setPendingMembers(pendingData)
    } catch (error) {
      console.error('멤버 목록 로딩 실패:', error)
      showNotification('error', '오류 발생', '멤버 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMember = async (member: MemberProfile) => {
    try {
      await approveMember(member.id)
      showNotification('success', '승인 완료', `${member.display_name}님의 가입이 승인되었습니다.`)
      fetchMembers()
    } catch (error) {
      console.error('멤버 승인 실패:', error)
      showNotification('error', '오류 발생', '멤버 승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectMember = async (member: MemberProfile) => {
    try {
      await rejectMember(member.id)
      showNotification('success', '거절 완료', `${member.display_name}님의 가입이 거절되었습니다.`)
      fetchMembers()
    } catch (error) {
      console.error('멤버 거절 실패:', error)
      showNotification('error', '오류 발생', '멤버 거절 중 오류가 발생했습니다.')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const openAddModal = () => {
    setEditingMember(null)
    setCreateEmail('')
    setCreatePassword('')
    setAvatarFile(null)
    setAvatarPreview('')
    setFormData({
      display_name: '',
      student_id: '',
      position: '',
      department: '',
      generation: 0,
      bio: '',
      is_public: true,
      avatar_url: '',
      one_liner: ''
    })
    setShowModal(true)
  }

  const openEditModal = (member: MemberProfile) => {
    setEditingMember(member)
    setAvatarFile(null)
    setAvatarPreview(member.avatar_url || '')
    setFormData({
      display_name: member.display_name,
      student_id: member.student_id || '',
      position: member.position || '',
      department: member.department || '',
      generation: member.generation || 0,
      bio: member.bio || '',
      is_public: member.is_public ?? true,
      avatar_url: member.avatar_url || '',
      one_liner: member.one_liner || ''
    })
    setShowModal(true)
  }


  const closeModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setFormData({
      display_name: '',
      student_id: '',
      position: '',
      department: '',
      generation: 0,
      bio: '',
      is_public: true,
      avatar_url: '',
      one_liner: ''
    })
  }

  const handleSubmit = async () => {
    try {
      let avatarUrl = formData.avatar_url
      if (avatarFile) {
        try {
          // For new members, use a temporary ID; for existing, use their user_id
          const uploadId = editingMember?.user_id || `temp_${Date.now()}`
          avatarUrl = await uploadMemberAvatar(uploadId, avatarFile)
        } catch (error) {
          console.error('Avatar upload failed:', error)
          showNotification('error', '오류', '프로필 이미지 업로드에 실패했습니다.')
          return
        }
      }

      const updatedFormData = { ...formData, avatar_url: avatarUrl }

      if (editingMember) {
        await adminUpdateMember(editingMember.id, updatedFormData)
        showNotification('success', '완료', '멤버가 성공적으로 수정되었습니다.')
        closeModal()
        fetchMembers()
      } else {
        // Validation for new member
        if (!createEmail || !createPassword) {
          showNotification('error', '오류', '이메일과 비밀번호는 필수입니다.')
          return
        }
        if (createPassword.length < 6) {
          showNotification('error', '오류', '비밀번호는 최소 6자 이상이어야 합니다.')
          return
        }

        const response = await fetch('/api/admin/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createEmail,
            password: createPassword,
            profile: updatedFormData
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create member')
        }

        showNotification('success', '완료', '새 멤버가 성공적으로 추가되었습니다.')
        closeModal()
        fetchMembers()
      }
    } catch (error) {
      console.error('멤버 처리 실패:', error)
      showNotification('error', '오류 발생', `멤버 ${editingMember ? '수정' : '추가'} 중 오류가 발생했습니다.`)
    }
  }

  const openDeleteModal = (member: MemberProfile) => {
    setDeletingMember(member)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingMember(null)
  }

  const confirmDelete = async () => {
    if (!deletingMember) return

    try {
      // Use the API route for deletion to handle both auth user and profile
      const response = await fetch(`/api/admin/members?userId=${deletingMember.user_id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete member')
      }

      showNotification('success', '삭제 완료', '멤버가 삭제되었습니다.')
      closeDeleteModal()
      fetchMembers()
    } catch (error) {
      console.error('멤버 삭제 실패:', error)
      showNotification('error', '오류 발생', '멤버 삭제 중 오류가 발생했습니다.')
    }
  }

  const openCsvModal = () => {
    setCsvFile(null)
    setShowCsvModal(true)
  }

  const closeCsvModal = () => {
    setShowCsvModal(false)
    setCsvFile(null)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('warning', '파일 형식 오류', 'CSV 파일만 업로드 가능합니다.')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { 
        showNotification('warning', '파일 크기 초과', '파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      console.log('선택된 파일 정보:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      })
      
      setCsvFile(file)
    }
  }

  const parseCsvFile = async (file: File): Promise<Record<string, unknown>[]> => {
    const tryParseWithEncoding = (encoding: string): Promise<Record<string, unknown>[]> => {
      return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) {
          reject(new Error('유효하지 않은 파일입니다.'))
          return
        }

        if (file.size === 0) {
          reject(new Error('빈 파일입니다.'))
          return
        }

        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string
            
            if (!text || text.trim().length === 0) {
              reject(new Error('CSV 파일이 비어있습니다.'))
              return
            }

            console.log(`[${encoding}] CSV 파일 내용 미리보기:`, text.substring(0, 200))

            const hasGarbledKorean = /[\uFFFD]/.test(text.substring(0, 500))
            if (hasGarbledKorean && encoding === 'UTF-8') {
              reject(new Error('ENCODING_ERROR'))
              return
            }

            const lines = text.split(/\r?\n/).filter(line => line.trim())
            
            if (lines.length < 2) {
              reject(new Error('CSV 파일에 데이터가 없습니다. (헤더만 있거나 비어있음)'))
              return
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
            console.log('CSV 헤더:', headers)
            
            const members = []

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
              
              const member: Record<string, unknown> = {}

              headers.forEach((header, index) => {
                const value = values[index]
                if (value) {
                  if (header === 'generation') {
                    member[header] = value ? parseInt(value) : null
                  } else if (header === 'isPublic' || header === 'is_public') {
                    member[header === 'isPublic' ? 'is_public' : header] = value.toLowerCase() === 'true'
                  } else {
                    member[header] = value
                  }
                }
              })

              if (member.email) {
                members.push(member)
              }
            }

            console.log('파싱된 멤버 수:', members.length)

            if (members.length === 0) {
              reject(new Error('유효한 멤버 데이터가 없습니다.'))
              return
            }

            resolve(members)
          } catch (error) {
            console.error('CSV 파싱 오류:', error)
            reject(new Error(`CSV 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`))
          }
        }
        
        reader.onloadstart = () => {
          console.log(`[${encoding}] 파일 읽기 시작:`, file.name)
        }
        
        reader.onerror = (e) => {
          console.error('파일 읽기 오류 상세:', {
            error: e,
            readyState: reader.readyState,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          })
          reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
        }
        
        reader.onabort = () => {
          reject(new Error('파일 읽기가 중단되었습니다.'))
        }
        
        try {
          console.log(`[${encoding}] FileReader로 파일 읽기 시작`)
          reader.readAsText(file, encoding)
        } catch (error) {
          console.error('readAsText 호출 오류:', error)
          reject(new Error(`파일 읽기를 시작할 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`))
        }
      })
    }

    try {
      return await tryParseWithEncoding('UTF-8')
    } catch (error) {
      if (error instanceof Error && error.message === 'ENCODING_ERROR') {
        console.log('UTF-8 인코딩 실패, EUC-KR로 재시도...')
        try {
          return await tryParseWithEncoding('EUC-KR')
        } catch {
          console.log('EUC-KR 인코딩 실패, CP949로 재시도...')
          return await tryParseWithEncoding('CP949')
        }
      }
      throw error
    }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) {
      showNotification('warning', '파일 선택', 'CSV 파일을 선택해주세요.')
      return
    }

    try {
      setCsvUploading(true)
      const members = await parseCsvFile(csvFile)

      if (members.length === 0) {
        showNotification('warning', '데이터 없음', '유효한 멤버 데이터가 없습니다.')
        return
      }

      console.log('Parsed members:', members);
      showNotification('info', '준비 중', 'CSV 업로드 기능은 현재 마이그레이션 중입니다. 나중에 다시 시도해주세요.')
      
      closeCsvModal()
    } catch (error) {
      console.error('CSV 업로드 오류:', error)
      showNotification('error', '오류 발생', error instanceof Error ? error.message : 'CSV 파일 처리 중 오류가 발생했습니다.')
    } finally {
      setCsvUploading(false)
    }
  }

  const downloadCsvTemplate = () => {
    const template = `email,name,display_name,student_id,position,department,generation,is_public
kim123@kookmin.ac.kr,김철수,철수,20241234,부원,소프트웨어학부,3,true
lee456@kookmin.ac.kr,이영희,영희,20231111,운영진,인공지능학부,2,true`

    // UTF-8 BOM을 추가하여 Excel에서 한글이 정상적으로 표시되도록 함
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'member_template.csv'
    link.click()
  }

  const handleSelectionChange = (selectedItems: MemberProfile[]) => {
    setSelectedMembers(selectedItems)
  }

  const handleBulkAction = async (action: string, _selectedItems: MemberProfile[]) => {
    if (action === 'delete') {
      setShowBulkDeleteModal(true)
    }
  }

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = selectedMembers.map(async (member) => {
        const response = await fetch(`/api/admin/members?userId=${member.user_id}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Failed to delete')
        }
        return response
      })

      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failCount = results.length - successCount

      if (successCount > 0) {
        showNotification('success', '다중 삭제 완료', `${successCount}명의 멤버가 삭제되었습니다.${failCount > 0 ? ` (${failCount}명 실패)` : ''}`)
        setSelectedMembers([])
        fetchMembers()
      } else {
        showNotification('error', '삭제 실패', '선택된 멤버 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('다중 삭제 실패:', error)
      showNotification('error', '오류 발생', '다중 삭제 중 오류가 발생했습니다.')
    } finally {
      setShowBulkDeleteModal(false)
    }
  }

  const closeBulkDeleteModal = () => {
    setShowBulkDeleteModal(false)
  }

  const flattenedMembers = members.map(member => ({
    ...member,
    display_name: member.display_name,
    student_id: member.student_id || '',
    department: member.department || '',
    generation: member.generation || 0,
    position: member.position || '',
    bio: member.bio || '',
    is_public: member.is_public ?? true
  }))

  const tableColumns = [
    {
      key: 'display_name',
      label: '멤버',
      sortable: true,
      width: '200px',
      render: (member: MemberProfile) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">
              {member.display_name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {member.display_name}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'student_id',
      label: '학번',
      sortable: true,
      render: (member: MemberProfile) => (
        <div className="text-sm text-gray-300">
          {member.student_id || '-'}
        </div>
      )
    },
    {
      key: 'department',
      label: '학과',
      sortable: true,
      render: (member: MemberProfile) => (
        <div className="text-sm text-gray-300">
          {member.department || '-'}
        </div>
      )
    },
    {
      key: 'generation',
      label: '기수',
      sortable: true,
      render: (member: MemberProfile) => (
        <div className="text-sm text-gray-300">
          {member.generation ? `${member.generation}기` : '-'}
        </div>
      )
    },
    {
      key: 'position',
      label: '직책',
      sortable: true,
      render: (member: MemberProfile) => (
        <div className="text-sm text-gray-300">
          {member.position || '-'}
        </div>
      )
    },
    {
      key: 'created_at',
      label: '가입일',
      sortable: true,
      render: (member: MemberProfile) => (
        <div className="text-sm text-gray-300">
          {new Date(member.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: '작업',
      render: (member: MemberProfile) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(member)}
            className="p-2 text-gray-400 hover:text-violet-400 hover:bg-gray-600 rounded-lg transition-colors"
            title="수정"
          >
            ✏️
          </button>
          <button
            onClick={() => openDeleteModal(member)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      key: 'delete',
      label: '선택 삭제',
      icon: '🗑️',
      variant: 'danger' as const
    }
  ]

  const viewOptions = [
    { key: 'card', label: '카드', icon: '📋' },
    { key: 'list', label: '리스트', icon: '📝' }
  ]


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loading text="멤버 목록을 불러오는 중..." size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={1} className="text-white mb-2">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
              AIM
            </span>{' '}
            멤버 관리
          </Title>
          <Subtitle className="text-gray-400">
            동아리 멤버들의 정보를 관리합니다.
          </Subtitle>
        </div>
        <div className="flex gap-3">
          {activeTab === 'active' && (
            <>
              <div className="hidden md:flex">
                <ViewToggle
                  currentView={viewMode}
                  views={viewOptions}
                  onViewChange={(view) => setViewMode(view as 'card' | 'list')}
                />
              </div>
              <Button onClick={openCsvModal} variant="secondary">
                📄 .csv로 추가
              </Button>
              <Button onClick={openAddModal} variant="primary">
                + 새 멤버 추가
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'active'
              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          활동 멤버 ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          가입 요청 ({pendingMembers.length})
          {pendingMembers.length > 0 && activeTab !== 'pending' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {pendingMembers.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingMembers.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <Text className="text-gray-400">대기 중인 가입 요청이 없습니다.</Text>
            </div>
          ) : (
            pendingMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {member.display_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{member.display_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        {member.student_id && <span>{member.student_id}</span>}
                        {member.department && <span>• {member.department}</span>}
                        {member.generation && <span>• {member.generation}기</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('ko-KR')} 요청
                    </span>
                    <button
                      onClick={() => handleRejectMember(member)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                    >
                      거절
                    </button>
                    <button
                      onClick={() => handleApproveMember(member)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition-colors"
                    >
                      승인
                    </button>
                  </div>
                </div>
                {member.bio && (
                  <p className="mt-4 text-gray-400 text-sm border-t border-white/10 pt-4">
                    {member.bio}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'active' && viewMode === 'card' ? (
        <CardGrid
          data={members}
          keyField="id"
          renderCard={(member) => (
            <MemberCard
              member={member}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}
          emptyMessage="등록된 멤버가 없습니다."
          columns={{
            default: 1,
            md: 2,
            lg: 3
          }}
        />
      ) : activeTab === 'active' ? (
            <DataTable
              data={flattenedMembers}
              columns={tableColumns}
              keyField="id"
              selectable={true}
              onSelectionChange={handleSelectionChange}
              onBulkAction={handleBulkAction}
              bulkActions={bulkActions}
              emptyMessage="등록된 멤버가 없습니다."
            />
      ) : null}

      {/* 멤버 모달 */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMember ? '멤버 정보 수정' : '새 멤버 추가'}
        onSubmit={handleSubmit}
        submitText={editingMember ? '수정' : '추가'}
        maxWidth="4xl"
      >
        <div className="mb-6 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-full h-full rounded-full object-cover border-2 border-violet-500"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                <span className="text-4xl">👤</span>
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-violet-600 p-2 rounded-full cursor-pointer hover:bg-violet-500 transition-colors shadow-lg"
            >
              <span className="text-white text-xs">📷</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <Text variant="secondary" size="sm">프로필 이미지 클릭하여 변경</Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {!editingMember && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">이메일 *</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">비밀번호 *</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="최소 6자 이상"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-white font-medium mb-2">표시명</label>
                <input
                  type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="표시할 이름을 입력하세요"
                />
              </div>

              <div>
            <label className="block text-white font-medium mb-2">학번</label>
                <input
                  type="text"
              value={formData.student_id}
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="학번을 입력하세요"
                />
              </div>

              <div>
            <label className="block text-white font-medium mb-2">학과</label>
                <input
                  type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="학과를 입력하세요"
                />
              </div>

              <div>
            <label className="block text-white font-medium mb-2">기수</label>
            <input
              type="number"
              value={formData.generation || ""}
              onChange={(e) => setFormData({...formData, generation: parseInt(e.target.value) || 0})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="기수를 입력하세요 (예: 1, 2, 3...)"
              min="0"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">직책</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="직책을 입력하세요"
            />
              </div>

            </div>

            <div className="mt-4">
          <label className="block text-white font-medium mb-2">자기소개</label>
              <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
            className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="간단한 자기소개를 작성해주세요"
              />
            </div>
            
            <div className="mt-4">
          <label className="block text-white font-medium mb-2">한줄 소개</label>
              <input
            type="text"
            value={formData.one_liner}
            onChange={(e) => setFormData({...formData, one_liner: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="한줄 소개를 입력하세요"
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-white">프로필 공개</span>
              </label>
            </div>
      </Modal>

      {/* CSV 업로드 모달 */}
      <Modal
        isOpen={showCsvModal}
        onClose={closeCsvModal}
        title="CSV로 멤버 추가"
        onSubmit={handleCsvUpload}
        submitText={csvUploading ? "업로드 중..." : "업로드"}
        cancelText="취소"
        submitDisabled={!csvFile || csvUploading}
      >
        <div className="space-y-6">
          {/* 안내 문구 */}
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <Title level={5} className="text-violet-400 mb-2">
              📋 CSV 파일 형식
            </Title>
            <Text variant="secondary" size="sm" className="mb-3">
              다음 필드를 포함한 CSV 파일을 업로드하세요:
            </Text>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>필수:</strong> email, name</li>
              <li><strong>선택:</strong> displayName, studentId, position, department, generation, role, isPublic</li>
            </ul>
            <Text variant="muted" size="sm" className="mt-3">
              💡 초기 비밀번호는 이메일 주소의 @ 앞부분으로 자동 설정됩니다.
            </Text>
            <Text variant="muted" size="sm" className="mt-2">
              📝 엑셀에서 저장 시 "CSV UTF-8(쉼표로 분리)"을 권장합니다.
            </Text>
          </div>

          {/* 템플릿 다운로드 */}
          <div>
            <Button 
              onClick={downloadCsvTemplate} 
              variant="secondary"
              className="w-full"
            >
              📥 템플릿 다운로드
            </Button>
          </div>

          {/* 파일 선택 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              CSV 파일 선택
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                       file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:bg-violet-500 file:text-white
                       hover:file:bg-violet-400 cursor-pointer"
            />
            {csvFile && (
              <div className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                <Text variant="secondary" size="sm" className="font-semibold text-violet-400">
                  ✓ 선택된 파일
                </Text>
                <Text variant="muted" size="sm" className="mt-1">
                  📄 {csvFile.name}
                </Text>
                <Text variant="muted" size="sm">
                  💾 {(csvFile.size / 1024).toFixed(2)} KB
                </Text>
              </div>
            )}
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-0.5">⚠️</span>
              <div>
                <Title level={6} className="text-yellow-400 mb-1">
                  주의사항
                </Title>
                <ul className="text-sm text-yellow-200/80 space-y-1 list-disc list-inside">
                  <li>중복된 이메일은 건너뜁니다</li>
                  <li>이메일은 @kookmin.ac.kr 도메인만 허용됩니다</li>
                  <li>업로드 후 콘솔에서 초기 비밀번호를 확인하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 다중 삭제 확인 모달 */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={closeBulkDeleteModal}
        title="다중 삭제 확인"
        onSubmit={confirmBulkDelete}
        submitText="삭제"
        cancelText="취소"
        submitVariant="secondary"
      >
        <div className="space-y-4">
          <Text variant="secondary">
            선택된 {selectedMembers.length}명의 멤버를 삭제하시겠습니까?
          </Text>
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-h-40 overflow-y-auto">
            <Text variant="muted" size="sm" className="mb-2">
              삭제될 멤버:
            </Text>
            <ul className="space-y-1">
              {selectedMembers.map((member) => (
                <li key={member.id} className="text-sm text-gray-300">
                  • {member.display_name}
                </li>
              ))}
            </ul>
          </div>
          <Text variant="muted" size="sm" className="text-red-400">
            ⚠️ 이 작업은 되돌릴 수 없습니다.
          </Text>
        </div>
      </Modal>

      {/* 알림 */}
      {notification.show && (
        <>
          {/* 중앙 모달 (확인 버튼이 있는 경우) */}
          {notification.confirmText && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                  {notification.type === 'success' && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                  {notification.type === 'error' && (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✕</span>
                    </div>
                  )}
                  {notification.type === 'warning' && (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">⚠</span>
                    </div>
                  )}
                  {notification.type === 'info' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">ℹ</span>
                    </div>
                  )}
                  <Title level={4} className="text-white">
                    {notification.title}
                  </Title>
                </div>
                {notification.message && (
                  <Text variant="secondary" className="mb-4">
                    {notification.message}
                  </Text>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleNotificationConfirm}
                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                      notification.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                      notification.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-violet-600 hover:bg-violet-700'
                    }`}
                  >
                    {notification.confirmText}
                  </button>
                  <button
                    onClick={hideNotification}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 우상단 토스트 (자동 사라짐) */}
          {!notification.confirmText && (
            <div className={`fixed top-4 right-4 z-50 bg-gray-800 border ${
              notification.type === 'success' ? 'border-green-500' : 
              notification.type === 'error' ? 'border-red-500' :
              notification.type === 'warning' ? 'border-yellow-500' :
              'border-blue-500'
            } rounded-lg p-4 w-80 shadow-2xl ${
              notification.hiding ? 'animate-slide-out-right' : 'animate-slide-in-right'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${
                  notification.type === 'success' ? 'bg-green-500' : 
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <span className="text-2xl ml-2">
                  {notification.type === 'success' ? '✓' : 
                   notification.type === 'error' ? '⚠️' :
                   notification.type === 'warning' ? '⚠️' :
                   'ℹ️'}
                </span>
                <div className="flex-1">
                  <Title level={4} className={`mb-1 ${
                    notification.type === 'success' ? 'text-green-400' : 
                    notification.type === 'error' ? 'text-red-400' :
                    notification.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {notification.title}
                  </Title>
                  {notification.message && (
                    <Text variant="secondary" size="sm">
                      {notification.message}
                    </Text>
                  )}
                </div>
                <Button onClick={hideNotification} variant="ghost" size="sm" className="hover:bg-gray-700 -mt-1">
                  ✕
                </Button>
              </div>
              {/* 진행 바 */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                <div className={`h-full ${
                  notification.type === 'success' ? 'bg-green-500' : 
                  notification.type === 'error' ? 'bg-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                } animate-progress`}></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        submitText="삭제"
        onSubmit={confirmDelete}
        title="삭제 확인"
      >
        <div className="space-y-4">
          <Text className="text-white">
            {deletingMember && (
              <>
                <span className="font-semibold text-red-400">
                  "{deletingMember.display_name}"
                </span>
                님을 삭제하시겠습니까?
              </>
            )}
          </Text>
          <Text variant="secondary" size="sm">
            이 작업은 되돌릴 수 없습니다.
          </Text>
          
        </div>
      </Modal>
    </div>
  )
}
