'use client'

import { useState } from 'react'
import { BarChart3, Download, Calendar, Mail, Check, Trash2, Plus } from 'lucide-react'

export default function ReportsTab() {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'scheduled'>('templates')
  
  // Report templates
  const reportTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview of key metrics, growth, and status',
      metrics: ['Total societies', 'Active societies', 'Total residents', 'Total admins', 'Growth %'],
    },
    {
      id: 'operational',
      name: 'Operational Report',
      description: 'Detailed operational metrics and performance indicators',
      metrics: ['Visitor activity', 'Admin performance', 'Alert frequency', 'System usage', 'Response times'],
    },
    {
      id: 'security',
      name: 'Security Report',
      description: 'Security-focused metrics and alerts',
      metrics: ['Unauthorized entries', 'Blacklisted visitors', 'Alert incidents', 'Response times', 'Verification rates'],
    },
    {
      id: 'resident',
      name: 'Resident Report',
      description: 'Resident-focused metrics and trends',
      metrics: ['Total residents', 'Occupancy rates', 'Resident satisfaction', 'Churn rate', 'Demographics'],
    },
    {
      id: 'visitor',
      name: 'Visitor Report',
      description: 'Visitor analytics and patterns',
      metrics: ['Total visitors', 'Visitor frequency', 'Visit duration', 'Approval rates', 'Peak times'],
    },
  ]

  // Custom report builder state
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'Total societies',
    'Active societies',
    'Total residents',
  ])
  
  const [reportConfig, setReportConfig] = useState({
    name: 'My Custom Report',
    dateRange: 'month',
    format: 'pdf',
    includeCharts: true,
    scheduled: false,
    scheduleFrequency: 'weekly',
    emailTo: '',
  })

  // Scheduled reports
  const [scheduledReports] = useState([
    {
      id: '1',
      name: 'Weekly Operations Report',
      template: 'operational',
      frequency: 'Weekly',
      nextRun: 'Tomorrow at 9:00 AM',
      emailTo: 'admin@example.com',
    },
    {
      id: '2',
      name: 'Monthly Executive Summary',
      template: 'executive',
      frequency: 'Monthly',
      nextRun: 'Mar 3, 2026',
      emailTo: 'ceo@example.com',
    },
  ])

  const allMetrics = [
    'Total societies',
    'Active societies',
    'Paused societies',
    'Total units',
    'Total residents',
    'Total watchmen',
    'Total admins',
    'Today visitors',
    'Occupancy rate',
    'Admin response time',
    'Visitor throughput',
  ]

  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
    } else {
      setSelectedMetrics([...selectedMetrics, metric])
    }
  }

  const handleGenerateReport = () => {
    console.log('[v0] Generating report:', { selectedMetrics, reportConfig })
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['templates', 'builder', 'scheduled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Report Templates</h3>
          <div className="space-y-3">
            {reportTemplates.map(template => (
              <div key={template.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{template.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {template.metrics.map((metric, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Report Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Create Custom Report</h3>

            {/* Report Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Report Name</label>
              <input
                type="text"
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Metrics Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Select Metrics</label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                {allMetrics.map(metric => (
                  <label key={metric} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={() => handleMetricToggle(metric)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-700">{metric}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">{selectedMetrics.length} metrics selected</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              {/* Include Charts */}
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700">Include Charts and Visualizations</span>
                </label>
              </div>
            </div>

            {/* Schedule Report */}
            <div className="border-t border-slate-200 pt-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={reportConfig.scheduled}
                  onChange={(e) => setReportConfig({ ...reportConfig, scheduled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-slate-700">Schedule Report</span>
              </label>

              {reportConfig.scheduled && (
                <div className="space-y-3 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                    <select
                      value={reportConfig.scheduleFrequency}
                      onChange={(e) => setReportConfig({ ...reportConfig, scheduleFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email To</label>
                    <input
                      type="email"
                      value={reportConfig.emailTo}
                      onChange={(e) => setReportConfig({ ...reportConfig, emailTo: e.target.value })}
                      placeholder="admin@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Generate Report
              </button>
              <button className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                Save as Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Scheduled Reports</h3>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Schedule
            </button>
          </div>

          {scheduledReports.length > 0 ? (
            <div className="space-y-3">
              {scheduledReports.map(report => (
                <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900">{report.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">Template: {report.template}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors">
                        <BarChart3 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{report.frequency} - Next run: {report.nextRun}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{report.emailTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No scheduled reports yet</p>
              <p className="text-sm text-slate-500 mt-1">Create a custom report and schedule it for regular delivery</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
