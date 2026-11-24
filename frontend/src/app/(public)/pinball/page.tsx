import type { Metadata } from 'next'
import { PinballGame } from '@/features/PinballGame'

export const metadata: Metadata = {
  title: '핀볼 서바이벌 | AIM',
  description:
    '이름을 넣고 시작하는 핀볼 서바이벌 추첨. 회전 장애물과 서든데스를 뚫고 마지막까지 살아남은 한 명이 당첨됩니다.',
}

/** 이름으로 참가하는 공개 핀볼 서바이벌 페이지. */
export default function PinballPage() {
  return <PinballGame />
}
