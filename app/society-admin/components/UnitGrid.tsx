'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Phone, MessageCircle, Edit, Trash2, AlertCircle, Search, ChevronDown, ChevronRight, Copy, Check, Download, Eye, DollarSign } from 'lucide-react'
import { getUnitMaintenanceSummary, getUnitMaintenanceFees, addOrUpdateMaintenanceFee, deleteMaintenanceFee, recordMaintenancePayment, initializeMaintenanceFee } from '../lib/maintenanceFeeManager'

// Unit type definition
interface Unit {
  id: string
  societyId: string
  unitType: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'row-house' | 'bungalow'
  unitNumber: string
  floor?: number
  status: 'occupied' | 'empty' | 'rented' | 'maintenance'
  propertyValue?: number
  propertyValues?: {
    purchasePrice?: number
    currentValue?: number
    totalArea?: number
    bedroomCount?: number
    bathroomCount?: number
  }
  residentId?: string
  residentName?: string
  rentalInfo?: {
    ownerName: string
    ownerPhone: string
    ownerEmail?: string
    tenantName?: string
    tenantPhone?: string
    moveInDate?: string
    leaseExpiry?: string
  }
  vehicles?: Array<{
    id: string
    type: 'four-wheeler' | 'two-wheeler'
    number: string
  }>
  parkingSlots?: string[]
  residents?: Array<{
    id: string
    name: string
  }>
  maintenanceFee?: {
    amount: number
    isPaid: boolean
    lastPaidDate?: string
    dueDate?: string
    paymentHistory?: Array<{
      id: string
      amount: number
      paidDate: string
      month: string
    }>
  }
  createdAt: Date
  updatedAt: Date
}

interface UnitGridProps {
  societyId: string
}

