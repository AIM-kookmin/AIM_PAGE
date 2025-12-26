/**
 * 애플리케이션 설정
 */

// 백엔드 API URL (끝의 슬래시 제거)
const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  return url.replace(/\/+$/, '') // 끝의 슬래시 제거
}

export const API_BASE_URL = getApiBaseUrl()

// 기타 설정
export const APP_NAME = 'AIM: AI Monsters'
export const APP_DESCRIPTION = 'AIM (AI Monsters) - 국민대학교 AI와 머신러닝 동아리'

