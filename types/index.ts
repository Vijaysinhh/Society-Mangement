export type Role = 'superadmin' | 'society-admin' | 'resident' | 'watchman'

export interface Society {
  id: string
  name: string
  slug?: string
  address: string
  city: string
  state: string
  phone: string
  contactPerson: string
  admins: string[]
  totalResidents: number
  totalWatchmen: number
  villas: number
  bungalows: number
  flats: number
  occupiedUnits: number
  status: 'active' | 'paused' | 'archived'
  todayVisitors: number
  weekVisitors: number
  createdAt: Date
  contactEmail?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface Admin {
  id: string
  name: string
  email?: string
  username?: string
  postName?: string
  holderName?: string
  phone: string
  role: 'superadmin' | 'society-admin'
  societyId?: string
  status?: 'active' | 'suspended' | 'deactivated'
  isPrimary?: boolean
  lastLogin?: Date | null
  createdAt: Date
}

export interface Resident {
  id: string
  name: string
  email: string
  phone: string
  societyId: string
  unitId: string
  createdAt: Date
}

export interface Unit {
  id: string
  societyId: string
  unitType: 'flat' | 'bungalow' | 'row-house'
  unitNumber: string
  floor?: number
  status: 'occupied' | 'empty' | 'rented' | 'maintenance'
  residentId?: string
  rentalInfo?: {
    tenantName?: string
    tenantPhone?: string
    moveInDate?: string
    leaseExpiry?: string
    ownerName: string
    ownerPhone: string
    ownerEmail?: string
  }
  propertyValues?: {
    purchasePrice?: number
    currentValue?: number
    totalArea?: number
    bedroomCount?: number
    bathroomCount?: number
  }
  residents?: Array<{ id: string; name: string }>
  vehicles?: Array<{ id: string; registration: string }>
  createdAt: Date
  updatedAt: Date
}

// Property Assignment - tracks owner/tenant relationships over time
export interface PropertyAssignment {
  id: string
  unitId: string                       // Link to Unit (Property)
  residentId: string                   // Link to Resident
  role: 'owner' | 'tenant' | 'co-owner' | 'caretaker'
  startDate: Date                      // When assigned
  endDate?: Date                       // When assignment ended (null = current)
  status: 'active' | 'completed' | 'transferred'
  leaseAgreementId?: string            // Link to document
  assignmentReason?: 'purchase' | 'rental' | 'inheritance' | 'transfer' | 'new-lease'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Extended Rental with proper structure
export interface Rental {
  id: string
  unitId: string
  societyId: string
  residentName: string
  residentPhone: string
  residentEmail?: string
  ownerName: string
  ownerPhone: string
  ownerEmail?: string
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Property Payment Record - linked to unit, not individual
export interface PropertyPayment {
  id: string
  unitId: string                       // Link to Unit (Property)
  residentId?: string                  // Who paid (for receipt)
  societyId: string
  amount: number
  paymentType: 'rent' | 'maintenance' | 'tax' | 'other'
  dueDate: Date
  paidDate?: Date
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod?: 'cash' | 'upi' | 'bank-transfer' | 'cheque' | 'online'
  transactionId?: string
  notes?: string
  month?: Date                         // For which month (rent)
  createdAt: Date
  updatedAt: Date
}

// Property Maintenance - linked to unit, not individual
export interface PropertyMaintenance {
  id: string
  unitId: string                       // Link to Unit (Property)
  societyId: string
  reportedBy?: string                  // Resident ID who reported
  category: 'plumbing' | 'electrical' | 'carpentry' | 'landscaping' | 'common-area' | 'other'
  description: string
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  estimatedCost?: number
  actualCost?: number
  assignedTo?: string                  // Vendor/Worker ID
  startDate?: Date
  completionDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Property History View - for timeline/audit
export interface PropertyHistoryEntry {
  id: string
  unitId: string
  type: 'owner-change' | 'tenant-change' | 'maintenance' | 'payment' | 'document-upload' | 'status-change'
  title: string
  description: string
  relatedResidentId?: string
  relatedResidentName?: string
  timestamp: Date
  changedBy?: string                   // Admin/system who made change
}

export interface Watchman {
  id: string
  name: string
  phone: string
  societyId: string
  shift: 'morning' | 'evening' | 'night'
  createdAt: Date
}

export interface Visitor {
  id: string
  name: string
  phone: string
  purpose: string
  societyId: string
  residentId?: string
  checkInTime: Date
  checkOutTime?: Date
  status: 'checked-in' | 'checked-out'
}

export interface ActivityLog {
  id: string
  type: 'visitor-check-in' | 'visitor-check-out' | 'society-created' | 'society-edited' | 'society-deleted' | 'society-paused' | 'society-resumed' | 'admin-invited' | 'admin-added' | 'admin-removed' | 'resident-added' | 'resident-removed' | 'watchman-added' | 'watchman-removed'
  description: string
  timestamp: Date
  societyId?: string
  userId?: string
  actionBy?: string
  actionByRole?: Role
}

export interface AdminInvitation {
  id: string
  name: string
  email: string
  phone: string
  societyId: string
  status: 'pending' | 'accepted' | 'rejected'
  sentAt: Date
  expiresAt: Date
  invitedBy: string
}

export interface DashboardMetrics {
  totalVisitors: number
  todayCheckIns: number
  activeVisitors: number
  totalSocieties: number
  activeSocieties: number
  pausedSocieties: number
  totalAdmins: number
  totalResidents: number
  totalWatchmen: number
  totalUnits: number
  villaCount: number
  bungalowCount: number
  flatCount: number
  averageVisitorsPerDay: number
}

export interface Alert {
  id: string
  type: 'visitor-threshold' | 'unusual-activity' | 'security' | 'capacity' | 'admin-inactivity' | 'system'
  severity: 'critical' | 'warning' | 'info'
  state: 'new' | 'investigating' | 'resolved'
  message: string
  description: string
  societyId?: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AlertThreshold {
  id: string
  type: 'visitor-per-hour' | 'occupancy-rate' | 'admin-inactivity-days' | 'failed-verifications'
  value: number
  enabled: boolean
  notificationMethod: 'email' | 'in-app' | 'both'
}

export interface Announcement {
  id: string
  societyId: string
  title: string
  description: string
  type: 'general' | 'emergency' | 'maintenance' | 'event'
  createdBy: string
  createdAt: Date
  scheduledFor?: Date
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  priority: 'low' | 'medium' | 'high'
}

export interface MaintenanceTicket {
  id: string
  societyId: string
  unitId?: string
  category: 'plumbing' | 'electrical' | 'carpentry' | 'landscaping' | 'common-area' | 'other'
  description: string
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  assignedTo?: string
  estimatedDays?: number
}