// Collapsible Section Component
function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-t border-slate-200 pt-3 sm:pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-1 text-left"
      >
        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h4>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default function UnitGrid({ societyId }: UnitGridProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'flat' | 'bungalow' | 'row-house'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'empty' | 'rented' | 'maintenance'>('all')
  const [filterMaintenanceStatus, setFilterMaintenanceStatus] = useState<'all-maintenance' | 'paid' | 'unpaid'>('all-maintenance')
  const [searchQuery, setSearchQuery] = useState('')
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ type: 'four-wheeler' as 'four-wheeler' | 'two-wheeler', number: '' })
  const [copiedLink, setCopiedLink] = useState(false)
  const [editingOwner, setEditingOwner] = useState(false)
  const [ownerForm, setOwnerForm] = useState({ name: '', phone: '', email: '' })
  const [editingResident, setEditingResident] = useState(false)
  const [residentForm, setResidentForm] = useState({ name: '' })
  const [editingUnit, setEditingUnit] = useState(false)
  const [unitForm, setUnitForm] = useState({ unitNumber: '', unitType: 'flat' as 'flat' | 'bungalow' | 'row-house', floor: 0 })
  const [showAllTickets, setShowAllTickets] = useState(false)
  const [allTickets, setAllTickets] = useState<any[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null)
  const [creatingTicket, setCreatingTicket] = useState(false)
  const [ticketForm, setTicketForm] = useState({ category: 'plumbing', description: '', priority: 'medium' })
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [viewingTenantProfile, setViewingTenantProfile] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null)
  const [showMaintenancePaymentModal, setShowMaintenancePaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', type: 'partial' as 'partial' | 'full', notes: '' })
  const [maintenanceFees, setMaintenanceFees] = useState<any[]>([])
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null)
  const [editingVehicleForm, setEditingVehicleForm] = useState({ number: '' })
  const [editingDocument, setEditingDocument] = useState<string | null>(null)
  const [editingDocumentForm, setEditingDocumentForm] = useState({ title: '', description: '' })
  const [documentDescription, setDocumentDescription] = useState('')
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null)
  const [editingPropertyValues, setEditingPropertyValues] = useState(false)
  const [propertyValuesForm, setPropertyValuesForm] = useState({ 
    purchasePrice: '', 
    currentValue: '', 
    totalArea: '', 
    bedroomCount: '', 
    bathroomCount: '' 
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let societyUnits: Unit[] = []
    const storedUnits = JSON.parse(localStorage.getItem('units') || '[]')
    societyUnits = storedUnits.filter((u: Unit) => u.societyId === societyId)

    if (societyUnits.length === 0) {
      const mockUnits: Unit[] = []
      const unitTypes: Array<'flat' | 'bungalow' | 'row-house'> = ['flat', 'bungalow', 'row-house']
      const statuses: Array<'occupied' | 'empty' | 'rented' | 'maintenance'> = ['occupied', 'empty', 'rented']
      let unitId = 1

      unitTypes.forEach((type) => {
        for (let i = 1; i <= 20; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const hasVehicles = status === 'occupied' || status === 'rented'
          
          mockUnits.push({
            id: `unit-${unitId}`,
            societyId,
            unitType: type,
            unitNumber: `${type === 'flat' ? 'F' : type === 'bungalow' ? 'B' : 'R'}-${String(i).padStart(3, '0')}`,
            floor: type === 'flat' ? Math.ceil(i / 5) : undefined,
            status,
            residentId: status === 'occupied' ? `resident-${unitId}` : undefined,
            residentName: status === 'occupied' ? `Resident ${unitId}` : undefined,
            rentalInfo: {
              ownerName: `Owner ${unitId}`,
              ownerPhone: `+91 98765${String(unitId).padStart(5, '0')}`,
              ownerEmail: `owner${unitId}@example.com`,
              tenantName: status === 'rented' ? `Tenant ${unitId}` : undefined,
              tenantPhone: status === 'rented' ? `+91 87654${String(unitId).padStart(5, '0')}` : undefined,
              moveInDate: status === 'rented' ? '12 Jan 2024' : undefined,
              leaseExpiry: status === 'rented' ? '12 Jan 2025' : undefined
            },
            vehicles: hasVehicles ? [
              {
                id: `vehicle-${unitId}-1`,
                type: 'four-wheeler' as const,
                number: `MH12AB${String(unitId).padStart(4, '0')}`
              },
              ...(Math.random() > 0.5 ? [{
                id: `vehicle-${unitId}-2`,
                type: 'two-wheeler' as const,
                number: `MH12XY${String(unitId).padStart(4, '0')}`
              }] : [])
            ] : [],
            parkingSlots: hasVehicles ? [`P-${20 + unitId}`] : [],
            residents: status === 'occupied' || status === 'rented' ? [
              { id: `res-${unitId}`, name: `Resident ${unitId}` },
              ...(Math.random() > 0.6 ? [{ id: `res-${unitId}-1`, name: `Family Member ${unitId}` }] : [])
            ] : [],
            createdAt: new Date(),
            updatedAt: new Date()
          })
          unitId++
        }
      })

      societyUnits = mockUnits
      localStorage.setItem('units', JSON.stringify(mockUnits))
    }

    setUnits(societyUnits)
    
    // Load documents on mount
    const storedDocuments = JSON.parse(localStorage.getItem('unitDocuments') || '[]')
    setUploadedDocuments(storedDocuments)
  }, [societyId])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'empty':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      case 'rented':
        return 'bg-red-100 border-red-300 hover:bg-red-200'
      case 'maintenance':
        return 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200'
      default:
        return 'bg-slate-100 border-slate-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'empty':
        return 'Empty'
      case 'rented':
        return 'Rented'
      case 'maintenance':
        return 'Maintenance'
      default:
        return 'Unknown'
    }
  }

  // Load maintenance fees when unit is selected
  useEffect(() => {
    if (selectedUnit) {
      const fees = getUnitMaintenanceFees(selectedUnit.id)
      setMaintenanceFees(fees)
    }
  }, [selectedUnit])

  // Sync listener for maintenance fee updates
  useEffect(() => {
    const handleSync = () => {
      console.log('[v0] Maintenance fee sync received in UnitGrid')
      if (selectedUnit) {
        const fees = getUnitMaintenanceFees(selectedUnit.id)
        setMaintenanceFees(fees)
      }
    }
    
    window.addEventListener('maintenanceFeeSync', handleSync)
    return () => window.removeEventListener('maintenanceFeeSync', handleSync)
  }, [selectedUnit])

  const handleAddVehicle = () => {
    if (!vehicleForm.number || !selectedUnit) return
    
    const updatedUnit: Unit = {
      ...selectedUnit,
      vehicles: [
        ...(selectedUnit.vehicles || []),
        {
          id: `vehicle-${Date.now()}`,
          type: vehicleForm.type,
          number: vehicleForm.number.toUpperCase()
        }
      ]
    }
    
    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    setVehicleForm({ type: 'four-wheeler', number: '' })
    setShowVehicleForm(false)
    showToast('Vehicle added successfully')
  }

  const handleRemoveVehicle = (vehicleId: string) => {
    if (!selectedUnit) return
    
    const updatedUnit: Unit = {
      ...selectedUnit,
      vehicles: (selectedUnit.vehicles || []).filter(v => v.id !== vehicleId)
    }
    
    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    showToast('Vehicle removed successfully')
  }

  const handleSaveOwner = () => {
    if (!selectedUnit || !ownerForm.name || !ownerForm.phone) return

    const updatedUnit: Unit = {
      ...selectedUnit,
      rentalInfo: {
        ...selectedUnit.rentalInfo,
        ownerName: ownerForm.name,
        ownerPhone: ownerForm.phone,
        ownerEmail: ownerForm.email
      } as any
    }

    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    setEditingOwner(false)
  }

  const handleAddResident = () => {
    if (!selectedUnit || !residentForm.name) return

    const updatedUnit: Unit = {
      ...selectedUnit,
      residents: [
        ...(selectedUnit.residents || []),
        {
          id: `resident-${Date.now()}`,
          name: residentForm.name
        }
      ]
    }

    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    setResidentForm({ name: '' })
    setEditingResident(false)
  }

  const handleCopyLink = () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/join-unit?unit=${selectedUnit?.id}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCallOwner = () => {
    if (selectedUnit?.rentalInfo?.ownerPhone) {
      window.location.href = `tel:${selectedUnit.rentalInfo.ownerPhone}`
    }
  }

  const handleWhatsAppOwner = () => {
    if (selectedUnit?.rentalInfo?.ownerPhone) {
      const phone = selectedUnit.rentalInfo.ownerPhone.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}`, '_blank')
    }
  }

  const handleCreateTicket = () => {
    if (!selectedUnit) return
    setCreatingTicket(true)
  }

  const handleSaveTicket = () => {
    if (!selectedUnit || !ticketForm.description) return

    const newTicket = {
      id: `ticket-${Date.now()}`,
      unitId: selectedUnit.id,
      unitNumber: selectedUnit.unitNumber,
      category: ticketForm.category,
      description: ticketForm.description,
      priority: ticketForm.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDays: 2
    }
    const tickets = JSON.parse(localStorage.getItem('maintenanceTickets') || '[]')
    tickets.push(newTicket)
    localStorage.setItem('maintenanceTickets', JSON.stringify(tickets))
    
    // Update tickets list in drawer
    setAllTickets(tickets.filter((t: any) => t.unitId === selectedUnit.id))
    setCreatingTicket(false)
    setTicketForm({ category: 'plumbing', description: '', priority: 'medium' })
  }

  const handleDeleteTicket = (ticketId: string) => {
    const tickets = JSON.parse(localStorage.getItem('maintenanceTickets') || '[]')
    const updated = tickets.filter((t: any) => t.id !== ticketId)
    localStorage.setItem('maintenanceTickets', JSON.stringify(updated))
    setAllTickets(updated.filter((t: any) => t.unitId === selectedUnit?.id))
  }

  const handleDeleteDocument = (documentId: string) => {
    const docs = uploadedDocuments.filter((d: any) => d.id !== documentId)
    localStorage.setItem('unitDocuments', JSON.stringify(docs))
    setUploadedDocuments(docs)
    showToast('Document deleted successfully')
  }

  const handleEditVehicle = (vehicleId: string, currentNumber: string) => {
    setEditingVehicle(vehicleId)
    setEditingVehicleForm({ number: currentNumber })
  }

  const handleSaveVehicle = (vehicleId: string) => {
    if (!selectedUnit || !editingVehicleForm.number) return

    const updatedUnit: Unit = {
      ...selectedUnit,
      vehicles: selectedUnit.vehicles?.map(v => 
        v.id === vehicleId ? { ...v, number: editingVehicleForm.number } : v
      ) || []
    }

    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    setEditingVehicle(null)
  }

  const handleEditDocument = (documentId: string, currentDescription: string) => {
    setEditingDocument(documentId)
    setEditingDocumentForm({ description: currentDescription || '' })
  }

  const handleSaveDocument = (documentId: string) => {
    const docs = uploadedDocuments.map((d: any) => 
      d.id === documentId ? { ...d, description: editingDocumentForm.description } : d
    )
    localStorage.setItem('unitDocuments', JSON.stringify(docs))
    setUploadedDocuments(docs)
    setEditingDocument(null)
  }

  const handleSaveUnit = () => {
    if (!selectedUnit || !unitForm.unitNumber) return

    const updatedUnit: Unit = {
      ...selectedUnit,
      unitNumber: unitForm.unitNumber,
      unitType: unitForm.unitType,
      floor: unitForm.floor || undefined,
      updatedAt: new Date()
    }

    setSelectedUnit(updatedUnit)
    updateUnit(updatedUnit)
    setEditingUnit(false)
  }

  const handleViewAllTickets = () => {
    const tickets = JSON.parse(localStorage.getItem('maintenanceTickets') || '[]')
    const unitTickets = tickets.filter((t: any) => t.unitId === selectedUnit?.id)
    setAllTickets(unitTickets)
    setShowAllTickets(true)
  }

  const handleDownloadDocument = (documentId: string) => {
    // Show the document in-app view
    setViewingDocumentId(documentId)
  }

  const handleUploadDocument = (type: string) => {
    if (!documentFile || !selectedUnit) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const newDocument = {
        id: `doc-${Date.now()}`,
        unitId: selectedUnit.id,
        type: type,
        fileName: documentFile.name,
        fileSize: documentFile.size,
        uploadedAt: new Date().toISOString(),
        url: e.target?.result as string
      }
      
      const docs = JSON.parse(localStorage.getItem('unitDocuments') || '[]')
      docs.push(newDocument)
      localStorage.setItem('unitDocuments', JSON.stringify(docs))
      
      setUploadedDocuments(docs)
      setDocumentFile(null)
    }
    reader.readAsDataURL(documentFile)
  }

  const updateUnit = (updatedUnit: Unit) => {
    const updated = units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
    setUnits(updated)
    localStorage.setItem('units', JSON.stringify(updated))
  }

  // Search and filter logic
  const filteredUnits = units.filter(u => {
    const typeMatch = filterType === 'all' || u.unitType === filterType
    const statusMatch = filterStatus === 'all' || u.status === filterStatus
    
    // Maintenance fee payment status filter
    const maintenanceMatch = filterMaintenanceStatus === 'all-maintenance' || 
      (filterMaintenanceStatus === 'paid' && u.maintenanceFee?.isPaid) ||
      (filterMaintenanceStatus === 'unpaid' && !u.maintenanceFee?.isPaid)
    
    // Search across unit number, resident names, vehicle numbers, owner/tenant phone
    const searchLower = searchQuery.toLowerCase()
    const searchMatch = searchQuery === '' || 
      u.unitNumber.toLowerCase().includes(searchLower) ||
      u.residentName?.toLowerCase().includes(searchLower) ||
      u.rentalInfo?.ownerName?.toLowerCase().includes(searchLower) ||
      u.rentalInfo?.tenantName?.toLowerCase().includes(searchLower) ||
      u.rentalInfo?.ownerPhone?.includes(searchQuery) ||
      u.rentalInfo?.tenantPhone?.includes(searchQuery) ||
      u.vehicles?.some(v => v.number.toLowerCase().includes(searchLower)) ||
      u.residents?.some(r => r.name.toLowerCase().includes(searchLower))
    
    return typeMatch && statusMatch && maintenanceMatch && searchMatch
  })

  const occupiedCount = units.filter(u => u.status === 'occupied').length
  const emptyCount = units.filter(u => u.status === 'empty').length
  const rentedCount = units.filter(u => u.status === 'rented').length
  const maintenanceCount = units.filter(u => u.status === 'maintenance').length

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit)
    setShowDetail(true)
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total</p>
          <p className="text-xl sm:text-3xl font-bold text-slate-900">{units.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-2 sm:p-4">
          <p className="text-xs font-semibold text-green-600 uppercase mb-1">Occupied</p>
          <p className="text-xl sm:text-3xl font-bold text-green-700">{occupiedCount}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-2 sm:p-4">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1">Rented</p>
          <p className="text-xl sm:text-3xl font-bold text-red-700">{rentedCount}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-2 sm:p-4">
          <p className="text-xs font-semibold text-yellow-600 uppercase mb-1">Empty</p>
          <p className="text-xl sm:text-3xl font-bold text-yellow-700">{emptyCount}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-2 sm:p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Maintenance</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-700">{maintenanceCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search unit, resident, vehicle number, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filter Type */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
        {(['all', 'flat', 'bungalow', 'row-house'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
              filterType === type
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Types' : type.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Filter Status */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
        {(['all', 'occupied', 'rented', 'empty', 'maintenance'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status === 'all' ? 'All Status' : status}
          </button>
        ))}
      </div>

      {/* Filter Maintenance Payment Status */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
        {(['all-maintenance', 'paid', 'unpaid'] as const).map(maintenanceStatus => (
          <button
            key={maintenanceStatus}
            onClick={() => setFilterMaintenanceStatus(maintenanceStatus)}
            className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
              filterMaintenanceStatus === maintenanceStatus
                ? maintenanceStatus === 'paid' ? 'bg-green-600 text-white' : maintenanceStatus === 'unpaid' ? 'bg-red-600 text-white' : 'bg-slate-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {maintenanceStatus === 'all-maintenance' ? 'All Maintenance' : maintenanceStatus === 'paid' ? 'Maintenance Paid' : 'Maintenance Unpaid'}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-slate-600">
          Found {filteredUnits.length} unit{filteredUnits.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Unit Grid - Enhanced with indicators */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
        {filteredUnits.map(unit => (
          <div key={unit.id} className="relative">
            <button
              onClick={() => handleUnitClick(unit)}
              className={`w-full aspect-square rounded-lg border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getStatusColor(unit.status)}`}
            >
              <div className="text-center px-1">
                <p className="text-[10px] opacity-60 leading-tight uppercase">{unit.unitType.slice(0, 3)}</p>
                <p className="break-words text-xs sm:text-sm font-bold">{unit.unitNumber}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px] sm:text-xs opacity-70">
                  <span>R:{unit.residents?.length || 0}</span>
                  <span>V:{unit.vehicles?.length || 0}</span>
                </div>
              </div>
            </button>
            {/* Maintenance Fee Status Indicator */}
            {unit.maintenanceFee && (
              <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                unit.maintenanceFee.isPaid ? 'bg-green-500' : 'bg-red-500'
              }`} title={unit.maintenanceFee.isPaid ? 'Maintenance Paid' : 'Maintenance Unpaid'} />
            )}
          </div>
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No units found matching your criteria</p>
              </div>
            )}

            {/* Edit Document Modal */}
            {editingDocument && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Document Description</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <textarea
                        value={editingDocumentForm.description}
                        onChange={(e) => setEditingDocumentForm({ description: e.target.value })}
                        placeholder="Enter document details"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => handleSaveDocument(editingDocument)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDocument(null)}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

      {/* Unit Detail Drawer */}
      {showDetail && selectedUnit && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-all duration-200" onClick={() => setShowDetail(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
              
              {/* Sticky Header */}
              <div className="sticky top-0 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-start justify-between gap-3 z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{selectedUnit.unitNumber}</h3>
                    <span className="text-xs sm:text-sm text-slate-600 capitalize">{selectedUnit.unitType}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {selectedUnit.floor && `Floor ${selectedUnit.floor} • `}
                    Residents: {selectedUnit.residents?.length || 0} • Vehicles: {selectedUnit.vehicles?.length || 0}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                    selectedUnit.status === 'occupied' ? 'bg-green-100 text-green-700' :
                    selectedUnit.status === 'empty' ? 'bg-yellow-100 text-yellow-700' :
                    selectedUnit.status === 'rented' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {getStatusLabel(selectedUnit.status)}
                  </span>
                  <button 
                    onClick={() => setShowDetail(false)} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors duration-150"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
                
                {/* Unit Status Control */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-3 sm:p-4 border border-indigo-200 mb-5 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2.5">Unit Status</label>
                  <select
                    value={selectedUnit.status}
                    onChange={(e) => {
                      const updated = { ...selectedUnit, status: e.target.value as Unit['status'], updatedAt: new Date() }
                      setSelectedUnit(updated)
                      updateUnit(updated)
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-indigo-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="occupied">🏠 Occupied</option>
                    <option value="rented">🔑 Rented</option>
                    <option value="empty">⬜ Empty</option>
                    <option value="maintenance">🔧 Maintenance</option>
                  </select>
                </div>

                {/* Property Values Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-3 sm:p-4 border border-indigo-200 mb-5 sm:mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">Property Details</h4>
                    <button
                      onClick={() => setEditingPropertyValues(true)}
                      className="p-1 hover:bg-indigo-200 rounded transition-colors"
                      title="Edit property values"
                    >
                      <Edit className="w-4 h-4 text-indigo-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                    <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                      <p className="text-slate-600 font-medium mb-1">Total Area</p>
                      <p className="text-lg sm:text-xl font-bold text-indigo-600">
                        {selectedUnit.propertyValues?.totalArea ? `${selectedUnit.propertyValues.totalArea.toLocaleString()} sqft` : '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                      <p className="text-slate-600 font-medium mb-1">Bedrooms</p>
                      <p className="text-lg sm:text-xl font-bold text-indigo-600">
                        {selectedUnit.propertyValues?.bedroomCount ?? '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                      <p className="text-slate-600 font-medium mb-1">Bathrooms</p>
                      <p className="text-lg sm:text-xl font-bold text-indigo-600">
                        {selectedUnit.propertyValues?.bathroomCount ?? '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                      <p className="text-slate-600 font-medium mb-1">Purchase Price</p>
                      <p className="text-sm sm:text-base font-bold text-indigo-600">
                        {selectedUnit.propertyValues?.purchasePrice ? `₹${(selectedUnit.propertyValues.purchasePrice / 100000).toFixed(1)}L` : '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                      <p className="text-slate-600 font-medium mb-1">Current Value</p>
                      <p className="text-sm sm:text-base font-bold text-indigo-600">
                        {selectedUnit.propertyValues?.currentValue ? `₹${(selectedUnit.propertyValues.currentValue / 100000).toFixed(1)}L` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
              
              {/* Tenant Information (if rented) - Always open */}
              {selectedUnit.status === 'rented' && selectedUnit.rentalInfo?.tenantName && (
                <CollapsibleSection title="Current Tenant" icon="👤" defaultOpen={true}>
                  <div className="space-y-2 text-xs sm:text-sm mb-3">
                    <p><span className="text-slate-600">Name:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.tenantName}</span></p>
                    <p><span className="text-slate-600">Phone:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.tenantPhone}</span></p>
                    <p><span className="text-slate-600">Move-in:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.moveInDate}</span></p>
                    <p><span className="text-slate-600">Lease Expiry:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.leaseExpiry}</span></p>
                  </div>
                  <button 
                    onClick={() => setViewingTenantProfile(true)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 active:bg-blue-100 transition-all duration-200">
                    👤 View Tenant Profile
                  </button>
                </CollapsibleSection>
              )}

              {/* Owner / Landlord - Always open */}
              <CollapsibleSection title={selectedUnit.status === 'rented' ? 'Owner / Landlord' : 'Owner'} icon="👑" defaultOpen={true}>
                {selectedUnit.rentalInfo ? (
                  <>
                    <div className="space-y-2 text-xs sm:text-sm mb-3">
                      <p><span className="text-slate-600">Name:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.ownerName}</span></p>
                      <p><span className="text-slate-600">Phone:</span> <span className="font-medium text-slate-900">{selectedUnit.rentalInfo.ownerPhone}</span></p>
                      {selectedUnit.rentalInfo.ownerEmail && (
                        <p><span className="text-slate-600">Email:</span> <span className="font-medium text-slate-900 break-all">{selectedUnit.rentalInfo.ownerEmail}</span></p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={handleCallOwner}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 rounded text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        Call
                      </button>
                      <button 
                        onClick={handleWhatsAppOwner}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-100 text-indigo-700 rounded text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => {
                          setEditingOwner(true)
                          setOwnerForm({
                            name: selectedUnit.rentalInfo?.ownerName || '',
                            phone: selectedUnit.rentalInfo?.ownerPhone || '',
                            email: selectedUnit.rentalInfo?.ownerEmail || ''
                          })
                        }}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-700 rounded text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors">
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        Edit
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic py-2">Owner information not available.</p>
                )}
              </CollapsibleSection>

              {/* Residents Section */}
              <CollapsibleSection title={`Residents (${selectedUnit.residents?.length || 0})`} icon="👥" defaultOpen={false}>
                <div className="space-y-2">
                  {selectedUnit.residents && selectedUnit.residents.length > 0 ? (
                    selectedUnit.residents.map((resident) => (
                      <div key={resident.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                        <span className="text-xs sm:text-sm text-slate-900 font-medium">{resident.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingResident(resident.id)
                              setResidentForm({ name: resident.name })
                            }}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Edit resident"
                          >
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = {
                                ...selectedUnit,
                                residents: selectedUnit.residents?.filter(r => r.id !== resident.id) || []
                              }
                              setSelectedUnit(updated)
                              updateUnit(updated)
                            }}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete resident"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 italic">No residents registered</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingResident(true)
                    setResidentForm({ name: '' })
                  }}
                  className="w-full mt-3 px-3 py-2 text-xs sm:text-sm text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors font-medium"
                >
                  Add Resident
                </button>
              </CollapsibleSection>

              {/* Vehicles Section */}
              <CollapsibleSection title={`Vehicles (${selectedUnit.vehicles?.length || 0})`} icon="🚗" defaultOpen={false}>
                <div className="space-y-2 mb-3">
                  {selectedUnit.vehicles && selectedUnit.vehicles.length > 0 ? (
                    <>
                      {/* Four Wheelers */}
                      {selectedUnit.vehicles.filter(v => v.type === 'four-wheeler').length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500 mb-1">Four Wheelers</p>
                          {selectedUnit.vehicles.filter(v => v.type === 'four-wheeler').map(vehicle => (
                            <div key={vehicle.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg mb-1">
                              {editingVehicle === vehicle.id ? (
                                <input
                                  type="text"
                                  value={editingVehicleForm.number}
                                  onChange={(e) => setEditingVehicleForm({ number: e.target.value })}
                                  className="flex-1 px-2 py-1 text-xs sm:text-sm font-mono border border-indigo-300 rounded mr-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-xs sm:text-sm font-mono font-medium text-slate-900">{vehicle.number}</span>
                              )}
                              <div className="flex gap-1">
                                {editingVehicle === vehicle.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveVehicle(vehicle.id)}
                                      className="p-1 hover:bg-green-100 rounded transition-colors"
                                    >
                                      <Check className="w-3 h-3 text-green-600" />
                                    </button>
                                    <button
                                      onClick={() => setEditingVehicle(null)}
                                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    >
                                      <X className="w-3 h-3 text-slate-600" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditVehicle(vehicle.id, vehicle.number)}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      <Edit className="w-3 h-3 text-indigo-600" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveVehicle(vehicle.id)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Two Wheelers */}
                      {selectedUnit.vehicles.filter(v => v.type === 'two-wheeler').length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Two Wheelers</p>
                          {selectedUnit.vehicles.filter(v => v.type === 'two-wheeler').map(vehicle => (
                            <div key={vehicle.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg mb-1">
                              {editingVehicle === vehicle.id ? (
                                <input
                                  type="text"
                                  value={editingVehicleForm.number}
                                  onChange={(e) => setEditingVehicleForm({ number: e.target.value })}
                                  className="flex-1 px-2 py-1 text-xs sm:text-sm font-mono border border-indigo-300 rounded mr-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-xs sm:text-sm font-mono font-medium text-slate-900">{vehicle.number}</span>
                              )}
                              <div className="flex gap-1">
                                {editingVehicle === vehicle.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveVehicle(vehicle.id)}
                                      className="p-1 hover:bg-green-100 rounded transition-colors"
                                    >
                                      <Check className="w-3 h-3 text-green-600" />
                                    </button>
                                    <button
                                      onClick={() => setEditingVehicle(null)}
                                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    >
                                      <X className="w-3 h-3 text-slate-600" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditVehicle(vehicle.id, vehicle.number)}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      <Edit className="w-3 h-3 text-indigo-600" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveVehicle(vehicle.id)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 italic">No vehicles registered</p>
                  )}
                </div>

                {/* Add Vehicle Form */}
                {showVehicleForm ? (
                  <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200">
                    <select
                      value={vehicleForm.type}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value as 'four-wheeler' | 'two-wheeler' })}
                      className="w-full px-3.5 py-3 text-sm border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200 cursor-pointer hover:border-blue-400"
                    >
                      <option value="four-wheeler">🚗 Four Wheeler</option>
                      <option value="two-wheeler">🏍️ Two Wheeler</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Vehicle Number (e.g. MH12AB1234)"
                      value={vehicleForm.number}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, number: e.target.value })}
                      className="w-full px-3.5 py-3 text-sm border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200 hover:border-blue-400"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleAddVehicle}
                        disabled={!vehicleForm.number}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✓ Add
                      </button>
                      <button
                        onClick={() => setShowVehicleForm(false)}
                        className="flex-1 px-4 py-2.5 bg-slate-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-400 active:bg-slate-500 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVehicleForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 border-2 border-indigo-600 rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add Vehicle
                  </button>
                )}
              </CollapsibleSection>

              {/* Security Rules (Visitor Settings) - REMOVED - Moved to Settings tab */}

              {/* Maintenance History */}
              <CollapsibleSection title="Recent Maintenance" icon="🛠️" defaultOpen={false}>
                <div className="space-y-2">
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Plumbing</p>
                        <p className="text-xs text-slate-600">5 days ago</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Done</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">Electrical</p>
                        <p className="text-xs text-slate-600">2 days ago</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">Progress</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleViewAllTickets}
                  className="w-full mt-4 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 border-2 border-orange-600 rounded-lg hover:from-orange-700 hover:to-orange-800 active:from-orange-800 active:to-orange-900 transition-all duration-200">
                  📋 View All Tickets
                </button>
              </CollapsibleSection>

              {/* Documents */}
              <CollapsibleSection title="Documents" icon="📄" defaultOpen={false}>
                <div className="space-y-2 text-xs sm:text-sm">
                  {uploadedDocuments.filter((d: any) => d.unitId === selectedUnit.id).length > 0 ? (
                    uploadedDocuments.filter((d: any) => d.unitId === selectedUnit.id).map((doc: any) => (
                      <div key={doc.id} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-lg">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-900 font-bold">{doc.title || 'Document'}</p>
                              <p className="text-xs text-slate-600">{doc.fileName}</p>
                              <p className="text-xs text-slate-500">{(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 mb-2">{doc.description}</p>
                        )}
                        <div className="flex gap-2 flex-wrap pt-2">
                          <button 
                            onClick={() => handleDownloadDocument(doc.id)} 
                            className="px-3 py-2 text-xs sm:text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition-all duration-200 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button 
                            onClick={() => {
                              setEditingDocument(doc.id)
                              setEditingDocumentForm({ title: doc.title || '', description: doc.description || '' })
                            }}
                            className="px-3 py-2 text-xs sm:text-sm font-semibold bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 active:bg-amber-300 transition-all duration-200 flex items-center gap-1.5">
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-2 text-xs sm:text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 active:bg-red-300 transition-all duration-200 flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 text-center py-4">No documents uploaded yet</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setUploadingDocument(true)
                    setDocumentTitle('')
                    setDocumentDescription('')
                    setDocumentFile(null)
                  }}
                  className="w-full mt-4 px-4 py-3 text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 border-2 border-indigo-600 rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all duration-200 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Upload Document
                </button>
              </CollapsibleSection>

              {/* Activity Timeline */}
              <CollapsibleSection title="Activity Timeline" icon="📅" defaultOpen={false}>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-1 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900">Tenant added</p>
                      <p className="text-xs text-slate-600">12 Feb, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900">Visitor approved</p>
                      <p className="text-xs text-slate-600">13 Feb, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900">Ticket created</p>
                      <p className="text-xs text-slate-600">14 Feb, 2024</p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Invite Resident */}
              <CollapsibleSection title="Invite Resident" icon="🔗" defaultOpen={false}>
                <p className="text-xs sm:text-sm text-slate-600 mb-2">Share this link to invite a new resident:</p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex gap-1 sm:gap-2 mb-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join-unit?unit=${selectedUnit.id}`}
                    className="flex-1 px-2 py-1 bg-white border border-indigo-300 rounded text-xs font-mono text-slate-700 overflow-x-auto"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium flex-shrink-0 transition-colors ${
                      copiedLink 
                        ? 'bg-green-600 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 inline mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 inline mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Link expires in 24 hours</p>
              </CollapsibleSection>

              {/* Maintenance Fee Section - Enhanced with Status & History */}
              <CollapsibleSection 
                title={`Maintenance Fees ${maintenanceFees.length > 0 ? `(${maintenanceFees.filter(f => f.status !== 'paid').length} Unpaid)` : ''}`}
                icon={<DollarSign className="w-4 h-4" />}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  {/* Fee Summary Stats */}
                  {maintenanceFees.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 font-semibold">Paid</p>
                        <p className="text-lg font-bold text-green-900">₹{maintenanceFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.paidAmount, 0)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-700 font-semibold">Pending</p>
                        <p className="text-lg font-bold text-yellow-900">₹{maintenanceFees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.remainingAmount, 0)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-semibold">Total</p>
                        <p className="text-lg font-bold text-blue-900">₹{maintenanceFees.reduce((sum, f) => sum + f.totalAmount, 0)}</p>
                      </div>
                    </div>
                  )}

                  {/* Fee List */}
                  {maintenanceFees.length > 0 ? (
                    <div className="space-y-3">
                      {maintenanceFees.map(fee => (
                        <div key={fee.id} className={`rounded-lg p-3 border-2 transition-all ${
                          fee.status === 'paid' ? 'bg-green-50 border-green-200' :
                          fee.status === 'partially_paid' ? 'bg-yellow-50 border-yellow-200' :
                          fee.daysOverdue > 0 ? 'bg-red-100 border-red-300' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-slate-600">{fee.month}</p>
                                {fee.daysOverdue > 0 && fee.status !== 'paid' && (
                                  <span className="text-xs bg-red-200 text-red-700 px-1.5 py-0.5 rounded font-semibold">Overdue {fee.daysOverdue}d</span>
                                )}
                              </div>
                              <p className="text-lg font-bold text-slate-900">₹{fee.totalAmount}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                              fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                              fee.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {fee.status === 'paid' ? '✓ Paid' :
                               fee.status === 'partially_paid' ? '◐ Partial' :
                               '✗ Pending'}
                            </span>
                          </div>

                          {/* Payment Details */}
                          <div className="grid grid-cols-2 gap-2 mb-3 bg-white/50 p-2 rounded">
                            <div className="bg-white/70 p-2 rounded">
                              <p className="text-slate-600 text-xs">Paid</p>
                              <p className="font-bold text-green-600">₹{fee.paidAmount}</p>
                            </div>
                            <div className="bg-white/70 p-2 rounded">
                              <p className="text-slate-600 text-xs">Remaining</p>
                              <p className="font-bold text-red-600">₹{fee.remainingAmount}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-300 rounded-full h-2 mb-3">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                fee.status === 'paid' ? 'bg-green-600' :
                                fee.status === 'partially_paid' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}
                              style={{width: `${(fee.paidAmount / fee.totalAmount) * 100}%`}}
                            />
                          </div>

                          {/* Payment History - Enhanced */}
                          {fee.payments.length > 0 && (
                            <div className="mb-3 pb-3 border-b border-white/50">
                              <p className="text-xs font-semibold text-slate-900 mb-2">Payment History ({fee.payments.length})</p>
                              <div className="space-y-1.5 max-h-20 overflow-y-auto">
                                {fee.payments.map((payment, idx) => (
                                  <div key={payment.id} className="flex justify-between text-xs bg-white/40 p-1.5 rounded">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-slate-700 font-medium">₹{payment.amount}</span>
                                      <span className="text-slate-600 ml-2 text-xs">{new Date(payment.paidDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-slate-600 ml-2 flex-shrink-0 text-xs">{payment.paymentMethod || 'Cash'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {fee.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setEditingFeeId(fee.id)
                                  setPaymentForm({ amount: '', type: fee.paidAmount > 0 ? 'partial' : 'full', notes: '' })
                                  setShowMaintenancePaymentModal(true)
                                }}
                                className="flex-1 px-2 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                              >
                                Record Payment
                              </button>
                            )}
                            <button
                              onClick={() => {
                                deleteMaintenanceFee(fee.id)
                                setMaintenanceFees(maintenanceFees.filter(f => f.id !== fee.id))
                                showToast('Fee deleted successfully')
                              }}
                              className="px-2 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600 text-sm">No maintenance fees recorded</p>
                    </div>
                  )}

                  {/* Add New Fee Button */}
                  {maintenanceFees.length > 0 && (
                    <button
                      onClick={() => {
                        const newFee = initializeMaintenanceFee(selectedUnit.id, 5000)
                        addOrUpdateMaintenanceFee(newFee)
                        setMaintenanceFees([newFee, ...maintenanceFees])
                        showToast('New maintenance fee added')
                      }}
                      className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Month Fee
                    </button>
                  )}
                </div>
              </CollapsibleSection>

              {/* Payment Modal */}
              {showMaintenancePaymentModal && editingFeeId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
                      <button onClick={() => {
                        setShowMaintenancePaymentModal(false)
                        setEditingFeeId(null)
                      }} className="text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {maintenanceFees.find(f => f.id === editingFeeId) && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-xs text-slate-600">Remaining Amount</p>
                          <p className="text-2xl font-bold text-slate-900">₹{maintenanceFees.find(f => f.id === editingFeeId)?.remainingAmount || 0}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-2">Payment Type</label>
                          <div className="flex gap-2">
                            <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer" style={{borderColor: paymentForm.type === 'partial' ? '#3b82f6' : '#e2e8f0'}}>
                              <input
                                type="radio"
                                value="partial"
                                checked={paymentForm.type === 'partial'}
                                onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as any})}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-slate-900">Partial</span>
                            </label>
                            <label className="flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer" style={{borderColor: paymentForm.type === 'full' ? '#3b82f6' : '#e2e8f0'}}>
                              <input
                                type="radio"
                                value="full"
                                checked={paymentForm.type === 'full'}
                                onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as any})}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-slate-900">Full</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-2">Amount</label>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">₹</span>
                            <input
                              type="number"
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                              placeholder="Enter amount"
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-2">Notes (Optional)</label>
                          <textarea
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                            placeholder="Add payment notes..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowMaintenancePaymentModal(false)
                              setEditingFeeId(null)
                            }}
                            className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const fee = maintenanceFees.find(f => f.id === editingFeeId)
                              if (fee && paymentForm.amount) {
                                const updatedFee = recordMaintenancePayment(
                                  fee,
                                  parseFloat(paymentForm.amount),
                                  paymentForm.type,
                                  paymentForm.notes
                                )
                                addOrUpdateMaintenanceFee(updatedFee)
                                setMaintenanceFees(maintenanceFees.map(f => f.id === updatedFee.id ? updatedFee : f))
                                showToast(`Payment of ₹${paymentForm.amount} recorded successfully`)
                                setShowMaintenancePaymentModal(false)
                                setEditingFeeId(null)
                                setPaymentForm({ amount: '', type: 'partial', notes: '' })
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Save Payment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button 
                  onClick={() => {
                    setEditingUnit(true)
                    setUnitForm({
                      unitNumber: selectedUnit.unitNumber,
                      unitType: selectedUnit.unitType,
                      floor: selectedUnit.floor || 0
                    })
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex-1">
                  <Edit className="w-4 h-4" />
                  Edit Unit
                </button>
                <button 
                  onClick={() => {
                    setEditingResident(true)
                    setResidentForm({ name: '' })
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex-1">
                  <Plus className="w-4 h-4" />
                  Add Resident
                </button>
                <button 
                  onClick={() => setShowVehicleForm(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex-1">
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
                <button 
                  onClick={handleCreateTicket}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex-1">
                  <AlertCircle className="w-4 h-4" />
                  Create Ticket
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetail(false)}
              className="w-full mt-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
              </div>
            </div>
          </div>

          {/* Edit Owner Modal */}
          {editingOwner && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Owner Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                      <input
                        type="text"
                        value={ownerForm.name}
                        onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={ownerForm.phone}
                        onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={ownerForm.email}
                        onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleSaveOwner}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingOwner(false)}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add/Edit Resident Modal */}
            {editingResident && typeof editingResident === 'string' && editingResident !== 'true' && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Resident</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Resident Name</label>
                      <input
                        type="text"
                        value={residentForm.name}
                        onChange={(e) => setResidentForm({ name: e.target.value })}
                        placeholder="Enter resident name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        if (residentForm.name && typeof editingResident === 'string') {
                          const updated = {
                            ...selectedUnit,
                            residents: selectedUnit.residents?.map(r =>
                              r.id === editingResident ? { ...r, name: residentForm.name } : r
                            ) || []
                          }
                          setSelectedUnit(updated)
                          updateUnit(updated)
                          setEditingResident(null)
                          setResidentForm({ name: '' })
                        }
                      }}
                      disabled={!residentForm.name}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingResident(null)
                        setResidentForm({ name: '' })
                      }}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Resident Modal */}
            {editingResident === true && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Add New Resident</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Resident Name</label>
                      <input
                        type="text"
                        value={residentForm.name}
                        onChange={(e) => setResidentForm({ name: e.target.value })}
                        placeholder="Enter resident name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleAddResident}
                      disabled={!residentForm.name}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setEditingResident(null)
                        setResidentForm({ name: '' })
                      }}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Unit Modal */}
            {editingUnit && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Unit Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Unit Number</label>
                      <input
                        type="text"
                        value={unitForm.unitNumber}
                        onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Unit Type</label>
                      <select
                        value={unitForm.unitType}
                        onChange={(e) => setUnitForm({ ...unitForm, unitType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="flat">Flat</option>
                        <option value="bungalow">Bungalow</option>
                        <option value="row-house">Row House</option>
                      </select>
                    </div>
                    {unitForm.unitType === 'flat' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Floor Number</label>
                        <input
                          type="number"
                          value={unitForm.floor}
                          onChange={(e) => setUnitForm({ ...unitForm, floor: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleSaveUnit}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUnit(false)}
                      className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Document Modal */}
            {uploadingDocument && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:w-full max-h-[90vh] md:max-h-none overflow-y-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 md:scale-in">
                  <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-slate-900">📄 Upload Document</h3>
                    <button
                      onClick={() => {
                        setUploadingDocument(false)
                        setDocumentFile(null)
                        setDocumentTitle('')
                        setDocumentDescription('')
                      }}
                      className="text-slate-500 hover:text-slate-700 hover:bg-white/50 p-1.5 rounded-lg transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 px-4 md:px-6 py-5 md:py-6 space-y-5 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Document Type *</label>
                      <select
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-slate-400 bg-white"
                      >
                        <option value="">Choose document type...</option>
                        <option value="ID Proof">🆔 ID Proof</option>
                        <option value="Rent Agreement">📋 Rent Agreement</option>
                        <option value="Property Document">🏠 Property Document</option>
                        <option value="Vehicle RC">🚗 Vehicle RC</option>
                        <option value="Insurance">🛡️ Insurance</option>
                        <option value="Other">📎 Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Select File *</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                          className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 file:font-medium hover:file:bg-blue-200"
                        />
                      </div>
                      {documentFile && (
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-xs text-slate-600 font-medium">Selected file:</p>
                          <p className="text-sm text-slate-900 font-semibold mt-1">📎 {documentFile.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{(documentFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Details (Optional)</label>
                      <textarea
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        placeholder="Add notes or additional details..."
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none hover:border-slate-400"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 px-4 md:px-6 py-4 md:py-5 flex gap-3">
                    <button
                      onClick={() => {
                        if (documentFile && documentTitle) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const newDocument = {
                              id: `doc-${Date.now()}`,
                              unitId: selectedUnit?.id,
                              type: 'document',
                              title: documentTitle,
                              fileName: documentFile.name,
                              fileSize: documentFile.size,
                              description: documentDescription,
                              uploadedAt: new Date().toISOString(),
                              url: e.target?.result as string
                            }
                            
                            const docs = JSON.parse(localStorage.getItem('unitDocuments') || '[]')
                            docs.push(newDocument)
                            localStorage.setItem('unitDocuments', JSON.stringify(docs))
                            
                            setUploadedDocuments(docs)
                            setDocumentFile(null)
                            setDocumentTitle('')
                            setDocumentDescription('')
                            setUploadingDocument(false)
                            showToast('Document uploaded successfully')
                          }
                          reader.readAsDataURL(documentFile)
                        }
                      }}
                      disabled={!documentFile || !documentTitle}
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-indigo-600"
                    >
                      ✓ Upload Document
                    </button>
                    <button
                      onClick={() => {
                        setUploadingDocument(false)
                        setDocumentFile(null)
                        setDocumentTitle('')
                        setDocumentDescription('')
                      }}
                      className="flex-1 px-4 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 active:bg-slate-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View All Tickets Modal */}
            {showAllTickets && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">All Maintenance Tickets</h3>
                    <button
                      onClick={() => setShowAllTickets(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {allTickets.length === 0 ? (
                    <p className="text-sm text-slate-600">No maintenance tickets found for this unit.</p>
                  ) : (
                    <div className="space-y-2">
                      {allTickets.map((ticket) => (
                        <div key={ticket.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-sm text-slate-900">{ticket.category}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              ticket.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              ticket.status === 'in-progress' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{ticket.description}</p>
                          <p className="text-xs text-slate-500 mt-1">Est. {ticket.estimatedDays} day(s)</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowAllTickets(false)}
                    className="w-full mt-4 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Create Ticket Modal */}
            {creatingTicket && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:w-full max-h-[90vh] md:max-h-none overflow-y-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 md:scale-in">
                  <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-slate-900">🔧 Create Maintenance Ticket</h3>
                    <button
                      onClick={() => {
                        setCreatingTicket(false)
                        setTicketForm({ category: 'plumbing', description: '', priority: 'medium' })
                      }}
                      className="text-slate-500 hover:text-slate-700 hover:bg-white/50 p-1.5 rounded-lg transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 px-4 md:px-6 py-5 md:py-6 space-y-5 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Category *</label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-slate-400 bg-white"
                      >
                        <option value="plumbing">🚿 Plumbing</option>
                        <option value="electrical">⚡ Electrical</option>
                        <option value="painting">🎨 Painting</option>
                        <option value="cleaning">🧹 Cleaning</option>
                        <option value="structural">🏗️ Structural</option>
                        <option value="other">📋 Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Priority *</label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-slate-400 bg-white"
                      >
                        <option value="low">⬇️ Low</option>
                        <option value="medium">�� Medium</option>
                        <option value="high">⬆️ High</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Description *</label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        placeholder="Describe the maintenance issue clearly..."
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none hover:border-slate-400"
                        rows={5}
                      />
                      <p className="mt-2 text-xs text-slate-600">
                        {ticketForm.description.length}/200 characters
                      </p>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 px-4 md:px-6 py-4 md:py-5 flex gap-3">
                    <button
                      onClick={() => {
                        if (ticketForm.description) {
                          handleSaveTicket()
                          showToast('Maintenance ticket created successfully')
                        }
                      }}
                      disabled={!ticketForm.description}
                      className="flex-1 px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-orange-600"
                    >
                      📝 Create Ticket
                    </button>
                    <button
                      onClick={() => {
                        setCreatingTicket(false)
                        setTicketForm({ category: 'plumbing', description: '', priority: 'medium' })
                      }}
                      className="flex-1 px-4 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 active:bg-slate-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Document Modal */}
            {editingDocument && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md md:w-full max-h-[90vh] md:max-h-none overflow-y-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 md:scale-in">
                  <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
                    <h3 className="text-lg font-bold text-slate-900">✏️ Edit Document</h3>
                    <button
                      onClick={() => setEditingDocument(null)}
                      className="text-slate-500 hover:text-slate-700 hover:bg-white/50 p-1.5 rounded-lg transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 px-4 md:px-6 py-5 md:py-6 space-y-5 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Document Title</label>
                      <input
                        type="text"
                        value={editingDocumentForm.title}
                        onChange={(e) => setEditingDocumentForm({ ...editingDocumentForm, title: e.target.value })}
                        placeholder="Enter document title..."
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2.5">Details</label>
                      <textarea
                        value={editingDocumentForm.description}
                        onChange={(e) => setEditingDocumentForm({ ...editingDocumentForm, description: e.target.value })}
                        placeholder="Add any additional details..."
                        className="w-full px-3.5 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none hover:border-slate-400"
                        rows={5}
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 px-4 md:px-6 py-4 md:py-5 flex gap-3">
                    <button
                      onClick={() => {
                        const docs = uploadedDocuments.map((d: any) =>
                          d.id === editingDocument ? { ...d, title: editingDocumentForm.title, description: editingDocumentForm.description } : d
                        )
                        localStorage.setItem('unitDocuments', JSON.stringify(docs))
                        setUploadedDocuments(docs)
                        setEditingDocument(null)
                        showToast('Document updated successfully')
                      }}
                      className="flex-1 px-4 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-all duration-200"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setEditingDocument(null)}
                      className="flex-1 px-4 py-3 bg-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-400 active:bg-slate-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Tenant Profile Modal */}
            {viewingTenantProfile && selectedUnit.rentalInfo?.tenantName && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Tenant Profile</h3>
                    <button
                      onClick={() => setViewingTenantProfile(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Name</p>
                      <p className="text-sm font-medium text-slate-900">{selectedUnit.rentalInfo.tenantName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Phone</p>
                      <p className="text-sm font-medium text-slate-900">{selectedUnit.rentalInfo.tenantPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Move-in Date</p>
                      <p className="text-sm font-medium text-slate-900">{selectedUnit.rentalInfo.moveInDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Lease Expiry</p>
                      <p className="text-sm font-medium text-slate-900">{selectedUnit.rentalInfo.leaseExpiry}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingTenantProfile(false)}
                    className="w-full mt-6 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
        </>
      )}

      {/* View Document Modal */}
      {viewingDocumentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {uploadedDocuments.find(d => d.id === viewingDocumentId)?.title || 'Document'}
              </h3>
              <button
                onClick={() => setViewingDocumentId(null)}
                className="text-slate-500 hover:text-slate-700 hover:bg-white/50 p-1.5 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {(() => {
                const doc = uploadedDocuments.find(d => d.id === viewingDocumentId)
                if (!doc) return null
                
                const isImage = doc.url && (doc.url.includes('image') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => doc.fileName?.toLowerCase().includes(ext)))
                const isPdf = doc.fileName?.toLowerCase().includes('.pdf')
                
                return (
                  <div className="space-y-4">
                    {isImage ? (
                      <img src={doc.url} alt={doc.title} className="max-w-full h-auto rounded-lg border border-slate-200" />
                    ) : isPdf ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-slate-600 text-center mb-4">PDF files cannot be previewed in-app</p>
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Download PDF
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-slate-600 text-center mb-2">File format cannot be previewed</p>
                        <p className="text-xs text-slate-500 text-center mb-4">File: {doc.fileName}</p>
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Download File
                        </a>
                      </div>
                    )}
                    {doc.description && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-900 mb-2">Details</p>
                        <p className="text-sm text-slate-700">{doc.description}</p>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>File: {doc.fileName}</p>
                      <p>Size: {(doc.fileSize / 1024).toFixed(2)} KB</p>
                      <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setViewingDocumentId(null)}
                className="flex-1 px-4 py-2.5 bg-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-400 transition-colors"
              >
                Close
              </button>
              {(() => {
                const doc = uploadedDocuments.find(d => d.id === viewingDocumentId)
                if (!doc?.url) return null
                return (
                  <a
                    href={doc.url}
                    download={doc.fileName}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                  >
                    Download
                  </a>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <div className="flex items-center justify-center w-5 h-5 bg-white/30 rounded-full">
              <Check className="w-3 h-3" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-5 h-5 bg-white/30 rounded-full">
              <AlertCircle className="w-3 h-3" />
            </div>
          )}
          <span className="text-sm sm:text-base">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
