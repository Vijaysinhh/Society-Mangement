'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, Phone, Mail, MessageCircle, Plus, ChevronDown, ChevronUp, Edit2, Save, X, Car, Users, Trash2, Calendar, Home, Link as LinkIcon, Building2, TrendingUp, DollarSign } from 'lucide-react'
import ResidentManagementPanel from './ResidentManagementPanel'

interface PropertyAssignment {
  residentId: string
  name: string
  phone: string
  email: string
  role: 'Owner' | 'Tenant'
  startDate: string
  endDate?: string
  isActive: boolean
}

interface PropertyVehicle {
  id: string
  registrationNumber: string
  vehicleType: 'car' | 'bike' | 'scooter' | 'other'
  makeModel: string
  color: string
  parkingSlot: string
  ownerName: string
}

interface Property {
  id: string
  unitNumber: string
  unitType: 'flat' | 'villa' | 'bungalow'
  floor: number
  status: 'occupied' | 'empty' | 'maintenance'
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid' | 'Payment Submitted' | 'Overdue' | 'No Bill'
  amount: string
  dueDate: string
  currentOwner: PropertyAssignment
  currentTenants: PropertyAssignment[]
  previousAssignments: PropertyAssignment[]
  vehicles: PropertyVehicle[]
  purchasePrice?: string
  currentValue?: string
  bedroomCount?: number
}

interface PropertyResidentsUnifiedProps {
  societyId: string
}

function unitToProperty(unit: any): Property {
  const assignments = Array.isArray(unit.unit_assignments) ? unit.unit_assignments : []
  const active = assignments.filter((item: any) => item.status === 'active' && item.residents?.status === 'active')
  const owner = active.find((item: any) => item.assignment_role === 'owner')
  const openBills = (unit.maintenance_bills || []).filter((bill: any) => !['paid', 'void'].includes(bill.status))
  const outstanding = openBills.reduce((sum: number, bill: any) => sum + Number(bill.amount || 0), 0)
  const hasOverdue = openBills.some((bill: any) => bill.status === 'unpaid' && new Date(`${bill.due_date}T23:59:59`) < new Date())
  const hasPendingPayment = openBills.some((bill: any) => bill.status === 'payment_pending')
  const hasPaidBill = (unit.maintenance_bills || []).some((bill: any) => bill.status === 'paid')
  const assignment = (item: any, isActive: boolean): PropertyAssignment => ({
    residentId: item.residents?.id || '', name: item.residents?.name || 'To be assigned',
    phone: item.residents?.phone || '', email: item.residents?.email || '',
    role: item.assignment_role === 'tenant' ? 'Tenant' : 'Owner', startDate: item.start_date || '',
    endDate: item.end_date || undefined, isActive,
  })
  return {
    id: unit.id, unitNumber: unit.unit_number, unitType: unit.unit_type, floor: unit.floor ?? 0,
    status: unit.lifecycle_status === 'maintenance' ? 'maintenance' : active.length ? 'occupied' : 'empty',
    paymentStatus: hasOverdue ? 'Overdue' : hasPendingPayment ? 'Payment Submitted' : openBills.length && hasPaidBill ? 'Partially Paid' : openBills.length ? 'Pending' : hasPaidBill ? 'Paid' : 'No Bill',
    amount: openBills.length ? `₹${outstanding.toLocaleString('en-IN')}` : 'No dues',
    dueDate: openBills.length ? openBills.map((bill: any) => bill.due_date).sort()[0] : 'No bill generated',
    currentOwner: owner ? assignment(owner, true) : { residentId: '', name: 'To be assigned', phone: '', email: '', role: 'Owner', startDate: '', isActive: false },
    currentTenants: active.filter((item: any) => item.assignment_role === 'tenant').map((item: any) => assignment(item, true)),
    previousAssignments: assignments.filter((item: any) => item.status === 'ended').map((item: any) => assignment(item, false)),
    vehicles: (unit.vehicles || []).filter((vehicle: any) => vehicle.status === 'active').map((vehicle: any) => ({
      id: vehicle.id, registrationNumber: vehicle.registration_number,
      vehicleType: vehicle.vehicle_type || 'other', makeModel: vehicle.make_model || '',
      color: vehicle.color || '', parkingSlot: vehicle.parking_slot || '',
      ownerName: vehicle.residents?.name || 'Resident not linked',
    })),
    bedroomCount: unit.bedroom_count ?? undefined,
  }
}

