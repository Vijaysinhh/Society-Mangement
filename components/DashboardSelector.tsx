'use client'

import { useRouter } from 'next/navigation'
import { Building2, Users, Home, Shield } from 'lucide-react'

interface DashboardOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
}

const dashboards: DashboardOption[] = [
  {
    id: 'superadmin',
    title: 'Superadmin',
    description: 'Manage all societies and admins',
    icon: <Shield className="w-8 h-8" />,
    path: '/superadmin-dashboard',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'society-admin',
    title: 'Society Admin',
    description: 'Manage residents and visitors',
    icon: <Building2 className="w-8 h-8" />,
    path: '/society-admin',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'resident',
    title: 'Resident',
    description: 'Verify visitors and check history',
    icon: <Home className="w-8 h-8" />,
    path: '/resident-dashboard',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'watchman',
    title: 'Watchman',
    description: 'Gate entry and exit management',
    icon: <Users className="w-8 h-8" />,
    path: '/watchman-dashboard',
    color: 'from-orange-500 to-orange-600',
  },
]

export default function DashboardSelector() {
  const router = useRouter()

  const handleDashboardSelect = (dashboard: DashboardOption) => {
    router.push(dashboard.path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Management System</h1>
        <p className="text-sm text-gray-600 mt-1">Select your role to continue</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Dashboard Options Grid */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              All Dashboards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => handleDashboardSelect(dashboard)}
                className="group relative h-32 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.color} opacity-90 group-hover:opacity-100 transition-opacity`} />

                {/* Content */}
                <div className="relative h-full flex flex-col items-start justify-start p-4 text-white">
                  <div className="mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    {dashboard.icon}
                  </div>
                  <h3 className="font-bold text-lg">{dashboard.title}</h3>
                  <p className="text-xs opacity-90 mt-1">{dashboard.description}</p>
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6 text-center text-xs text-gray-500">
        <p>VMS v1.0 • All Rights Reserved</p>
      </div>
    </div>
  )
}
