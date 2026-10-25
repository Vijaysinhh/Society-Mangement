'use client'

import { DashboardMetrics } from '@/types'
import RealtimeDashboard from '../RealtimeDashboard'

interface OverviewTabProps {
  metrics: DashboardMetrics
}

export default function OverviewTab({ metrics }: OverviewTabProps) {
  return <RealtimeDashboard />
}
