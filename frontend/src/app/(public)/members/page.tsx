import { Metadata } from 'next'
import { getPublicMembers } from '@/shared/api/supabase/queries.server'
import type { MemberProfile } from '@/types/supabase'
import MembersClient from './MembersClient'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
  title: 'Members - AIM (AI Monsters)',
  description: 'AIM 동아리의 멋진 부원들을 소개합니다. 각자의 전문성과 열정으로 함께 AI/ML 분야에서 성장하고 있습니다.',
}

// Server-side member sorting logic
function sortMembers(members: MemberProfile[]): {
  executives: MemberProfile[]
  regularMembers: MemberProfile[]
} {
  // 직책별로 멤버 분류 - 회장, 부회장, 운영진은 운영진으로, 나머지는 부원으로
  const executives = members.filter(member => {
    const position = member.position?.toLowerCase() || ''
    return position === '회장' ||
           position === '부회장' ||
           position === '운영진'
  })

  const regularMembers = members.filter(member => {
    const position = member.position?.toLowerCase() || ''
    return position !== '회장' &&
           position !== '부회장' &&
           position !== '운영진'
  })

  // 운영진 정렬: 회장 → 부회장 → 나머지(기수 먼저, 동기수 시 가나다)
  const sortedExecutives = executives.sort((a, b) => {
    const positionA = a.position?.toLowerCase() || ''
    const positionB = b.position?.toLowerCase() || ''

    // 회장이 최우선
    if (positionA === '회장' && positionB !== '회장') return -1
    if (positionB === '회장' && positionA !== '회장') return 1

    // 부회장이 두 번째 우선
    if (positionA === '부회장' && positionB !== '부회장' && positionB !== '회장') return -1
    if (positionB === '부회장' && positionA !== '부회장' && positionA !== '회장') return 1

    // 나머지 운영진은 기수 먼저, 동기수 시 가나다 순
    const generationA = a.generation || 0
    const generationB = b.generation || 0

    if (generationA !== generationB) {
      return generationA - generationB // 낮은 기수부터
    }

    // 동기수인 경우 가나다 순
    const nameA = a.display_name.toLowerCase()
    const nameB = b.display_name.toLowerCase()
    return nameA.localeCompare(nameB, 'ko')
  })

  // 부원 정렬: 기수 먼저, 동기수 시 가나다 순
  const sortedRegularMembers = regularMembers.sort((a, b) => {
    const generationA = a.generation || 0
    const generationB = b.generation || 0

    if (generationA !== generationB) {
      return generationA - generationB // 낮은 기수부터
    }

    // 동기수인 경우 가나다 순
    const nameA = a.display_name.toLowerCase()
    const nameB = b.display_name.toLowerCase()
    return nameA.localeCompare(nameB, 'ko')
  })

  return {
    executives: sortedExecutives,
    regularMembers: sortedRegularMembers,
  }
}

export default async function MembersPage() {
  // Fetch data server-side
  const members = await getPublicMembers()

  // Sort members server-side
  const { executives, regularMembers } = sortMembers(members)

  return <MembersClient executives={executives} regularMembers={regularMembers} />
}
