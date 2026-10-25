'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Clock, Users, Package, Wrench, DollarSign, AlertCircle, Edit2, X, Shield, CheckCircle2 } from 'lucide-react'
import { getMaintenanceSettings, saveMaintenanceSettings, createMaintenanceFeesForAllUnits, updateAllUnitFeesFromSettings } from '../lib/maintenanceFeeManager'

interface SettingsTabProps {
  societyId: string
}

interface VisitorRule {
  id: string
  name: string
  allowedHoursStart: string
  allowedHoursEnd: string
  requiresApproval: boolean
  enabled: boolean
}

interface ShiftConfig {
  id: string
  name: string
  startTime: string
  endTime: string
}

interface GateConfig {
  id: string
  name: string
  isActive: boolean
}

interface MaintenanceSettings {
  calculationMethod: 'fixed' | 'percentage' | 'byType' | 'manual' | 'custom'
  fixedAmount?: number
  percentageValue?: number
  unitTypeAmounts?: {
    '1BHK': number
    '2BHK': number
    '3BHK': number
    '4BHK': number
    'row-house': number
    'bungalow': number
  }
  manualPerUnit?: {
    [unitId: string]: number
  }
  unitOverrides?: {
    [unitId: string]: number
  }
  dueDay?: number
  gracePeriod?: number
  lateFeePercentage?: number
  autoGenerateMonthly?: boolean
  lastUpdatedAt?: string
}

interface SocietySettings {
  visitorRules: VisitorRule[]
  shifts: ShiftConfig[]
  gates: GateConfig[]
  deliveryAllowed: boolean
  workerAllowed: boolean
  maxPreApprovedVisitors: number
  maintenance: MaintenanceSettings
}

const defaultSettings: SocietySettings = {
  visitorRules: [
    { id: 'guest', name: 'Guests', allowedHoursStart: '06:00', allowedHoursEnd: '22:00', requiresApproval: false, enabled: true },
    { id: 'delivery', name: 'Delivery', allowedHoursStart: '08:00', allowedHoursEnd: '20:00', requiresApproval: false, enabled: true },
    { id: 'worker', name: 'Workers', allowedHoursStart: '09:00', allowedHoursEnd: '18:00', requiresApproval: true, enabled: true },
    { id: 'services', name: 'Services', allowedHoursStart: '09:00', allowedHoursEnd: '18:00', requiresApproval: true, enabled: true },
  ],
  shifts: [
    { id: 'shift-1', name: 'Morning', startTime: '06:00', endTime: '14:00' },
    { id: 'shift-2', name: 'Evening', startTime: '14:00', endTime: '22:00' },
    { id: 'shift-3', name: 'Night', startTime: '22:00', endTime: '06:00' },
  ],
  gates: [
    { id: 'gate-1', name: 'Main Gate', isActive: true },
    { id: 'gate-2', name: 'Back Gate', isActive: true },
  ],
  deliveryAllowed: true,
  workerAllowed: true,
  maxPreApprovedVisitors: 10,
  maintenance: {
    calculationMethod: 'fixed',
    fixedAmount: 500,
    percentageValue: 0.5,
    dueDay: 10,
    gracePeriod: 5,
    lateFeePercentage: 2,
    autoGenerateMonthly: true,
    unitTypeAmounts: {
      '1BHK': 500,
      '2BHK': 750,
      '3BHK': 1000,
      '4BHK': 1250,
      'row-house': 2000,
      'bungalow': 3000,
    },
    manualPerUnit: {},
    unitOverrides: {},
    lastUpdatedAt: new Date().toISOString(),
  }
}

