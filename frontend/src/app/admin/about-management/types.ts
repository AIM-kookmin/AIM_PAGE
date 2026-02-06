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
}

export interface ContactFormData {
  type: string
  label: string
  value: string
  order: number
}

// Reorder types
export interface OrderUpdate {
  id: string
  order: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseReorderReturn<T extends { id: string; order: number }> {
  items: T[]
  setItems: (items: T[]) => void
  saveStatus: SaveStatus
  handleReorder: (newOrder: T[]) => void
  moveItem: (fromIndex: number, direction: 'up' | 'down') => void
}
