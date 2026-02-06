'use client'

import { TabType } from '../types'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  counts: {
    sections: number
    activities: number
    history: number
    contact: number
  }
}

const TAB_LABELS: Record<TabType, string> = {
  sections: '섹션',
  activities: '활동',
  history: '히스토리',
  contact: '연락처',
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  counts,
}: TabNavigationProps) {
  const tabs: TabType[] = ['sections', 'activities', 'history', 'contact']

  return (
    <div className="flex gap-2 border-b border-white/10 mb-8 flex-wrap">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        const count = counts[tab]

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-4 py-3 rounded-t-xl transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'bg-white/5 border-b-2 border-violet-500 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {TAB_LABELS[tab]}
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10">
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
