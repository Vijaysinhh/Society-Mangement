'use client'

import { ReactNode } from 'react'

interface TabItem {
  id: string
  label: string
  icon?: ReactNode
}

interface ResponsiveTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function ResponsiveTabs({ tabs, activeTab, onTabChange }: ResponsiveTabsProps) {
  return (
    <>
      {/* Mobile: Vertical Stacked Buttons */}
      <div className="md:hidden space-y-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop: Horizontal Tabs */}
      <div className="hidden md:flex gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}
