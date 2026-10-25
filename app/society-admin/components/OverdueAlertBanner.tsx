'use client'

import { AlertTriangle, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getMaintenanceCollectionStats } from '../lib/maintenanceFeeManager'

export default function OverdueAlertBanner() {
  const [overdueData, setOverdueData] = useState<any>(null)

  useEffect(() => {
    const loadData = () => {
      const stats = getMaintenanceCollectionStats()
      const overdueCount = stats.allFees?.filter(f => f.overdueAmount > 0).length || 0
      const totalOverdueAmount = stats.allFees?.reduce((sum, f) => sum + (f.overdueAmount || 0), 0) || 0
      
      setOverdueData({
        overdueCount,
        totalOverdueAmount,
        overdueRate: stats.overdueRate || 0,
      })
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    
    // Listen for sync events
    window.addEventListener('maintenanceFeeSync', loadData)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('maintenanceFeeSync', loadData)
    }
  }, [])

  if (!overdueData || overdueData.overdueCount === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="relative overflow-hidden rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
        <div className="absolute inset-0 animate-pulse bg-amber-100 opacity-20"></div>
        
        <div className="relative flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">Action Needed - Payment Reminders</h3>
            <p className="text-sm text-amber-800 mb-3">Reach out to residents who have payment due dates approaching</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white/70 rounded p-2">
                <p className="text-amber-700 font-semibold">{overdueData.overdueCount}</p>
                <p className="text-xs text-amber-600">Units Ready for Follow-up</p>
              </div>
              <div className="bg-white/70 rounded p-2">
                <p className="text-amber-700 font-semibold">₹{overdueData.totalOverdueAmount.toLocaleString()}</p>
                <p className="text-xs text-amber-600">Payment Due</p>
              </div>
              <div className="bg-white/70 rounded p-2">
                <p className="text-amber-700 font-semibold">{Math.round(overdueData.overdueRate)}%</p>
                <p className="text-xs text-amber-600">Action Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
