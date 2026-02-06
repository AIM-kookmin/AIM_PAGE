export type TabType = 'sections' | 'activities' | 'history' | 'contact'
export type ViewMode = 'list' | 'add' | 'edit' | 'delete'

export interface SectionFormData {
  title: string
  content: string
  order: number
}

export interface AboutActivityFormData {
  title: string
  description: string
  icon: string
  color: string
  order: number
}

export interface HistoryFormData {
  year: number
  title: string
  description: string
  order: number
}

export interface ContactFormData {
  type: string
  label: string
  value: string
  order: number
}
