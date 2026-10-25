'use client'

import React from 'react'
import { ChevronRight, Building2, PieChart, Download, Clock, Settings, Shield } from 'lucide-react'

interface MoreMobileProps {
  societyId: string
}

export default function MoreMobile({ societyId }: MoreMobileProps) {
  const menuSections = [
    {
      title: 'Reports & Data',
      items: [
        { icon: PieChart, label: 'Reports', description: 'View detailed reports and analytics' },
        { icon: Download, label: 'Export Data', description: 'Export society data and records' },
        { icon: Clock, label: 'Data Backup', description: 'Manage backups and restore data' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { icon: Settings, label: 'Settings', description: 'Manage society settings and preferences' },
        { icon: Shield, label: 'User Management', description: 'Add and manage admin users & roles' },
        { icon: Lock, label: 'Access Control', description: 'Manage module access and permissions' },
      ],
    },
  ]

  return (
    <div className="space-y-6 pb-8">

      {/* Divider */}
      <div className="border-t border-slate-100"></div>

      {/* Society Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl p-5 border border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <button className="text-sm font-semibold text-purple-600 hover:text-purple-700">View Profile →</button>
        </div>
        <p className="font-bold text-slate-900 text-lg mb-1">Green Meadows Society</p>
        <p className="text-sm text-slate-600">Reg. No. GMS/2020/1234</p>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide px-1">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon
              return (
                <button
                  key={itemIdx}
                  className="w-full bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Need Help Card */}
      <div className="bg-gradient-to-br from-purple-100 to-purple-100/50 rounded-2xl p-5 border border-purple-300">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl">🎧</div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Need Help?</p>
            <p className="text-sm text-slate-700 mt-1">Contact our support team for assistance</p>
          </div>
        </div>
        <button className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          Contact Support
        </button>
      </div>
    </div>
  )
}

// Helper component for Phone icon not in lucide
const Phone = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const Lock = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v4h12V7a3 3 0 00-3-3z" />
  </svg>
)
