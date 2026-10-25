'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Society, Admin, Visitor, ActivityLog, AdminInvitation, DashboardMetrics } from '@/types'

interface DataContextType {
  societies: Society[]
  admins: Admin[]
  visitors: Visitor[]
  activityLogs: ActivityLog[]
  adminInvitations: AdminInvitation[]
  
  // Society operations
  addSociety: (society: Society) => void
  updateSociety: (id: string, updates: Partial<Society>) => void
  deleteSociety: (id: string) => void
  pauseSociety: (id: string) => void
  resumeSociety: (id: string) => void
  
  // Admin operations
  addAdmin: (admin: Admin) => void
  updateAdmin: (id: string, updates: Partial<Admin>) => void
  deleteAdmin: (id: string) => void
  inviteAdmin: (invitation: AdminInvitation) => void
  acceptInvitation: (invitationId: string) => void
  
  // Visitor operations
  addVisitor: (visitor: Visitor) => void
  updateVisitor: (id: string, updates: Partial<Visitor>) => void
  deleteVisitor: (id: string) => void
  
  // Activity log operations
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
  
  // Getters
  getSocietyById: (id: string) => Society | undefined
  getAdminsBySociety: (societyId: string) => Admin[]
  getVisitorsBySociety: (societyId: string) => Visitor[]
  getActivityLogsBySociety: (societyId: string) => ActivityLog[]
  getDashboardMetrics: () => DashboardMetrics
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [societies, setSocieties] = useState<Society[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [adminInvitations, setAdminInvitations] = useState<AdminInvitation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize with data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch societies
        const societiesResponse = await fetch('/api/societies?limit=100')

        if (societiesResponse.ok) {
          const societiesData = await societiesResponse.json()
          const records = societiesData.data || []
          setSocieties(records.map((society: any) => ({
            ...society,
            slug: society.slug,
            phone: society.admin_phone || '',
            contactPerson: society.contact_person || '',
            occupiedUnits: society.occupied_units || 0,
            totalResidents: society.total_residents || 0,
            totalWatchmen: society.total_watchmen || 0,
            todayVisitors: society.today_visitors || 0,
            weekVisitors: society.week_visitors || 0,
            createdAt: new Date(society.created_at),
            admins: (society.society_admins || []).map((admin: any) => admin.id),
          })))
          setAdmins(records.flatMap((society: any) =>
            (society.society_admins || []).map((admin: any) => ({
              id: admin.id,
              name: admin.holder_name || admin.post_name,
              username: admin.username,
              postName: admin.post_name,
              holderName: admin.holder_name,
              phone: admin.phone || '',
              role: 'society-admin' as const,
              societyId: society.id,
              status: admin.status,
              isPrimary: admin.is_primary,
              lastLogin: admin.last_login ? new Date(admin.last_login) : null,
              createdAt: new Date(admin.created_at),
            }))
          ))
        } else {
          console.warn('[DataContext] Failed to fetch societies')
        }

        setIsLoaded(true)
      } catch (error) {
        console.error('[DataContext] Failed to load data:', error)
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('visitors', JSON.stringify(visitors))
    }
  }, [visitors, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
    }
  }, [activityLogs, isLoaded])

  // Society operations
  const addSociety = async (society: Society) => {
    try {
      const token = localStorage.getItem('superadminToken')
      
      // Call API to create society
      const response = await fetch('/api/societies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(society),
      })

      if (response.ok) {
        const newSociety = await response.json()
        setSocieties([...societies, newSociety.data || society])
        addActivityLog({
          type: 'society-created',
          description: `New society created: ${society.name}`,
          societyId: society.id,
        })
      } else {
        console.error('[DataContext] Failed to create society')
        setSocieties([...societies, society])
      }
    } catch (error) {
      console.error('[DataContext] Error creating society:', error)
      setSocieties([...societies, society])
    }
  }

  const updateSociety = (id: string, updates: Partial<Society>) => {
    setSocieties(
      societies.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSociety = (id: string) => {
    void fetch(`/api/societies/${id}`, { method: 'DELETE' }).then((result) => {
      if (result.ok) setSocieties((current) => current.filter((society) => society.id !== id))
    })
  }

  const pauseSociety = (id: string) => {
    void fetch(`/api/societies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    }).then((result) => {
      if (result.ok) setSocieties((current) => current.map((society) => society.id === id ? { ...society, status: 'paused' } : society))
    })
  }

  const resumeSociety = (id: string) => {
    void fetch(`/api/societies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    }).then((result) => {
      if (result.ok) setSocieties((current) => current.map((society) => society.id === id ? { ...society, status: 'active' } : society))
    })
  }

  // Admin operations
  const addAdmin = (admin: Admin) => {
    setAdmins([...admins, admin])
    addActivityLog({
      id: `log-${Date.now()}`,
      type: 'admin-added',
      description: `New admin added: ${admin.name}`,
      timestamp: new Date(),
      societyId: admin.societyId,
    })
  }

  const updateAdmin = (id: string, updates: Partial<Admin>) => {
    setAdmins(
      admins.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  const deleteAdmin = (id: string) => {
    setAdmins(admins.filter((a) => a.id !== id))
    addActivityLog({
      type: 'admin-removed',
      description: `Admin removed`,
    })
  }

  const inviteAdmin = (invitation: AdminInvitation) => {
    setAdminInvitations([...adminInvitations, invitation])
    addActivityLog({
      type: 'admin-invited',
      description: `New admin invited: ${invitation.name}`,
      societyId: invitation.societyId,
    })
  }

  const acceptInvitation = (invitationId: string) => {
    const invitation = adminInvitations.find(i => i.id === invitationId)
    if (invitation && invitation.status === 'pending') {
      const newAdmin: Admin = {
        id: `admin-${Date.now()}`,
        name: invitation.name,
        email: invitation.email,
        phone: invitation.phone,
        role: 'society-admin',
        societyId: invitation.societyId,
        createdAt: new Date(),
      }
      addAdmin(newAdmin)
      setAdminInvitations(
        adminInvitations.map(i => 
          i.id === invitationId ? { ...i, status: 'accepted' } : i
        )
      )
    }
  }

  // Visitor operations
  const addVisitor = (visitor: Visitor) => {
    setVisitors([...visitors, visitor])
    addActivityLog({
      id: `log-${Date.now()}`,
      type: 'visitor-check-in',
      description: `${visitor.name} checked in`,
      timestamp: new Date(),
      societyId: visitor.societyId,
    })
  }

  const updateVisitor = (id: string, updates: Partial<Visitor>) => {
    setVisitors(
      visitors.map((v) => (v.id === id ? { ...v, ...updates } : v))
    )
  }

  const deleteVisitor = (id: string) => {
    setVisitors(visitors.filter((v) => v.id !== id))
  }

  // Activity log operations
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      ...log,
    }
    setActivityLogs([newLog, ...activityLogs])
  }

  // Getter functions
  const getSocietyById = (id: string) => societies.find((s) => s.id === id)

  const getAdminsBySociety = (societyId: string) =>
    admins.filter((a) => a.societyId === societyId)

  const getVisitorsBySociety = (societyId: string) =>
    visitors.filter((v) => v.societyId === societyId)

  const getActivityLogsBySociety = (societyId: string) =>
    activityLogs.filter((log) => log.societyId === societyId)

  const getDashboardMetrics = (): DashboardMetrics => {
    const activeSocieties = societies.filter(s => s.status === 'active').length
    const pausedSocieties = societies.filter(s => s.status === 'paused').length
    const totalResidents = societies.reduce((sum, s) => sum + (s.totalResidents ?? 0), 0)
    const totalWatchmen = societies.reduce((sum, s) => sum + (s.totalWatchmen ?? 0), 0)
    const totalUnits = societies.reduce((sum, s) => sum + (s.villas ?? 0) + (s.bungalows ?? 0) + (s.flats ?? 0), 0)
    const villaCount = societies.reduce((sum, s) => sum + (s.villas ?? 0), 0)
    const bungalowCount = societies.reduce((sum, s) => sum + (s.bungalows ?? 0), 0)
    const flatCount = societies.reduce((sum, s) => sum + (s.flats ?? 0), 0)

    return {
      totalVisitors: visitors.length,
      todayCheckIns: visitors.filter(v => 
        new Date(v.checkInTime).toDateString() === new Date().toDateString()
      ).length,
      activeVisitors: visitors.filter(v => v.status === 'checked-in').length,
      totalSocieties: societies.length,
      activeSocieties,
      pausedSocieties,
      totalAdmins: admins.filter(a => a.role === 'society-admin').length,
      totalResidents,
      totalWatchmen,
      totalUnits,
      villaCount,
      bungalowCount,
      flatCount,
      averageVisitorsPerDay: Math.round(visitors.length / 30), // Rough estimate
    }
  }

  const value: DataContextType = {
    societies,
    admins,
    visitors,
    activityLogs,
    adminInvitations,
    addSociety,
    updateSociety,
    deleteSociety,
    pauseSociety,
    resumeSociety,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    inviteAdmin,
    acceptInvitation,
    addVisitor,
    updateVisitor,
    deleteVisitor,
    addActivityLog,
    getSocietyById,
    getAdminsBySociety,
    getVisitorsBySociety,
    getActivityLogsBySociety,
    getDashboardMetrics,
  }

  return (
    <DataContext.Provider value={value}>
      {isLoaded && children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
