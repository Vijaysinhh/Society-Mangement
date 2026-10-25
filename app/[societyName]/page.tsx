'use client'

import { useRouter, useParams } from 'next/navigation'
import { Lock, Users, Shield } from 'lucide-react'

export default function SocietyHubPage() {
  const router = useRouter()
  const params = useParams()
  const societyName = typeof params.societyName === 'string' ? params.societyName : ''
  const society = getSocietyBySlug(societyName)

  if (!society) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Society Not Found</h1>
          <p className="text-slate-400 mb-8">
            The society &quot;{societyName}&quot; does not exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {society.name}
          </h1>
          <p className="text-slate-300 text-lg">
            {society.description}
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Society Admin Card */}
          <div
            onClick={() => router.push('/society-admin')}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 h-full">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-lg group-hover:bg-white/30 transition">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 text-center">
                Society Admin
              </h2>
              <p className="text-purple-100 text-center mb-6">
                Manage residents, watchmen, and society operations
              </p>
              <button className="w-full py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition">
                Open Admin Dashboard
              </button>
            </div>
          </div>

          {/* Resident Card */}
          <div
            onClick={() => router.push('/resident-dashboard')}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 h-full">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-lg group-hover:bg-white/30 transition">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 text-center">
                Resident
              </h2>
              <p className="text-green-100 text-center mb-6">
                Access resident services and community features
              </p>
              <button className="w-full py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition">
                Open Resident Dashboard
              </button>
            </div>
          </div>

          {/* Watchman Card */}
          <div
            onClick={() => router.push('/watchman-dashboard')}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 h-full">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-lg group-hover:bg-white/30 transition">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 text-center">
                Watchman
              </h2>
              <p className="text-orange-100 text-center mb-6">
                Access security and duty management
              </p>
              <button className="w-full py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition">
                Open Watchman Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>
            Select your role above to login to {society.name}
          </p>
        </div>
      </div>
    </div>
  )
}