export default function SettingsTab({ societyId }: SettingsTabProps) {
  const [settings, setSettings] = useState<SocietySettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<'visitor' | 'shifts' | 'gates' | 'maintenance' | 'society'>('visitor')
  const [societyInfo, setSocietyInfo] = useState({
    name: 'Green Valley Society',
    address: '123 Main Street, City, State 12345',
    phone: '+91 98765 43210',
    email: 'admin@greenvalleys.com',
    registrationNo: 'GVS/2024/001',
    taxId: 'GST123456789',
  })

  useEffect(() => {
    const stored = localStorage.getItem(`society-settings-${societyId}`)
    if (stored) {
      setSettings(JSON.parse(stored))
    }
    
    // Listen for maintenance fee sync events
    const handleSync = () => {
      // Force re-render to refresh data
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    
    window.addEventListener('maintenanceFeeSync', handleSync)
    return () => window.removeEventListener('maintenanceFeeSync', handleSync)
  }, [societyId])

  const handleSave = () => {
    localStorage.setItem(`society-settings-${societyId}`, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateVisitorRule = (id: string, updates: Partial<VisitorRule>) => {
    setSettings(prev => ({
      ...prev,
      visitorRules: prev.visitorRules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    }))
  }

  const addShift = () => {
    const newShift: ShiftConfig = {
      id: `shift-${Date.now()}`,
      name: 'New Shift',
      startTime: '08:00',
      endTime: '16:00',
    }
    setSettings(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }))
  }

  const updateShift = (id: string, updates: Partial<ShiftConfig>) => {
    setSettings(prev => ({
      ...prev,
      shifts: prev.shifts.map(shift => 
        shift.id === id ? { ...shift, ...updates } : shift
      )
    }))
  }

  const deleteShift = (id: string) => {
    setSettings(prev => ({
      ...prev,
      shifts: prev.shifts.filter(shift => shift.id !== id)
    }))
  }

  const addGate = () => {
    const newGate: GateConfig = {
      id: `gate-${Date.now()}`,
      name: 'New Gate',
      isActive: true,
    }
    setSettings(prev => ({
      ...prev,
      gates: [...prev.gates, newGate]
    }))
  }

  const updateGate = (id: string, updates: Partial<GateConfig>) => {
    setSettings(prev => ({
      ...prev,
      gates: prev.gates.map(gate => 
        gate.id === id ? { ...gate, ...updates } : gate
      )
    }))
  }

  const deleteGate = (id: string) => {
    setSettings(prev => ({
      ...prev,
      gates: prev.gates.filter(gate => gate.id !== id)
    }))
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Society Settings</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Configure visitor rules, shifts, and gates</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSection('visitor')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeSection === 'visitor' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Visitor Rules
        </button>
        <button
          onClick={() => setActiveSection('shifts')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeSection === 'shifts' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Shift Timings
        </button>
        <button
          onClick={() => setActiveSection('gates')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeSection === 'gates' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          Gates
        </button>
        <button
          onClick={() => setActiveSection('maintenance')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeSection === 'maintenance' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Maintenance Fees
        </button>
        <button
          onClick={() => setActiveSection('society')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
            activeSection === 'society' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Society Info
        </button>
      </div>

      {/* Visitor Rules Section */}
      {activeSection === 'visitor' && (
        <div className="space-y-4">
          {/* General Settings */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Max Pre-approved Visitors per Unit</span>
                <input
                  type="number"
                  value={settings.maxPreApprovedVisitors}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxPreApprovedVisitors: parseInt(e.target.value) || 0 }))}
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded text-center"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Visitor Type Rules */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">Visitor Type Rules</h3>
            <div className="space-y-4">
              {settings.visitorRules.map(rule => (
                <div key={rule.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-900 text-sm">{rule.name}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateVisitorRule(rule.id, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs text-slate-600">Enabled</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={rule.allowedHoursStart}
                        onChange={(e) => updateVisitorRule(rule.id, { allowedHoursStart: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={rule.allowedHoursEnd}
                        onChange={(e) => updateVisitorRule(rule.id, { allowedHoursEnd: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.requiresApproval}
                      onChange={(e) => updateVisitorRule(rule.id, { requiresApproval: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs text-slate-600">Requires Resident Approval</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shift Timings Section */}
      {activeSection === 'shifts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Custom Shift Timings</h3>
              <button
                onClick={addShift}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
              >
                <Plus className="w-3 h-3" />
                Add Shift
              </button>
            </div>
            <div className="space-y-3">
              {settings.shifts.map(shift => (
                <div key={shift.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={shift.name}
                      onChange={(e) => updateShift(shift.id, { name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm font-medium border border-slate-300 rounded"
                      placeholder="Shift Name"
                    />
                    <button
                      onClick={() => deleteShift(shift.id)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => updateShift(shift.id, { startTime: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => updateShift(shift.id, { endTime: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Settings Section */}
      {activeSection === 'maintenance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-4">Maintenance Fee Calculation</h3>
              <p className="text-sm text-slate-600 mb-4">Choose how to calculate maintenance fees for your society</p>

              {/* Method Selection */}
              <div className="space-y-3 mb-6">
                {[
                  { value: 'fixed', label: 'Fixed Amount Per Unit', desc: 'Same amount for all units' },
                  { value: 'percentage', label: 'Percentage of Property Value', desc: 'Calculate based on property value' },
                  { value: 'byType', label: 'Based on Unit Type (BHK)', desc: 'Different rates for each unit type' },
                  { value: 'manual', label: 'Manual Per Unit', desc: 'Set custom amount for each unit' },
                ].map(method => (
                  <label key={method.value} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      borderColor: settings.maintenance.calculationMethod === method.value ? '#2563eb' : '#e2e8f0',
                      backgroundColor: settings.maintenance.calculationMethod === method.value ? '#eff6ff' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="calculationMethod"
                      value={method.value}
                      checked={settings.maintenance.calculationMethod === method.value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, calculationMethod: e.target.value as any }
                      }))}
                      className="w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Per-Method Configuration */}
              {settings.maintenance.calculationMethod === 'fixed' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-900 mb-3">Fixed Monthly Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">₹</span>
                    <input
                      type="number"
                      value={settings.maintenance.fixedAmount || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, fixedAmount: parseFloat(e.target.value) || 0 }
                      }))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Enter amount"
                    />
                    <span className="text-slate-600">/month per unit</span>
                  </div>
                </div>
              )}

              {settings.maintenance.calculationMethod === 'percentage' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Percentage of Property Value</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.maintenance.percentageValue || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: { ...prev.maintenance, percentageValue: parseFloat(e.target.value) || 0 }
                        }))}
                        step="0.1"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Enter percentage"
                      />
                      <span className="text-slate-600">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 bg-white p-2 rounded">
                    Example: If property value is ₹50,00,000 and percentage is 0.5%, monthly fee = ₹2,500
                  </p>
                </div>
              )}

              {settings.maintenance.calculationMethod === 'byType' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-slate-900 mb-4">Set Amount Per Unit Type</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(['1BHK', '2BHK', '3BHK', '4BHK', 'row-house', 'bungalow'] as const).map(type => (
                      <div key={type} className="bg-white p-3 rounded-lg border border-slate-200">
                        <label className="block text-xs font-medium text-slate-600 mb-2">{type.toUpperCase()}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-sm">₹</span>
                          <input
                            type="number"
                            value={settings.maintenance.unitTypeAmounts?.[type] || ''}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              maintenance: {
                                ...prev.maintenance,
                                unitTypeAmounts: {
                                  ...prev.maintenance.unitTypeAmounts,
                                  [type]: parseFloat(e.target.value) || 0
                                }
                              }
                            }))}
                            className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settings.maintenance.calculationMethod === 'manual' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 mb-3">
                    With Manual method, you set custom amount for each unit individually in the Unit Details drawer.
                  </p>
                  <p className="text-xs text-slate-600">
                    Note: This method gives maximum flexibility but requires setting each unit's fee individually.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Terms */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4">Payment Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={settings.maintenance.dueDay || 10}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenance: { ...prev.maintenance, dueDay: parseInt(e.target.value) || 10 }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Fees are due on this day of each month</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Grace Period</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.maintenance.gracePeriod || 5}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, gracePeriod: parseInt(e.target.value) || 0 }
                      }))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-slate-600 text-sm">days</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Days before marking as overdue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Late Fee</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={settings.maintenance.lateFeePercentage || 0}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, lateFeePercentage: parseFloat(e.target.value) || 0 }
                      }))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-slate-600 text-sm">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Percentage on overdue amount</p>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={settings.maintenance.autoGenerateMonthly || false}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, autoGenerateMonthly: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Auto-generate Monthly Fees</p>
                      <p className="text-xs text-slate-500">Create fees on 1st of each month</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    maintenance: { ...prev.maintenance, lastUpdatedAt: new Date().toISOString() }
                  }))
                  saveMaintenanceSettings(settings.maintenance)
                  setSaved(true)
                  setTimeout(() => setSaved(false), 3000)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Maintenance Settings
              </button>

              <button
                onClick={() => {
                  const unitsStr = localStorage.getItem('units')
                  if (unitsStr) {
                    try {
                      const units = JSON.parse(unitsStr)
                      createMaintenanceFeesForAllUnits(units, true)
                      setSaved(true)
                      setTimeout(() => setSaved(false), 3000)
                    } catch (e) {
                      alert('Error applying fees: ' + e.message)
                    }
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Apply Fees to All Units
              </button>
            </div>

            {/* Advanced Fee Automation */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Advanced Fee Automation
              </h4>
              <p className="text-sm text-slate-600 mb-4">Configure automatic fee calculations and penalty rules</p>

              <div className="space-y-4">
                {/* Late Fee Automation */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-900">Late Fee Automation</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                      <span className="text-xs font-medium text-slate-700">Enabled</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Late Fee Type</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option>Percentage of Amount</option>
                        <option>Fixed Amount</option>
                        <option>Tiered Based on Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Late Fee Amount</label>
                      <input type="number" placeholder="2.5" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-red-700 bg-white p-2 rounded">
                    Example: If late fee is 2.5%, and maintenance is ₹5,000, penalty = ₹125 per month
                  </p>
                </div>

                {/* Penalty Escalation */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-900">Penalty Escalation Rules</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-xs font-medium text-slate-700">Enabled</span>
                    </label>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>After 30 days: Add 1% penalty</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>After 60 days: Add 2% penalty</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>After 90 days: Add 3% penalty</span>
                    </label>
                  </div>
                </div>

                {/* Grace Period Configuration */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
                  <h5 className="font-medium text-slate-900">Grace Period & Reminders</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Grace Period (Days)</label>
                      <input type="number" value="5" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      <p className="text-xs text-slate-500 mt-1">Pay without penalty within this period</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Send Reminder After</label>
                      <input type="number" value="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      <p className="text-xs text-slate-500 mt-1">Days after due date</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Escalate to Pending After</label>
                      <input type="number" value="15" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      <p className="text-xs text-slate-500 mt-1">Days before marking overdue</p>
                    </div>
                  </div>
                </div>

                {/* Automatic Reconciliation */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-900">Automatic Reconciliation</h5>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-xs font-medium text-slate-700">Enabled</span>
                    </label>
                  </div>
                  <p className="text-sm text-slate-700">When payment is received, automatically:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Apply to oldest pending fees first</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Waive penalties if full amount is paid</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">Send payment confirmation automatically</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Advanced Settings */}
              <div className="mt-4 flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Automation Rules
                </button>
              </div>
            </div>

            {saved && (
              <p className="text-sm text-green-600 font-medium">✓ Settings saved successfully</p>
            )}
          </div>
        </div>
      )}

      {/* Gates Section */}
      {activeSection === 'gates' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Society Gates</h3>
              <button
                onClick={addGate}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
              >
                <Plus className="w-3 h-3" />
                Add Gate
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">Configure gates for watchmen assignment (optional)</p>
            <div className="space-y-3">
              {settings.gates.map(gate => (
                <div key={gate.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    value={gate.name}
                    onChange={(e) => updateGate(gate.id, { name: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm font-medium border border-slate-300 rounded"
                    placeholder="Gate Name"
                  />
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={gate.isActive}
                      onChange={(e) => updateGate(gate.id, { isActive: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs text-slate-600">Active</span>
                  </label>
                  <button
                    onClick={() => deleteGate(gate.id)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              {settings.gates.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No gates configured. Add gates to assign watchmen.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