export default function PropertyResidentsUnified({ societyId }: PropertyResidentsUnifiedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string[]>(['Paid', 'Pending', 'Partially Paid', 'Payment Submitted', 'Overdue', 'No Bill'])
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['occupied', 'empty', 'maintenance'])
  const [selectedOwnerNames, setSelectedOwnerNames] = useState<string[]>([])
  const [selectedTenantNames, setSelectedTenantNames] = useState<string[]>([])
  const [priceRangeMin, setPriceRangeMin] = useState('')
  const [priceRangeMax, setPriceRangeMax] = useState('')
  const [selectedOccupancyType, setSelectedOccupancyType] = useState<string[]>(['owner-occupied', 'rented'])
  const [showCreateResidentLink, setShowCreateResidentLink] = useState(false)
  const [showManageResidents, setShowManageResidents] = useState(false)
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false)
  const [savingProperty, setSavingProperty] = useState(false)
  const [propertyFormError, setPropertyFormError] = useState('')
  const [newPropertyForm, setNewPropertyForm] = useState({ unitNumber: '', unitType: 'flat', floor: 0, bedroomCount: 1 })
  const [selectedPropertyForResident, setSelectedPropertyForResident] = useState<string | null>(null)
  const [residentLinks, setResidentLinks] = useState<Array<{ id: string; link: string; role: 'resident'; createdAt: string; expiresAt: string }>>([])
  const [creatingResidentLink, setCreatingResidentLink] = useState(false)
  const [residentLinkError, setResidentLinkError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [allResidents, setAllResidents] = useState<Array<{ id: string; propertyId: string; name: string; phone: string; email: string; role: 'Owner' | 'Tenant'; joinDate: string; isActive: boolean }>>([])
  const [residentToRevoke, setResidentToRevoke] = useState<(typeof allResidents)[number] | null>(null)
  const [revokingResident, setRevokingResident] = useState(false)
  const [propertyActionError, setPropertyActionError] = useState('')
  const [propertyActionStatus, setPropertyActionStatus] = useState('')
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [vehicleEdit, setVehicleEdit] = useState<Omit<PropertyVehicle, 'id' | 'ownerName'>>({ registrationNumber: '', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '' })
  const [savingVehicleId, setSavingVehicleId] = useState<string | null>(null)
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [editPropertyForm, setEditPropertyForm] = useState({ unitNumber: '', unitType: 'flat', floor: 0, bedroomCount: 1, status: 'active' })
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkRows, setBulkRows] = useState<Array<{ unitNumber: string; unitType: string; floor: string; bedroomCount: number }>>([])
  const [roleRequests, setRoleRequests] = useState<any[]>([])

  const refreshProperties = async () => {
    const response = await fetch('/api/units', { cache: 'no-store' })
    const result = await response.json()
    if (!response.ok) return
    const mapped = result.data.map(unitToProperty)
    setProperties(mapped)
    setAllResidents(mapped.flatMap((property: Property) => {
      const people = [...(property.currentOwner.isActive ? [property.currentOwner] : []), ...property.currentTenants]
      return people.map((person) => ({ id: person.residentId, propertyId: property.id, name: person.name, phone: person.phone, email: person.email, role: person.role, joinDate: person.startDate, isActive: person.isActive }))
    }))
  }

  const generateResidentLink = async (_propertyId?: string) => {
    setCreatingResidentLink(true)
    setResidentLinkError('')
    try {
      const response = await fetch('/api/resident-invitations', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not create invitation')
      const invitation = { id: result.data.id, link: result.data.link, role: 'resident' as const, createdAt: new Date(result.data.createdAt).toLocaleString(), expiresAt: new Date(result.data.expiresAt).toLocaleString() }
      setResidentLinks((current) => [...current, invitation])
      setSelectedPropertyForResident(null)
      setShowCreateResidentLink(true)
    } catch (error) {
      setResidentLinkError(error instanceof Error ? error.message : 'Could not create invitation')
    } finally { setCreatingResidentLink(false) }
  }

  const copyLinkToClipboard = async (link: string) => {
    await navigator.clipboard.writeText(link)
    setCopyStatus('Invitation link copied.')
  }

  const revokeResidentAccess = async () => {
    if (!residentToRevoke) return
    setRevokingResident(true)
    setPropertyActionError('')
    setPropertyActionStatus('')
    try {
      const response = await fetch(`/api/residents/${residentToRevoke.id}/access`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: residentToRevoke.propertyId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not revoke resident access')
      const endedAt = result.data.endedAt as string
      setAllResidents((current) => current.filter((resident) => !(resident.id === residentToRevoke.id && resident.propertyId === residentToRevoke.propertyId)))
      setProperties((current) => current.map((property) => {
        if (property.id !== residentToRevoke.propertyId) return property
        const revoked = property.currentOwner.residentId === residentToRevoke.id
          ? property.currentOwner
          : property.currentTenants.find((tenant) => tenant.residentId === residentToRevoke.id)
        const currentOwner = property.currentOwner.residentId === residentToRevoke.id
          ? { residentId: '', name: 'To be assigned', phone: '', email: '', role: 'Owner' as const, startDate: '', isActive: false }
          : property.currentOwner
        const currentTenants = property.currentTenants.filter((tenant) => tenant.residentId !== residentToRevoke.id)
        return {
          ...property,
          status: property.status === 'maintenance' ? 'maintenance' : (currentOwner.isActive || currentTenants.length ? 'occupied' : 'empty'),
          currentOwner,
          currentTenants,
          previousAssignments: revoked ? [...property.previousAssignments, { ...revoked, isActive: false, endDate: endedAt }] : property.previousAssignments,
        }
      }))
      setPropertyActionStatus(`Access revoked for ${residentToRevoke.name}.`)
      setResidentToRevoke(null)
    } catch (error) {
      setPropertyActionError(error instanceof Error ? error.message : 'Could not revoke resident access')
    } finally { setRevokingResident(false) }
  }

  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      unitNumber: 'A-101',
      unitType: 'flat',
      floor: 1,
      status: 'occupied',
      paymentStatus: 'Paid',
      amount: '₹6,500',
      dueDate: 'May 2024',
      currentOwner: {
        residentId: 'o1',
        name: 'Rajesh Kumar',
        phone: '98765 43210',
        email: 'rajesh@email.com',
        role: 'Owner',
        startDate: '2023-01-15',
        isActive: true,
      },
      currentTenants: [
        {
          residentId: 't1',
          name: 'Priya Sharma',
          phone: '91234 56789',
          email: 'priya@email.com',
          role: 'Tenant',
          startDate: '2023-02-01',
          isActive: true,
        },
      ],
      previousAssignments: [
        {
          residentId: 'o1-prev',
          name: 'Amit Kumar',
          phone: '95432 10987',
          email: 'amit.old@email.com',
          role: 'Owner',
          startDate: '2020-05-10',
          endDate: '2023-01-14',
          isActive: false,
        },
      ],
      vehicles: [
        { id: 'v1', registrationNumber: 'DL01AB1234', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '', ownerName: 'Rajesh' },
        { id: 'v2', registrationNumber: 'MH02CD5678', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '', ownerName: 'Priya' },
      ],
      purchasePrice: '₹45,00,000',
      currentValue: '₹65,00,000',
      bedroomCount: 3,
    },
    {
      id: '2',
      unitNumber: 'A-102',
      unitType: 'flat',
      floor: 1,
      status: 'occupied',
      paymentStatus: 'Pending',
      amount: '₹6,500',
      dueDate: 'May 2024',
      currentOwner: {
        residentId: 'o2',
        name: 'Neha Verma',
        phone: '99123 45678',
        email: 'neha@email.com',
        role: 'Owner',
        startDate: '2023-06-01',
        isActive: true,
      },
      currentTenants: [],
      previousAssignments: [
        {
          residentId: 't2-prev',
          name: 'Vikram Singh',
          phone: '91234 56788',
          email: 'vikram.old@email.com',
          role: 'Tenant',
          startDate: '2022-03-15',
          endDate: '2023-05-31',
          isActive: false,
        },
      ],
      vehicles: [],
      bedroomCount: 3,
    },
    {
      id: '3',
      unitNumber: 'B-201',
      unitType: 'flat',
      floor: 2,
      status: 'occupied',
      paymentStatus: 'Paid',
      amount: '₹6,500',
      dueDate: 'May 2024',
      currentOwner: {
        residentId: 'o3',
        name: 'Amit Patel',
        phone: '99876 54321',
        email: 'amit@email.com',
        role: 'Owner',
        startDate: '2024-01-01',
        isActive: true,
      },
      currentTenants: [
        {
          residentId: 't3',
          name: 'Vikram Singh',
          phone: '93456 78901',
          email: 'vikram@email.com',
          role: 'Tenant',
          startDate: '2023-06-01',
          isActive: true,
        },
      ],
      previousAssignments: [
        {
          residentId: 'o3-prev',
          name: 'Rajesh Kumar',
          phone: '98765 43210',
          email: 'rajesh.old@email.com',
          role: 'Owner',
          startDate: '2022-01-01',
          endDate: '2023-12-31',
          isActive: false,
        },
      ],
      vehicles: [
        { id: 'v4', registrationNumber: 'GJ02HI3456', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '', ownerName: 'Amit' },
        { id: 'v6', registrationNumber: 'HR26AB0123', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '', ownerName: 'Vikram' },
      ],
      bedroomCount: 3,
    },
    {
      id: '4',
      unitNumber: 'B-202',
      unitType: 'flat',
      floor: 2,
      status: 'empty',
      paymentStatus: 'Pending',
      amount: '₹6,500',
      dueDate: 'May 2024',
      currentOwner: {
        residentId: 'o4',
        name: 'Suresh Iyer',
        phone: '93456 78901',
        email: 'suresh@email.com',
        role: 'Owner',
        startDate: '2022-06-01',
        isActive: true,
      },
      currentTenants: [],
      previousAssignments: [
        {
          residentId: 't4-prev1',
          name: 'Priya Sharma',
          phone: '91234 56789',
          email: 'priya.old@email.com',
          role: 'Tenant',
          startDate: '2023-01-01',
          endDate: '2024-03-31',
          isActive: false,
        },
      ],
      vehicles: [{ id: 'v5', registrationNumber: 'TN09JK7890', vehicleType: 'car', makeModel: '', color: '', parkingSlot: '', ownerName: 'Suresh' }],
      bedroomCount: 3,
    },
    {
      id: '5',
      unitNumber: 'C-301',
      unitType: 'flat',
      floor: 3,
      status: 'maintenance',
      paymentStatus: 'Overdue',
      amount: '₹6,500',
      dueDate: 'March 2024',
      currentOwner: {
        residentId: 'o5',
        name: 'Kavya Patel',
        phone: '98765 43212',
        email: 'kavya@email.com',
        role: 'Owner',
        startDate: '2023-03-15',
        isActive: true,
      },
      currentTenants: [],
      previousAssignments: [
        {
          residentId: 'o5-prev',
          name: 'Ramesh Iyer',
          phone: '91234 56787',
          email: 'ramesh.old@email.com',
          role: 'Owner',
          startDate: '2018-06-01',
          endDate: '2023-03-14',
          isActive: false,
        },
      ],
      vehicles: [],
      bedroomCount: 2,
    },
  ])
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [unitLoadError, setUnitLoadError] = useState('')

  useEffect(() => {
    if (!societyId) return
    let cancelled = false
    setProperties([])
    setUnitsLoading(true)
    setUnitLoadError('')
    fetch('/api/units')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not load units')
        return result.data as Array<Record<string, unknown>>
      })
      .then((units) => {
        if (cancelled) return
        const mapped = units.map(unitToProperty)
        setProperties(mapped)
        setAllResidents(mapped.flatMap((property) => {
          const people = [...(property.currentOwner.isActive ? [property.currentOwner] : []), ...property.currentTenants]
          return people.map((person) => ({ id: person.residentId, propertyId: property.id, name: person.name, phone: person.phone, email: person.email, role: person.role, joinDate: person.startDate, isActive: person.isActive }))
        }))
      })
      .catch((error) => {
        if (!cancelled) setUnitLoadError(error instanceof Error ? error.message : 'Could not load units')
      })
      .finally(() => { if (!cancelled) setUnitsLoading(false) })
    return () => { cancelled = true }
  }, [societyId])

  useEffect(() => { if (societyId) fetch('/api/property-role-requests').then((r) => r.json()).then((result) => { if (result.success) setRoleRequests(result.data) }).catch(() => {}) }, [societyId])

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currentOwner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currentTenants.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.currentOwner.phone.includes(searchTerm)

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'occupied' && p.status === 'occupied') ||
      (activeTab === 'empty' && p.status === 'empty') ||
      (activeTab === 'maintenance' && p.status === 'maintenance')

    const matchesPaymentStatus = selectedPaymentStatus.includes(p.paymentStatus)
    const matchesPropertyStatus = selectedStatus.includes(p.status)

    // Advanced filters
    const matchesOwnerName = selectedOwnerNames.length === 0 || 
      selectedOwnerNames.some(name => p.currentOwner.name.toLowerCase().includes(name.toLowerCase()))

    const matchesTenantName = selectedTenantNames.length === 0 || 
      (selectedTenantNames.some(name => p.currentTenants.some(t => t.name.toLowerCase().includes(name.toLowerCase()))) ||
       selectedTenantNames.includes('no-tenant') && p.currentTenants.length === 0)

    const matchesPriceRange = true // prices stored as strings, will filter when converted to numbers
    
    const matchesOccupancyType = selectedOccupancyType.length === 0 || 
      (selectedOccupancyType.includes('owner-occupied') && p.currentTenants.length === 0) ||
      (selectedOccupancyType.includes('rented') && p.currentTenants.length > 0)

    return matchesSearch && matchesTab && matchesPaymentStatus && matchesPropertyStatus && 
           matchesOwnerName && matchesTenantName && matchesPriceRange && matchesOccupancyType
  })

  const statusCounts = {
    all: properties.length,
    occupied: properties.filter(p => p.status === 'occupied').length,
    empty: properties.filter(p => p.status === 'empty').length,
    maintenance: properties.filter(p => p.status === 'maintenance').length,
  }

  // Calculate statistics
  const statistics = {
    totalProperties: properties.length,
    occupiedProperties: properties.filter(p => p.status === 'occupied').length,
    emptyProperties: properties.filter(p => p.status === 'empty').length,
    paidProperties: properties.filter(p => p.paymentStatus === 'Paid').length,
    pendingProperties: properties.filter(p => p.paymentStatus === 'Pending').length,
    overdueProperties: properties.filter(p => p.paymentStatus === 'Overdue').length,
    totalPortfolioValue: properties.reduce((sum, p) => {
      const value = parseInt(p.currentValue?.replace(/[₹,]/g, '') || '0')
      return sum + value
    }, 0),
    averagePropertyValue: Math.round(properties.reduce((sum, p) => {
      const value = parseInt(p.currentValue?.replace(/[₹,]/g, '') || '0')
      return sum + value
    }, 0) / (properties.length || 1)),
    occupancyRate: Math.round((properties.filter(p => p.status === 'occupied').length / properties.length) * 100) || 0,
    collectionRate: Math.round((properties.filter(p => p.paymentStatus === 'Paid').length / properties.length) * 100) || 0,
    propertiesWithTenants: properties.filter(p => p.currentTenants.length > 0).length,
  }

  const handleCall = (phone: string, name: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`
    console.log(`[v0] Calling ${name} at ${phone}`)
  }

  const handleEmail = (email: string, name: string) => {
    window.location.href = `mailto:${email}`
    console.log(`[v0] Emailing ${name} at ${email}`)
  }

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Hello ${name}, I wanted to reach out regarding the property.`
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
    console.log(`[v0] WhatsApp to ${name} at ${phone}`)
  }

  const handleSaveVehicle = async (propertyId: string, vehicleId: string) => {
    setSavingVehicleId(vehicleId); setPropertyActionError(''); setPropertyActionStatus('')
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vehicleEdit) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not update vehicle')
      setProperties((current) => current.map((property) => property.id === propertyId ? { ...property, vehicles: property.vehicles.map((vehicle) => vehicle.id === vehicleId ? { ...vehicle, registrationNumber: result.data.registration_number, vehicleType: result.data.vehicle_type, makeModel: result.data.make_model || '', color: result.data.color || '', parkingSlot: result.data.parking_slot || '' } : vehicle) } : property))
      setEditingVehicleId(null); setPropertyActionStatus('Vehicle updated successfully.')
    } catch (error) { setPropertyActionError(error instanceof Error ? error.message : 'Could not update vehicle') }
    finally { setSavingVehicleId(null) }
  }

  const handleDeleteVehicle = async (propertyId: string, vehicleId: string) => {
    setDeletingVehicleId(vehicleId); setPropertyActionError(''); setPropertyActionStatus('')
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not remove vehicle')
      setProperties((current) => current.map((property) => property.id === propertyId ? { ...property, vehicles: property.vehicles.filter((vehicle) => vehicle.id !== vehicleId) } : property))
      setPropertyActionStatus('Vehicle removed successfully.')
    } catch (error) { setPropertyActionError(error instanceof Error ? error.message : 'Could not remove vehicle') }
    finally { setDeletingVehicleId(null) }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPropertyForm.unitNumber.trim()) { setPropertyFormError('Unit number is required.'); return }
    setSavingProperty(true)
    setPropertyFormError('')
    try {
      const response = await fetch('/api/units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPropertyForm) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not create property')
      const unit = result.data
      setProperties((current) => [...current, unitToProperty(unit)].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)))
      setNewPropertyForm({ unitNumber: '', unitType: 'flat', floor: 0, bedroomCount: 1 })
      setShowAddPropertyForm(false)
    } catch (error) {
      setPropertyFormError(error instanceof Error ? error.message : 'Could not create property')
    } finally { setSavingProperty(false) }
  }

  const openEditProperty = (property: Property) => {
    setEditingProperty(property)
    setEditPropertyForm({ unitNumber: property.unitNumber, unitType: property.unitType, floor: property.floor, bedroomCount: property.bedroomCount || 1, status: property.status === 'empty' || property.status === 'occupied' ? 'active' : property.status })
    setPropertyFormError('')
  }
  const saveEditedProperty = async (event: React.FormEvent) => {
    event.preventDefault(); if (!editingProperty) return
    setSavingProperty(true); setPropertyFormError('')
    try {
      const response = await fetch(`/api/units/${editingProperty.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editPropertyForm) })
      const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || result.error || 'Could not update property')
      setProperties((current) => result.data.lifecycle_status === 'inactive' ? current.filter((property) => property.id !== editingProperty.id) : current.map((property) => property.id === editingProperty.id ? { ...property, unitNumber: result.data.unit_number, unitType: result.data.unit_type, floor: result.data.floor ?? 0, bedroomCount: result.data.bedroom_count, status: result.data.lifecycle_status === 'maintenance' ? 'maintenance' : property.currentOwner.isActive || property.currentTenants.length ? 'occupied' : 'empty' } : property))
      setEditingProperty(null); setPropertyActionStatus(result.data.lifecycle_status === 'inactive' ? 'Property archived.' : 'Property updated successfully.')
    } catch (error) { setPropertyFormError(error instanceof Error ? error.message : 'Could not update property') }
    finally { setSavingProperty(false) }
  }
  const reviewRoleRequest = async (id: string, decision: 'approved' | 'rejected') => {
    const result = await fetch(`/api/property-role-requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) }).then((r) => r.json())
    if (!result.success) { setPropertyActionError(result.error || 'Could not review request'); return }
    setRoleRequests((current) => current.filter((item) => item.id !== id))
    if (decision === 'approved') {
      const unitsResult = await fetch('/api/units', { cache: 'no-store' }).then((response) => response.json())
      if (unitsResult.success) setProperties(unitsResult.data.map(unitToProperty))
    }
    setPropertyActionStatus(`Role change ${decision}.`)
  }
  const readCsv = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => { const lines = String(reader.result || '').trim().split(/\r?\n/); const rows = lines.slice(1).filter(Boolean).map((line) => { const [unitNumber, unitType, floor, bhk] = line.split(',').map((value) => value.trim()); return { unitNumber, unitType: unitType.toLowerCase(), floor, bedroomCount: Number(bhk) } }); setBulkRows(rows) }
    reader.readAsText(file)
  }
  const importProperties = async () => {
    setSavingProperty(true); setPropertyFormError('')
    try { const response = await fetch('/api/units/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ units: bulkRows }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Import failed'); window.location.reload() }
    catch (error) {
      let message = error instanceof Error ? error.message : 'Import failed'
      try { const parsed = JSON.parse(message) as Array<{ row: number; message: string }>; message = parsed.map((item) => `Row ${item.row}: ${item.message}`).join(' ') } catch {}
      setPropertyFormError(message)
    }
    finally { setSavingProperty(false) }
  }

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header - Not sticky since it's inside AdminLayout */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Properties & Residents</h2>
            <div className="flex gap-2">
              <button onClick={() => { setPropertyFormError(''); setShowAddPropertyForm(true) }} className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" /><span className="text-sm font-semibold">Add property</span>
              </button>
              <button onClick={() => { setBulkRows([]); setPropertyFormError(''); setShowBulkImport(true) }} className="px-3 py-2 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 text-sm font-semibold">Import CSV</button>
              <button
                onClick={() => setShowManageResidents(true)}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-900">Manage</span>
              </button>
              <button
                onClick={() => setShowFiltersModal(true)}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Filter className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-slate-900">Filters</span>
              </button>
            </div>
          </div>

          {/* Search Bar - Full Width in Header */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search unit, owner, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="w-full px-4 py-6 space-y-6 pb-24">
        {/* Stats Dashboard - Scrollable Content */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Portfolio Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{statistics.totalProperties}</p>
              <p className="text-xs text-slate-600 mt-1">Total Properties</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{statistics.collectionRate}%</p>
              <p className="text-xs text-slate-600 mt-1">Collection Rate</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{statistics.occupancyRate}%</p>
              <p className="text-xs text-slate-600 mt-1">Occupancy Rate</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">₹{(statistics.totalPortfolioValue / 10000000).toFixed(1)}Cr</p>
              <p className="text-xs text-slate-600 mt-1">Portfolio Value</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'all', label: `All (${statusCounts.all})` },
            { id: 'occupied', label: `Occupied (${statusCounts.occupied})` },
            { id: 'empty', label: `Empty (${statusCounts.empty})` },
            { id: 'maintenance', label: `Maintenance (${statusCounts.maintenance})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {unitLoadError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{unitLoadError}. Apply migration 002, then refresh this page.</div>}
        {propertyActionError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{propertyActionError}</div>}
        {propertyActionStatus && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{propertyActionStatus}</div>}
        {roleRequests.length > 0 && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-semibold text-amber-900">Owner/Tenant change requests</h3><div className="mt-3 space-y-2">{roleRequests.map((item) => { const resident = Array.isArray(item.residents) ? item.residents[0] : item.residents; const assignment = Array.isArray(item.unit_assignments) ? item.unit_assignments[0] : item.unit_assignments; const unit = Array.isArray(assignment?.units) ? assignment.units[0] : assignment?.units; return <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"><span><strong>{resident?.name}</strong> requests {item.requested_role} status for {unit?.unit_number}</span><div className="flex gap-2"><button onClick={() => void reviewRoleRequest(item.id, 'rejected')} className="rounded-lg border border-slate-300 px-3 py-1.5">Reject</button><button onClick={() => void reviewRoleRequest(item.id, 'approved')} className="rounded-lg bg-green-600 px-3 py-1.5 text-white">Approve</button></div></div>})}</div></div>}

        {/* Property Cards List */}
        <div className="space-y-3">
          {unitsLoading ? (
            <div role="status" className="py-12 text-center text-sm text-slate-500">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No properties found</p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{property.unitNumber}</h3>
                    <p className="text-xs capitalize text-slate-500">{property.unitType}{property.bedroomCount ? ` • ${property.bedroomCount >= 5 ? '5+' : property.bedroomCount} BHK` : ''}{property.unitType === 'flat' ? ` • Floor ${property.floor}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1"><button onClick={() => openEditProperty(property)} className="p-2 hover:bg-purple-50 rounded-lg text-purple-600" aria-label={`Edit ${property.unitNumber}`}><Edit2 className="w-4 h-4" /></button><button
                    onClick={() => setExpandedPropertyId(expandedPropertyId === property.id ? null : property.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {expandedPropertyId === property.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </button></div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    property.status === 'occupied' ? 'bg-blue-100 text-blue-700' :
                    property.status === 'empty' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    property.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                    property.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    property.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-700' :
                    property.paymentStatus === 'Payment Submitted' ? 'bg-blue-100 text-blue-700' :
                    property.paymentStatus === 'No Bill' ? 'bg-slate-100 text-slate-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {property.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Owner Section */}
              <div className="px-4 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Owner</p>
                      <p className="font-semibold text-slate-900">{property.currentOwner.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>{property.currentOwner.phone}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(property.currentOwner.phone, property.currentOwner.name)}
                    className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </button>
                  <button
                    onClick={() => handleEmail(property.currentOwner.email, property.currentOwner.name)}
                    className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    onClick={() => handleWhatsApp(property.currentOwner.phone, property.currentOwner.name)}
                    className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Tenants Section */}
              {property.currentTenants.length > 0 && (
                <div className="px-4 py-4 border-b border-slate-100">
                  {property.currentTenants.map((tenant, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👩</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Tenant</p>
                            <p className="font-semibold text-slate-900">{tenant.name}</p>
                            <p className="text-xs text-slate-500">Since {tenant.startDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>{tenant.phone}</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleCall(tenant.phone, tenant.name)}
                          className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4" /> Call
                        </button>
                        <button
                          onClick={() => handleEmail(tenant.email, tenant.name)}
                          className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" /> Email
                        </button>
                        <button
                          onClick={() => handleWhatsApp(tenant.phone, tenant.name)}
                          className="flex-1 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment and Details Section */}
              <div className="px-4 py-4 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Monthly Payment</p>
                    <p className="text-lg font-bold text-slate-900">{property.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</p>
                    <p className="text-sm text-slate-700">{property.dueDate}</p>
                  </div>
                </div>
                {property.bedroomCount && (
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">{property.bedroomCount >= 5 ? '5+' : property.bedroomCount} BHK</span>
                  </p>
                )}
              </div>

              {/* Resident-submitted Vehicles Section */}
              {expandedPropertyId === property.id && (
                <div className="px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-5 h-5 text-slate-600" />
                    <p className="font-semibold text-slate-900">Vehicles ({property.vehicles.length})</p>
                  </div>
                  <div className="space-y-2">
                    {property.vehicles.length === 0 && <p className="text-sm text-slate-500">No vehicles submitted by residents.</p>}
                    {property.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-3 bg-slate-50 rounded-lg">
                        {editingVehicleId === vehicle.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs font-medium text-slate-700">Registration<input value={vehicleEdit.registrationNumber} onChange={(event) => setVehicleEdit({ ...vehicleEdit, registrationNumber: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base" /></label>
                              <label className="text-xs font-medium text-slate-700">Type<select value={vehicleEdit.vehicleType} onChange={(event) => setVehicleEdit({ ...vehicleEdit, vehicleType: event.target.value as PropertyVehicle['vehicleType'] })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base"><option value="car">Car</option><option value="bike">Bike</option><option value="scooter">Scooter</option><option value="other">Other</option></select></label>
                              <label className="text-xs font-medium text-slate-700">Make/model<input value={vehicleEdit.makeModel} onChange={(event) => setVehicleEdit({ ...vehicleEdit, makeModel: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base" /></label>
                              <label className="text-xs font-medium text-slate-700">Colour<input value={vehicleEdit.color} onChange={(event) => setVehicleEdit({ ...vehicleEdit, color: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base" /></label>
                              <label className="col-span-2 text-xs font-medium text-slate-700">Parking slot<input value={vehicleEdit.parkingSlot} onChange={(event) => setVehicleEdit({ ...vehicleEdit, parkingSlot: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base" /></label>
                            </div>
                            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingVehicleId(null)} disabled={savingVehicleId === vehicle.id} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60">Cancel</button><button type="button" onClick={() => void handleSaveVehicle(property.id, vehicle.id)} disabled={savingVehicleId === vehicle.id} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"><Save className="h-4 w-4" />{savingVehicleId === vehicle.id ? 'Saving...' : 'Save'}</button></div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="text-sm font-semibold text-slate-900">{vehicle.registrationNumber}</p><p className="text-xs text-slate-500">{vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1)}{vehicle.makeModel ? ` • ${vehicle.makeModel}` : ''}{vehicle.color ? ` • ${vehicle.color}` : ''}</p><p className="mt-1 text-xs text-slate-500">{vehicle.ownerName}{vehicle.parkingSlot ? ` • Parking ${vehicle.parkingSlot}` : ''}</p></div>
                            <div className="flex gap-1"><button type="button" onClick={() => { setEditingVehicleId(vehicle.id); setVehicleEdit({ registrationNumber: vehicle.registrationNumber, vehicleType: vehicle.vehicleType, makeModel: vehicle.makeModel, color: vehicle.color, parkingSlot: vehicle.parkingSlot }); setPropertyActionError('') }} className="p-2 hover:bg-purple-100 rounded transition-colors" aria-label={`Edit vehicle ${vehicle.registrationNumber}`}><Edit2 className="w-4 h-4 text-purple-600" /></button><button type="button" onClick={() => handleDeleteVehicle(property.id, vehicle.id)} disabled={deletingVehicleId === vehicle.id} aria-label={`Remove vehicle ${vehicle.registrationNumber}`} className="p-2 hover:bg-red-100 rounded transition-colors disabled:cursor-wait disabled:opacity-50"><Trash2 className="w-4 h-4 text-red-600" /></button></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property History Timeline Section */}
              {expandedPropertyId === property.id && property.previousAssignments.length > 0 && (
                <div className="px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <p className="font-semibold text-slate-900">Assignment History</p>
                  </div>
                  <div className="space-y-3">
                    {/* Current Owner Entry */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-600 mt-1.5"></div>
                        <div className="w-0.5 h-8 bg-purple-200"></div>
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm font-semibold text-slate-900">{property.currentOwner.name}</p>
                        <p className="text-xs text-slate-500">Owner since {property.currentOwner.startDate}</p>
                      </div>
                    </div>

                    {/* Previous Assignments */}
                    {property.previousAssignments.map((assignment, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${assignment.role === 'Owner' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                          {idx < property.previousAssignments.length - 1 && <div className="w-0.5 h-8 bg-slate-200"></div>}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-sm font-semibold text-slate-900">{assignment.name}</p>
                          <p className="text-xs text-slate-500">
                            {assignment.role} from {assignment.startDate}
                            {assignment.endDate ? ` to ${assignment.endDate}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Resident Link Button */}
              {expandedPropertyId === property.id && (
                <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => generateResidentLink()}
                    disabled={creatingResidentLink}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {creatingResidentLink ? 'Creating Link...' : 'Create Resident Link (24h)'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>

      {showAddPropertyForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddProperty} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" aria-labelledby="add-property-title">
            <div className="flex items-center justify-between gap-4">
              <h3 id="add-property-title" className="text-lg font-bold text-slate-900">Add property</h3>
              <button type="button" onClick={() => setShowAddPropertyForm(false)} aria-label="Close add property form" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Unit number *<input value={newPropertyForm.unitNumber} onChange={(event) => setNewPropertyForm({ ...newPropertyForm, unitNumber: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base" placeholder="e.g. A-101" autoFocus /></label>
              <label className="text-sm font-medium text-slate-700">Property type<select value={newPropertyForm.unitType} onChange={(event) => setNewPropertyForm({ ...newPropertyForm, unitType: event.target.value, floor: event.target.value === 'flat' ? newPropertyForm.floor : 0 })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"><option value="flat">Flat</option><option value="villa">Villa</option><option value="bungalow">Bungalow</option></select></label>
              <label className="text-sm font-medium text-slate-700">BHK *<select value={newPropertyForm.bedroomCount} onChange={(event) => setNewPropertyForm({ ...newPropertyForm, bedroomCount: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"><option value={1}>1 BHK</option><option value={2}>2 BHK</option><option value={3}>3 BHK</option><option value={4}>4 BHK</option><option value={5}>5+ BHK</option></select></label>
              {newPropertyForm.unitType === 'flat' && <label className="text-sm font-medium text-slate-700 sm:col-span-2">Floor *<input type="number" min="0" value={newPropertyForm.floor} onChange={(event) => setNewPropertyForm({ ...newPropertyForm, floor: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base" /></label>}
            </div>
            {propertyFormError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{propertyFormError}</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowAddPropertyForm(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700">Cancel</button><button type="submit" disabled={savingProperty} className="rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{savingProperty ? 'Creating...' : 'Create property'}</button></div>
          </form>
        </div>
      )}

      {editingProperty && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><form onSubmit={saveEditedProperty} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">Edit property</h3><button type="button" onClick={() => setEditingProperty(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 sm:col-span-2">Unit number<input value={editPropertyForm.unitNumber} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, unitNumber: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-slate-700">Property type<select value={editPropertyForm.unitType} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, unitType: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"><option value="flat">Flat</option><option value="villa">Villa</option><option value="bungalow">Bungalow</option></select></label><label className="text-sm font-medium text-slate-700">BHK<select value={editPropertyForm.bedroomCount} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, bedroomCount: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5">{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value === 5 ? '5+' : value} BHK</option>)}</select></label>{editPropertyForm.unitType === 'flat' && <label className="text-sm font-medium text-slate-700">Floor<input type="number" min="0" value={editPropertyForm.floor} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, floor: Number(e.target.value) })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>}<label className="text-sm font-medium text-slate-700">Status<select value={editPropertyForm.status} onChange={(e) => setEditPropertyForm({ ...editPropertyForm, status: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Archive</option></select></label></div>{propertyFormError && <p className="mt-4 text-sm text-red-700">{propertyFormError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditingProperty(null)} className="rounded-lg border border-slate-300 px-4 py-2.5">Cancel</button><button disabled={savingProperty} className="rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{savingProperty ? 'Saving...' : 'Save property'}</button></div></form></div>}

      {showBulkImport && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">Import properties</h3><button onClick={() => setShowBulkImport(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-slate-600">CSV columns: unitNumber, unitType, floor, bhk. Floor may be blank for villas and bungalows.</p><a className="mt-3 inline-block text-sm font-semibold text-purple-600" download="properties-template.csv" href={'data:text/csv;charset=utf-8,unitNumber%2CunitType%2Cfloor%2Cbhk%0AA-101%2Cflat%2C1%2C2'}>Download template</a><input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && readCsv(e.target.files[0])} className="mt-4 block w-full text-sm" />{bulkRows.length > 0 && <div className="mt-4 max-h-52 overflow-auto rounded-lg border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-2">Unit</th><th className="p-2">Type</th><th className="p-2">Floor</th><th className="p-2">BHK</th></tr></thead><tbody>{bulkRows.map((row, index) => <tr key={`${row.unitNumber}-${index}`} className="border-t"><td className="p-2">{row.unitNumber}</td><td className="p-2">{row.unitType}</td><td className="p-2">{row.floor || '—'}</td><td className="p-2">{row.bedroomCount}</td></tr>)}</tbody></table></div>}{propertyFormError && <p className="mt-4 text-sm text-red-700">{propertyFormError}</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowBulkImport(false)} className="rounded-lg border border-slate-300 px-4 py-2.5">Cancel</button><button onClick={() => void importProperties()} disabled={!bulkRows.length || savingProperty} className="rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{savingProperty ? 'Importing...' : `Import ${bulkRows.length} properties`}</button></div></div></div>}

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Advanced Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Occupancy Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Occupancy Type</label>
                <div className="space-y-2">
                  {['owner-occupied', 'rented'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOccupancyType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOccupancyType([...selectedOccupancyType, type])
                          } else {
                            setSelectedOccupancyType(selectedOccupancyType.filter(s => s !== type))
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{type === 'owner-occupied' ? 'Owner Occupied' : 'Rented'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Status</label>
                <div className="space-y-2">
                  {['Paid', 'Pending', 'Partially Paid', 'Payment Submitted', 'Overdue', 'No Bill'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPaymentStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentStatus([...selectedPaymentStatus, status])
                          } else {
                            setSelectedPaymentStatus(selectedPaymentStatus.filter(s => s !== status))
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Property Status</label>
                <div className="space-y-2">
                  {['occupied', 'empty', 'maintenance'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status])
                          } else {
                            setSelectedStatus(selectedStatus.filter(s => s !== status))
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setSelectedPaymentStatus(['Paid', 'Pending', 'Partially Paid', 'Payment Submitted', 'Overdue', 'No Bill'])
                  setSelectedStatus(['occupied', 'empty', 'maintenance'])
                  setSelectedOccupancyType(['owner-occupied', 'rented'])
                  setSelectedOwnerNames([])
                  setSelectedTenantNames([])
                  setPriceRangeMin('')
                  setPriceRangeMax('')
                  console.log('[v0] All filters cleared - showing all properties')
                }}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  console.log('[v0] Filters applied:', { selectedPaymentStatus, selectedStatus, selectedOccupancyType })
                  setShowFiltersModal(false)
                }}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Resident Link Modal */}
      {showCreateResidentLink && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Resident Invitation Link</h3>
              <button
                onClick={() => setShowCreateResidentLink(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600">Share this link with the resident to let them sign up:</p>
              
              {residentLinks.length > 0 && residentLinks[residentLinks.length - 1] && (
                <>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-2">Invitation Link:</p>
                    <p className="text-xs text-slate-600 break-all font-mono mb-3">{residentLinks[residentLinks.length - 1].link}</p>
                    <button
                      onClick={() => copyLinkToClipboard(residentLinks[residentLinks.length - 1].link)}
                      className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                    {copyStatus && <p role="status" className="mt-2 text-center text-xs font-medium text-green-700">{copyStatus}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-slate-600">Created:</p>
                      <p className="font-medium text-slate-900">{residentLinks[residentLinks.length - 1].createdAt}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border border-red-200">
                      <p className="text-slate-600">Expires:</p>
                      <p className="font-medium text-red-700">{residentLinks[residentLinks.length - 1].expiresAt}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">⚠️ This link expires in 24 hours. Send it to your resident immediately.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowCreateResidentLink(false)}
              className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Manage Residents Modal */}
      {false && showManageResidents && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900">Manage Residents</h3>
              <button
                onClick={() => setShowManageResidents(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {allResidents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-3">No residents added yet</p>
                <p className="text-xs text-slate-400">Generate invitation links in properties to add residents</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allResidents.map(resident => (
                  <div
                    key={`${resident.id}-${resident.propertyId}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{resident.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {resident.phone}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-200 rounded text-slate-700">{resident.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPropertyActionError(''); setResidentToRevoke(resident) }}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Revoke access"
                      aria-label={`Revoke ${resident.name}'s access to this property`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowManageResidents(false)}
              className="w-full px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showManageResidents && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Manage residents"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><ResidentManagementPanel units={properties.filter((property) => property.status !== 'maintenance').map((property) => ({ id: property.id, unitNumber: property.unitNumber }))} onClose={() => setShowManageResidents(false)} onChanged={() => void refreshProperties()} /></div></div>}

      {residentToRevoke && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="revoke-resident-title" aria-describedby="revoke-resident-description">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 id="revoke-resident-title" className="text-lg font-bold text-slate-900">Revoke resident access?</h3>
              <p id="revoke-resident-description" className="mt-2 text-sm text-slate-600">
                {residentToRevoke.name} will lose access to this property. Their assignment will remain in property history, and they will be signed out if they have no other active property.
              </p>
            </div>
            {propertyActionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{propertyActionError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setResidentToRevoke(null); setPropertyActionError('') }} disabled={revokingResident} className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 disabled:opacity-60">Cancel</button>
              <button type="button" onClick={() => void revokeResidentAccess()} disabled={revokingResident} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{revokingResident ? 'Revoking...' : 'Revoke access'}</button>
            </div>
          </div>
        </div>
      )}



      {/* Footer Action Area */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 flex items-center justify-end gap-3">
        {residentLinkError && <p role="alert" className="mr-auto text-sm text-red-700">{residentLinkError}</p>}
        <button
          onClick={() => generateResidentLink()}
          disabled={creatingResidentLink}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <LinkIcon className="w-5 h-5" />
          {creatingResidentLink ? 'Generating...' : 'Generate Resident Link'}
        </button>
      </div>
    </div>
  )
}
