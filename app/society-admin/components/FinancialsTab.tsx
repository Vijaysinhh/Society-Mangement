'use client'

import React, { useState } from 'react'
import FinancialDashboard from './FinancialDashboard'
import CollectionsDashboard from './CollectionsDashboard'
import ManagementDashboard from './ManagementDashboard'
import ReportsTab from './ReportsTab'

interface FinancialsTabProps {
  societyId: string
}

export default function FinancialsTab({ societyId }: FinancialsTabProps) {
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'collections' | 'management' | 'analytics'>('dashboard')
  const [analyticsTab, setAnalyticsTab] = useState<'reports' | 'analysis'>('reports')

  // Dashboard Tab Component
  const DashboardTab = () => (
    <FinancialDashboard societyId={societyId} />
  )

  // Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Financial Analytics</h3>
        <p className="text-slate-600">Analytics dashboard content goes here</p>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Main Tab Navigation */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 mb-6 px-4 sm:px-6 lg:px-8 scroll-smooth">
        {['dashboard', 'collections', 'management', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveMainTab(tab as any)}
            className={`px-3.5 sm:px-4 lg:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
              activeMainTab === tab
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:shadow-lg'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {tab === 'dashboard' ? 'Dashboard' : tab === 'collections' ? 'Collections' : tab === 'management' ? 'Management' : 'Analytics'}
          </button>
        ))}
      </div>

      {/* Analytics Sub-tabs */}
      {activeMainTab === 'analytics' && (
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-3 px-4 sm:px-6 lg:px-8 scroll-smooth">
          {['reports', 'analysis'].map(subtab => (
            <button
              key={subtab}
              onClick={() => setAnalyticsTab(subtab as any)}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                analyticsTab === subtab
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {subtab === 'reports' ? 'Reports' : 'Analysis'}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Quick Stats */}
      <div className="lg:hidden bg-slate-50 border-b border-slate-200 p-4 sm:p-5 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Collection Rate</p>
          <p className="text-lg sm:text-xl font-bold text-green-600 mt-1">82%</p>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Pending Fees</p>
          <p className="text-lg sm:text-xl font-bold text-red-600 mt-1">₹77K</p>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 text-center border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">This Month</p>
          <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">₹225K</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-0 lg:p-0 max-w-full lg:max-w-none" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
        <div className="pb-6 sm:pb-8 space-y-6">
          {activeMainTab === 'dashboard' && <DashboardTab />}
          
          {activeMainTab === 'collections' && (
            <div className="pb-6 sm:pb-8">
              <CollectionsDashboard societyId={societyId} />
            </div>
          )}
          
          {activeMainTab === 'management' && (
            <div className="pb-6 sm:pb-8">
              <ManagementDashboard societyId={societyId} />
            </div>
          )}
          
          {activeMainTab === 'analytics' && (
            <>
              {analyticsTab === 'reports' && <ReportsTab />}
              {analyticsTab === 'analysis' && <AnalyticsTab />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
