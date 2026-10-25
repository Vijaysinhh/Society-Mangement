'use client'

import { ReactNode } from 'react'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
  badge?: number
}

interface MobileBottomNavProps {
  items: NavItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export default function MobileBottomNav({
  items,
  activeTab,
  onTabChange,
  className = ''
}: MobileBottomNavProps) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 sm:h-20 px-0 z-40 safe-area-inset-bottom ${className}`}
      role="tablist"
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          role="tab"
          aria-selected={activeTab === item.id}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative group ${
            activeTab === item.id
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label={item.label}
        >
          {/* Icon */}
          <div className={`transition-all ${activeTab === item.id ? 'scale-110' : 'scale-100'}`}>
            {item.icon}
          </div>

          {/* Label */}
          <span className={`text-xs font-medium leading-none ${
            activeTab === item.id ? 'block' : 'hidden sm:block'
          }`}>
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <div className="absolute top-1 right-1 sm:right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {item.badge > 9 ? '9+' : item.badge}
            </div>
          )}

          {/* Active indicator */}
          {activeTab === item.id && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t" />
          )}
        </button>
      ))}
    </nav>
  )
}
