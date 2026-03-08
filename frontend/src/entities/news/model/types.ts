export type NewsCategory = '공지' | '행사' | '성과' | '소식' | '기타'

export const NEWS_CATEGORIES: NewsCategory[] = ['공지', '행사', '성과', '소식', '기타']

export interface News {
  id: string
  title: string
  subtitle: string | null
  category: NewsCategory
  date: string
  thumbnail_url: string | null
  card_images: string[]
  link: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface NewsInsert {
  title: string
  subtitle?: string
  category: NewsCategory
  date: string
  thumbnail_url?: string
  card_images?: string[]
  link?: string
  is_active?: boolean
  order?: number
}

export interface NewsUpdate {
  title?: string
  subtitle?: string
  category?: NewsCategory
  date?: string
  thumbnail_url?: string
  card_images?: string[]
  link?: string
  is_active?: boolean
  order?: number
}
