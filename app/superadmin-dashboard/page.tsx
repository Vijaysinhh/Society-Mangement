'use client'

import { DataProvider } from '@/contexts/DataContext'
import EnhancedDashboard from './components/EnhancedDashboard'

export default function SuperadminDashboardPage() {
  return (
    <DataProvider>
      <EnhancedDashboard />
    </DataProvider>
  )
}
