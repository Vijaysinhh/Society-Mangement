'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronRight, Home, Car, Users, AlertCircle } from 'lucide-react'

interface OnboardingProps {
  residentName: string
  unitNumber: string
  buildingName?: string
  onComplete?: () => void
  showOnboarding?: boolean
}

type OnboardingStep = 'welcome' | 'profile' | 'vehicle' | 'helpers' | 'emergency' | 'complete'

export default function ResidentOnboarding({
  residentName,
  unitNumber,
  buildingName = 'Building A',
  onComplete,
  showOnboarding = true,
}: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const steps = [
    { id: 'profile', label: 'Complete your profile', icon: Home },
    { id: 'vehicle', label: 'Register your vehicle', icon: Car },
    { id: 'helpers', label: 'Add recurring visitors', icon: Users },
    { id: 'emergency', label: 'Set emergency contacts', icon: AlertCircle },
  ]

  const handleStepComplete = (stepId: string) => {
    setCompleted(new Set([...completed, stepId]))
    if (stepId === 'emergency') {
      setStep('complete')
      setTimeout(() => {
        onComplete?.()
      }, 2000)
    }
  }

  const progressPercent = Math.round((completed.size / steps.length) * 100)

  if (!showOnboarding) return null

  if (step === 'welcome') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to Society Manager, {residentName}!
          </h2>
          <p className="text-slate-600 mb-6">
            Unit {unitNumber} • {buildingName}
          </p>
          <p className="text-slate-700 mb-8 max-w-xl mx-auto">
            Let&apos;s get you set up in a few quick steps. This will help us serve you better and keep your community safe.
          </p>

          <button
            onClick={() => setStep('profile')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            All set!
          </h2>
          <p className="text-slate-600 mb-6">
            Your profile is complete and you&apos;re ready to go.
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900">Setup Progress</h2>
            <span className="text-sm font-medium text-slate-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map(stepItem => {
            const IconComponent = stepItem.icon
            const isCompleted = completed.has(stepItem.id)

            return (
              <div
                key={stepItem.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => !isCompleted && setStep(stepItem.id as OnboardingStep)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCompleted ? 'text-green-700' : 'text-slate-900'
                    }`}
                  >
                    {stepItem.label}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-600 mt-1">Completed</p>
                  )}
                </div>

                {!isCompleted && (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        {(
          <div className="mt-8 pt-8 border-t border-slate-200">
            {step === 'profile' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Complete Your Profile
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={residentName}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleStepComplete('profile')}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'vehicle' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Register Your Vehicle
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    placeholder="MH-02-AB-1234"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vehicle Type
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Car</option>
                    <option>Bike/Scooter</option>
                    <option>Auto</option>
                    <option>Other</option>
                  </select>
                </div>
                <button
                  onClick={() => handleStepComplete('vehicle')}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'helpers' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Add Recurring Visitors
                </h3>
                <p className="text-slate-600 text-sm">
                  Pre-approve helpers like maids, gardeners, etc. for faster entry.
                </p>
                <button
                  onClick={() => handleStepComplete('helpers')}
                  className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            )}

            {step === 'emergency' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleStepComplete('emergency')}
                  className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
