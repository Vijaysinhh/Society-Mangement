'use client'

import { useState } from 'react'
import { Wrench, AlertCircle, HelpCircle, X, ChevronRight } from 'lucide-react'

interface IssueFormProps {
  onClose?: () => void
  onSubmit?: (data: {
    type: 'fix' | 'report' | 'question'
    title: string
    description: string
    category: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
  }) => void
}

type FormStep = 'type-selection' | 'details'

// export default function SmartIssueForm({ onClose, onSubmit }: IssueFormProps) {
  const [step, setStep] = useState<FormStep>('type-selection')
  const [issueType, setIssueType] = useState<'fix' | 'report' | 'question' | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    urgency: 'medium' as const,
  })

  const issueTypes = [
    {
      id: 'fix',
      icon: Wrench,
      title: 'Request Maintenance',
      description: 'Something needs repair or maintenance',
      color: 'blue',
      examples: 'AC, plumbing, electrical, appliances',
      categories: [
        'Electrical',
        'Plumbing',
        'HVAC',
        'Structural',
        'Appliance',
        'Cleaning',
        'Other',
      ],
    },
    {
      id: 'report',
      icon: AlertCircle,
      title: 'Report Community Issue',
      description: 'Share concerns affecting shared spaces',
      color: 'orange',
      examples: 'Noise, cleanliness, parking, disputes',
      categories: [
        'Noise/Sound',
        'Cleanliness',
        'Parking/Traffic',
        'Neighbor Concern',
        'Security',
        'Other',
      ],
    },
    {
      id: 'question',
      icon: HelpCircle,
      title: 'Ask for Help',
      description: 'Get information or process guidance',
      color: 'purple',
      examples: 'How do I..., Where is..., Why is...',
      categories: [
        'How to Guide',
        'Information',
        'Process',
        'Documentation',
        'Other',
      ],
    },
  ]

  const getCategoryOptions = () => {
    const selected = issueTypes.find(t => t.id === issueType)
    return selected?.categories || []
  }

  const getUrgencyOptions = () => {
    if (issueType === 'fix') {
      return [
        { value: 'low' as const, label: 'Can wait a week', color: 'green' },
        { value: 'medium' as const, label: 'Within 2-3 days', color: 'yellow' },
        { value: 'high' as const, label: 'This week', color: 'orange' },
        { value: 'critical' as const, label: 'Urgent - today', color: 'red' },
      ]
    }
    if (issueType === 'report') {
      return [
        { value: 'low' as const, label: 'Minor issue', color: 'green' },
        { value: 'medium' as const, label: 'Moderate issue', color: 'yellow' },
        { value: 'high' as const, label: 'Serious issue', color: 'orange' },
      ]
    }
    return [
      { value: 'low' as const, label: 'Not urgent', color: 'green' },
      { value: 'medium' as const, label: 'Normal', color: 'yellow' },
      { value: 'high' as const, label: 'Important', color: 'orange' },
    ]
  }

  const handleSubmit = () => {
    if (!issueType || !formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit?.({
      type: issueType,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
    })

    // Reset form
    setStep('type-selection')
    setIssueType(null)
    setFormData({
      title: '',
      description: '',
      category: 'General',
      urgency: 'medium',
    })
  }

  if (step === 'type-selection') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-slate-900">What do you need?</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {issueTypes.map(type => {
              const IconComponent = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setIssueType(type.id as 'fix' | 'report' | 'question')
                    setStep('details')
                  }}
                  className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-6 h-6 text-slate-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">{type.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Example: {type.examples}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div>
            <button
              onClick={() => setStep('type-selection')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2 flex items-center gap-1"
            >
              ← Change Type
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {issueTypes.find(t => t.id === issueType)?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description *
            </label>
            <textarea
              placeholder="Provide details about the issue"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={e =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {getCategoryOptions().map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Urgency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getUrgencyOptions().map(opt => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgency: opt.value as 'low' | 'medium' | 'high' | 'critical',
                    })
                  }
                  className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.urgency === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
