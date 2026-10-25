'use client'

import { useState } from 'react'
import { Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, Phone, Mail, Shield, Lock, Eye, EyeOff, Send } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  email: string
  phone: string
  relation: string
  role: 'primary' | 'secondary' | 'viewer'
  permissions: {
    approveVisitors: boolean
    viewPayments: boolean
    reportComplaints: boolean
    requestMaintenance: boolean
    viewFinancials: boolean
    emergencyAlert: boolean
  }
  status: 'active' | 'pending' | 'inactive'
  addedDate: string
  lastActive?: string
}

interface AccessLog {
  id: string
  memberName: string
  action: string
  timestamp: string
}

const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'fm-001',
    name: 'Priya Kumar',
    email: 'priya.kumar@gmail.com',
    phone: '+91 97654 32109',
    relation: 'Spouse',
    role: 'primary',
    permissions: {
      approveVisitors: true,
      viewPayments: true,
      reportComplaints: true,
      requestMaintenance: true,
      viewFinancials: true,
      emergencyAlert: true
    },
    status: 'active',
    addedDate: '2024-01-15',
    lastActive: '2024-03-27 10:30'
  },
  {
    id: 'fm-002',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@outlook.com',
    phone: '+91 96543 21098',
    relation: 'Son',
    role: 'secondary',
    permissions: {
      approveVisitors: true,
      viewPayments: false,
      reportComplaints: true,
      requestMaintenance: false,
      viewFinancials: false,
      emergencyAlert: true
    },
    status: 'active',
    addedDate: '2024-02-20',
    lastActive: '2024-03-26 15:45'
  },
  {
    id: 'fm-003',
    name: 'Neha Sharma',
    email: 'neha.sharma@gmail.com',
    phone: '+91 95432 10987',
    relation: 'Sister',
    role: 'viewer',
    permissions: {
      approveVisitors: false,
      viewPayments: false,
      reportComplaints: false,
      requestMaintenance: false,
      viewFinancials: false,
      emergencyAlert: true
    },
    status: 'pending',
    addedDate: '2024-03-20'
  }
]

const mockAccessLog: AccessLog[] = [
  { id: 'log-001', memberName: 'Priya Kumar', action: 'Approved visitor - Rajesh (Maid)', timestamp: '2024-03-27 08:15' },
  { id: 'log-002', memberName: 'Arjun Kumar', action: 'Viewed pending visitors', timestamp: '2024-03-27 09:00' },
  { id: 'log-003', memberName: 'Priya Kumar', action: 'Viewed financial reports', timestamp: '2024-03-27 10:30' },
  { id: 'log-004', memberName: 'Arjun Kumar', action: 'Reported maintenance issue', timestamp: '2024-03-26 15:45' }
]

const permissionLabels: Record<keyof FamilyMember['permissions'], string> = {
  approveVisitors: 'Approve Visitors',
  viewPayments: 'View Payments',
  reportComplaints: 'Report Complaints',
  requestMaintenance: 'Request Maintenance',
  viewFinancials: 'View Financials',
}

// export default function FamilyMemberDelegation() {
  const [members, setMembers] = useState(mockFamilyMembers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    relation: '',
    role: 'secondary' as 'primary' | 'secondary' | 'viewer'
  })

  const activemembers = members.filter(m => m.status === 'active')
  const pendingMembers = members.filter(m => m.status === 'pending')

  const handleAddMember = () => {
    if (!newMemberData.name || !newMemberData.email) return

    const newMember: FamilyMember = {
      id: `fm-${Date.now()}`,
      ...newMemberData,
      permissions: {
        approveVisitors: newMemberData.role === 'primary' || newMemberData.role === 'secondary',
        viewPayments: newMemberData.role === 'primary',
        reportComplaints: newMemberData.role !== 'viewer',
        requestMaintenance: newMemberData.role === 'primary' || newMemberData.role === 'secondary',
        viewFinancials: newMemberData.role === 'primary',
        emergencyAlert: true
      },
      status: 'pending',
      addedDate: new Date().toISOString().split('T')[0]
    }

    setMembers([...members, newMember])
    setNewMemberData({ name: '', email: '', phone: '', relation: '', role: 'secondary' })
    setShowAddForm(false)
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id))
  }

  const handleTogglePermission = (memberId: string, permission: keyof FamilyMember['permissions']) => {
    setMembers(members.map(m => 
      m.id === memberId 
        ? { ...m, permissions: { ...m.permissions, [permission]: !m.permissions[permission] } }
        : m
    ))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Active Members</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{activemembers.length}</p>
              <p className="text-xs text-blue-600 mt-1">With access</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase">Pending Invites</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1 sm:mt-2">{pendingMembers.length}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting response</p>
            </div>
            <Users className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Active Members */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Active Members</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={newMemberData.name}
              onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newMemberData.email}
              onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newMemberData.phone}
              onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Relation (e.g. Spouse, Son, Sister)"
              value={newMemberData.relation}
              onChange={(e) => setNewMemberData({ ...newMemberData, relation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={newMemberData.role}
              onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as 'primary' | 'secondary' | 'viewer' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="primary">Primary (Full Access)</option>
              <option value="secondary">Secondary (Limited Access)</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Invite
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {activemembers.length === 0 ? (
            <p className="text-center text-slate-600 py-6">No active members. Add family members to delegate access.</p>
          ) : (
            activemembers.map(member => (
              <div key={member.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900">{member.name}</h4>
                    <p className="text-sm text-slate-600">{member.relation} • {member.role === 'primary' ? 'Full Access' : member.role === 'secondary' ? 'Limited Access' : 'Viewer'}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </span>
                    </div>
                    {member.lastActive && (
                      <p className="text-xs text-slate-500 mt-1">Last active: {member.lastActive}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                    <Eye className="w-5 h-5 text-slate-400 ml-2" />
                  </div>
                </div>

                {/* Expanded Permissions */}
                {expandedMember === member.id && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-3">Permissions</p>
                      <div className="space-y-2">
                        {Object.entries(permissionLabels).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(member.permissions as any)[key]}
                              onChange={() => handleTogglePermission(member.id, key as keyof FamilyMember['permissions'])}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setEditingMember(member.id)}
                        className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 inline mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex-1 px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Pending Invites</h3>
          <div className="space-y-3">
            {pendingMembers.map(member => (
              <div key={member.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{member.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{member.email}</p>
                  <p className="text-xs text-slate-500 mt-2">Invited {new Date(member.addedDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 text-xs font-medium text-yellow-600 border border-yellow-300 rounded hover:bg-yellow-100 transition-colors">
                    Resend
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Activity Log</h3>
        <div className="space-y-2">
          {mockAccessLog.map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded text-sm">
              <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900"><span className="font-medium">{log.memberName}</span> {log.action}</p>
                <p className="text-xs text-slate-600 mt-0.5">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Security Information
        </p>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• Each family member gets unique login credentials for security</li>
          <li>• You can revoke access anytime by removing a member</li>
          <li>• All actions are logged for your security audit trail</li>
          <li>• Members receive email invitation - they must accept to gain access</li>
        </ul>
      </div>
    </div>
  )
}
