# Production Backend Implementation Roadmap

## Overview

This roadmap shows the exact order to implement features so that frontend and backend sync properly. Each step builds on the previous one.

---

## Phase 1: Foundation (Days 1-2)

### 1.1: Extend Database Types

**File:** `lib/types.ts` (extend existing file)

Add new interfaces:

```typescript
// Properties/Apartments
export interface Property {
  id: string
  society_id: string
  unit_number: string
  building: string
  floor: number
  property_type: 'villa' | 'bungalow' | 'flat'
  owner_id: string | null
  status: 'occupied' | 'vacant' | 'for_sale' | 'for_rent'
  area_sqft: number | null
  created_at: string
  updated_at: string
}

// Maintenance Bills
export interface MaintenanceBill {
  id: string
  society_id: string
  property_id: string
  resident_id: string
  amount: number
  month_year: string
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  breakdown: {
    maintenance: number
    water: number
    electricity: number
    parking: number
    other: number
  }
  paid_date: string | null
  paid_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Complaints/Issues
export interface Complaint {
  id: string
  society_id: string
  resident_id: string
  property_id: string
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'cleaning' | 'structural' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  photos: string[]
  assigned_to: string | null
  notes: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

// Visitor Logs
export interface VisitorLog {
  id: string
  society_id: string
  resident_id: string
  property_id: string
  visitor_name: string
  visitor_phone: string | null
  purpose: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'auto_approved'
  is_recurring: boolean
  recurring_schedule: string | null
  vehicle_number: string | null
  vehicle_type: string | null
  id_proof_photo: string | null
  visitor_photo: string | null
  approved_by: string | null
  approved_time_window: { start: string; end: string } | null
  actual_checkin: string | null
  actual_checkout: string | null
  watchman_id: string | null
  notes: string | null
  flagged: boolean
  flag_reason: string | null
  created_at: string
  updated_at: string
}

// Announcements
export interface Announcement {
  id: string
  society_id: string
  title: string
  content: string
  created_by: string
  created_at: string
  expires_at: string | null
  is_urgent: boolean
  category: 'general' | 'maintenance' | 'event' | 'alert' | 'emergency'
  read_by: string[]
}
```

### 1.2: Extend Validation Rules

**File:** `lib/validation.ts` (extend existing file)

Add validators for new entities:

```typescript
// Property validation
export function validatePropertyInput(data: any): Omit<Property, 'id' | 'created_at' | 'updated_at'> {
  if (!data.unit_number?.trim()) {
    throw new ValidationError('Unit number is required')
  }
  if (!data.building?.trim()) {
    throw new ValidationError('Building name is required')
  }
  if (!data.property_type || !['villa', 'bungalow', 'flat'].includes(data.property_type)) {
    throw new ValidationError('Invalid property type')
  }
  if (!Number.isInteger(data.floor) || data.floor < 0) {
    throw new ValidationError('Floor must be a non-negative integer')
  }

  return {
    society_id: data.society_id,
    unit_number: data.unit_number.trim(),
    building: data.building.trim(),
    floor: data.floor,
    property_type: data.property_type,
    owner_id: data.owner_id || null,
    status: data.status || 'vacant',
    area_sqft: data.area_sqft || null,
  }
}

// Bill validation
export function validateBillInput(data: any): Omit<MaintenanceBill, 'id' | 'created_at' | 'updated_at'> {
  if (!data.property_id?.trim()) {
    throw new ValidationError('Property ID is required')
  }
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    throw new ValidationError('Amount must be a positive number')
  }
  if (!data.month_year || !/^\d{4}-\d{2}$/.test(data.month_year)) {
    throw new ValidationError('Month year must be in YYYY-MM format')
  }

  return {
    society_id: data.society_id,
    property_id: data.property_id,
    resident_id: data.resident_id,
    amount: data.amount,
    month_year: data.month_year,
    due_date: data.due_date,
    status: 'pending',
    breakdown: data.breakdown || {},
    paid_date: null,
    paid_amount: null,
    notes: data.notes || null,
  }
}

// Complaint validation
export function validateComplaintInput(data: any): Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'resolved_at'> {
  if (!data.title?.trim()) {
    throw new ValidationError('Title is required')
  }
  if (!data.description?.trim()) {
    throw new ValidationError('Description is required')
  }
  if (!['plumbing', 'electrical', 'cleaning', 'structural', 'other'].includes(data.category)) {
    throw new ValidationError('Invalid category')
  }

  return {
    society_id: data.society_id,
    resident_id: data.resident_id,
    property_id: data.property_id,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    severity: data.severity || 'medium',
    status: 'open',
    photos: data.photos || [],
    assigned_to: data.assigned_to || null,
    notes: data.notes || null,
    resolution_notes: null,
  }
}

// Visitor log validation
export function validateVisitorLogInput(data: any): Omit<VisitorLog, 'id' | 'created_at' | 'updated_at'> {
  if (!data.visitor_name?.trim()) {
    throw new ValidationError('Visitor name is required')
  }
  if (!data.purpose?.trim()) {
    throw new ValidationError('Purpose of visit is required')
  }

  return {
    society_id: data.society_id,
    resident_id: data.resident_id,
    property_id: data.property_id,
    visitor_name: data.visitor_name.trim(),
    visitor_phone: data.visitor_phone || null,
    purpose: data.purpose.trim(),
    approval_status: 'pending',
    is_recurring: data.is_recurring || false,
    recurring_schedule: data.recurring_schedule || null,
    vehicle_number: data.vehicle_number || null,
    vehicle_type: data.vehicle_type || null,
    id_proof_photo: data.id_proof_photo || null,
    visitor_photo: data.visitor_photo || null,
    approved_by: null,
    approved_time_window: data.approved_time_window || null,
    actual_checkin: null,
    actual_checkout: null,
    watchman_id: null,
    notes: data.notes || null,
    flagged: false,
    flag_reason: null,
  }
}
```

### 1.3: Extend Database Layer

**File:** `lib/db.ts` (extend existing file)

Add methods for new entities:

```typescript
// PROPERTIES
async createProperty(data: any) {
  const result = await query<Property>('POST', 'properties', { insert: data })
  return result[0]
}

async getPropertiesBySociety(societyId: string) {
  return query<Property>('GET', 'properties', { filters: { society_id: societyId } })
}

async getPropertyById(id: string) {
  const result = await query<Property>('GET', 'properties', { filters: { id } })
  return result[0] || null
}

async updateProperty(id: string, data: Partial<Property>) {
  const result = await query<Property>('PATCH', 'properties', { 
    filters: { id },
    update: data 
  })
  return result[0]
}

// MAINTENANCE BILLS
async createBill(data: any) {
  const result = await query<MaintenanceBill>('POST', 'maintenance_bills', { insert: data })
  return result[0]
}

async getBillsByResident(residentId: string) {
  return query<MaintenanceBill>('GET', 'maintenance_bills', { 
    filters: { resident_id: residentId } 
  })
}

async getBillsBySociety(societyId: string) {
  return query<MaintenanceBill>('GET', 'maintenance_bills', { 
    filters: { society_id: societyId } 
  })
}

async updateBill(id: string, data: Partial<MaintenanceBill>) {
  const result = await query<MaintenanceBill>('PATCH', 'maintenance_bills', { 
    filters: { id },
    update: data 
  })
  return result[0]
}

// COMPLAINTS
async createComplaint(data: any) {
  const result = await query<Complaint>('POST', 'complaints', { insert: data })
  return result[0]
}

async getComplaintsByResident(residentId: string) {
  return query<Complaint>('GET', 'complaints', { 
    filters: { resident_id: residentId } 
  })
}

async getComplaintsBySociety(societyId: string) {
  return query<Complaint>('GET', 'complaints', { 
    filters: { society_id: societyId } 
  })
}

async updateComplaint(id: string, data: Partial<Complaint>) {
  const result = await query<Complaint>('PATCH', 'complaints', { 
    filters: { id },
    update: data 
  })
  return result[0]
}

// VISITOR LOGS
async createVisitorLog(data: any) {
  const result = await query<VisitorLog>('POST', 'visitor_logs', { insert: data })
  return result[0]
}

async getVisitorLogsByResident(residentId: string) {
  return query<VisitorLog>('GET', 'visitor_logs', { 
    filters: { resident_id: residentId } 
  })
}

async getVisitorLogsBySociety(societyId: string) {
  return query<VisitorLog>('GET', 'visitor_logs', { 
    filters: { society_id: societyId } 
  })
}

async updateVisitorLog(id: string, data: Partial<VisitorLog>) {
  const result = await query<VisitorLog>('PATCH', 'visitor_logs', { 
    filters: { id },
    update: data 
  })
  return result[0]
}
```

---

## Phase 2: Core API Routes (Days 3-4)

### 2.1: Create Properties API

**File:** `app/api/properties/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { db, DatabaseError } from '@/lib/db'
import { validatePropertyInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId || userType !== 'admin') {
      return response.error('Only admins can create properties', 403)
    }

    const validated = validatePropertyInput(body)

    const property = {
      id: uuidv4(),
      society_id: societyId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await db.createProperty(property)
    return response.created(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.error(error.message, 400)
    }
    if (error instanceof DatabaseError) {
      return response.error(error.message, error.statusCode)
    }
    console.error('[API] Error:', error)
    return response.serverError()
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    const properties = await db.getPropertiesBySociety(societyId)
    return response.success(properties)
  } catch (error) {
    console.error('[API] Error:', error)
    return response.serverError()
  }
}
```

### 2.2: Create Maintenance Bills API

**File:** `app/api/maintenance-bills/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { db, DatabaseError } from '@/lib/db'
import { validateBillInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId || userType !== 'admin') {
      return response.error('Only admins can create bills', 403)
    }

    const validated = validateBillInput(body)

    const bill = {
      id: uuidv4(),
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await db.createBill(bill)
    return response.created(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.error(error.message, 400)
    }
    if (error instanceof DatabaseError) {
      return response.error(error.message, error.statusCode)
    }
    console.error('[API] Error:', error)
    return response.serverError()
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const societyId = request.headers.get('x-society-id')
    const residentId = request.nextUrl.searchParams.get('resident_id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    let bills

    // Resident can only see their own bills
    if (userType === 'resident') {
      if (residentId !== userId) {
        return response.error('Unauthorized', 403)
      }
      bills = await db.getBillsByResident(userId)
    } else {
      // Admin sees all bills for their society
      bills = await db.getBillsBySociety(societyId)
    }

    return response.success(bills)
  } catch (error) {
    console.error('[API] Error:', error)
    return response.serverError()
  }
}
```

### 2.3: Create Complaints API

**File:** `app/api/complaints/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { db, DatabaseError } from '@/lib/db'
import { validateComplaintInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    const validated = validateComplaintInput(body)

    const complaint = {
      id: uuidv4(),
      resident_id: userId, // Logged-in user submitting
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
    }

    const result = await db.createComplaint(complaint)
    return response.created(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.error(error.message, 400)
    }
    if (error instanceof DatabaseError) {
      return response.error(error.message, error.statusCode)
    }
    console.error('[API] Error:', error)
    return response.serverError()
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const societyId = request.headers.get('x-society-id')
    const residentId = request.nextUrl.searchParams.get('resident_id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    let complaints

    if (userType === 'resident') {
      if (residentId !== userId) {
        return response.error('Unauthorized', 403)
      }
      complaints = await db.getComplaintsByResident(userId)
    } else {
      complaints = await db.getComplaintsBySociety(societyId)
    }

    return response.success(complaints)
  } catch (error) {
    console.error('[API] Error:', error)
    return response.serverError()
  }
}
```

### 2.4: Create Visitor Logs API

**File:** `app/api/visitor-logs/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { db, DatabaseError } from '@/lib/db'
import { validateVisitorLogInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id')
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    const validated = validateVisitorLogInput(body)

    const visitorLog = {
      id: uuidv4(),
      resident_id: userId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await db.createVisitorLog(visitorLog)
    return response.created(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return response.error(error.message, 400)
    }
    if (error instanceof DatabaseError) {
      return response.error(error.message, error.statusCode)
    }
    console.error('[API] Error:', error)
    return response.serverError()
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const societyId = request.headers.get('x-society-id')
    const residentId = request.nextUrl.searchParams.get('resident_id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    let logs

    if (userType === 'resident') {
      if (residentId !== userId) {
        return response.error('Unauthorized', 403)
      }
      logs = await db.getVisitorLogsByResident(userId)
    } else {
      // Admin/Watchman sees all for society
      logs = await db.getVisitorLogsBySociety(societyId)
    }

    return response.success(logs)
  } catch (error) {
    console.error('[API] Error:', error)
    return response.serverError()
  }
}
```

---

## Phase 3: Frontend Hooks (Days 5-6)

### 3.1: Generic API Hook

**File:** `hooks/useApi.ts`

```typescript
import { useState, useEffect } from 'react'

export function useApi<T>(
  url: string,
  options: { autoFetch?: boolean; dependencies?: any[] } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await window.fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-society-id': localStorage.getItem('societyId') || '',
          'x-user-type': localStorage.getItem('userType') || '',
        },
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Request failed')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch !== false && url) {
      fetch()
    }
  }, options.dependencies || [url])

  return { data, error, loading, refetch: fetch }
}
```

### 3.2: Domain-Specific Hooks

**File:** `hooks/useProperties.ts`

```typescript
import { useApi } from './useApi'
import { Property } from '@/lib/types'

export function useProperties(societyId: string) {
  return useApi<Property[]>(
    societyId ? `/api/properties?society_id=${societyId}` : '',
    { dependencies: [societyId] }
  )
}
```

**File:** `hooks/useBills.ts`

```typescript
import { useApi } from './useApi'
import { MaintenanceBill } from '@/lib/types'

export function useBills(societyId: string) {
  return useApi<MaintenanceBill[]>(
    societyId ? `/api/maintenance-bills?society_id=${societyId}` : '',
    { dependencies: [societyId] }
  )
}

export function useMyBills(residentId: string) {
  return useApi<MaintenanceBill[]>(
    residentId ? `/api/maintenance-bills?resident_id=${residentId}` : '',
    { dependencies: [residentId] }
  )
}
```

**File:** `hooks/useComplaints.ts`

```typescript
import { useApi } from './useApi'
import { Complaint } from '@/lib/types'

export function useComplaints(societyId: string) {
  return useApi<Complaint[]>(
    societyId ? `/api/complaints?society_id=${societyId}` : '',
    { dependencies: [societyId] }
  )
}

export function useMyComplaints(residentId: string) {
  return useApi<Complaint[]>(
    residentId ? `/api/complaints?resident_id=${residentId}` : '',
    { dependencies: [residentId] }
  )
}
```

**File:** `hooks/useVisitors.ts`

```typescript
import { useApi } from './useApi'
import { VisitorLog } from '@/lib/types'

export function useVisitors(societyId: string) {
  return useApi<VisitorLog[]>(
    societyId ? `/api/visitor-logs?society_id=${societyId}` : '',
    { dependencies: [societyId] }
  )
}

export function useMyVisitors(residentId: string) {
  return useApi<VisitorLog[]>(
    residentId ? `/api/visitor-logs?resident_id=${residentId}` : '',
    { dependencies: [residentId] }
  )
}
```

---

## Phase 4: Dashboard Integration (Days 7-8)

### 4.1: Refactor Resident Dashboard

**File:** `app/resident-dashboard/page.tsx` (updated)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useMyBills, useMyComplaints, useMyVisitors } from '@/hooks'

export default function ResidentDashboardPage() {
  const [residentId, setResidentId] = useState('')

  // Fetch all data at once
  const { data: bills, loading: billsLoading, error: billsError } = useMyBills(residentId)
  const { data: complaints, loading: complaintsLoading } = useMyComplaints(residentId)
  const { data: visitors, loading: visitorsLoading } = useMyVisitors(residentId)

  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (id) setResidentId(id)
  }, [])

  if (!residentId) {
    return <div>Loading...</div>
  }

  if (billsLoading || complaintsLoading || visitorsLoading) {
    return <div className="p-8">Loading your data...</div>
  }

  if (billsError) {
    return <div className="p-8 text-red-600">Error: {billsError}</div>
  }

  return (
    <div className="p-8 space-y-8">
      <BillsSection bills={bills} />
      <ComplaintsSection complaints={complaints} />
      <VisitorsSection visitors={visitors} />
    </div>
  )
}

function BillsSection({ bills }: { bills: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Bills</h2>
      {bills?.length === 0 ? (
        <p>No bills</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Month</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} className="border-t">
                <td className="p-2">{bill.month_year}</td>
                <td className="p-2">₹{bill.amount}</td>
                <td className="p-2">{bill.status}</td>
                <td className="p-2">{bill.due_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ComplaintsSection({ complaints }: { complaints: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Complaints</h2>
      {complaints?.length === 0 ? (
        <p>No complaints</p>
      ) : (
        <div className="space-y-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="border p-4 rounded">
              <h3 className="font-bold">{complaint.title}</h3>
              <p className="text-sm text-gray-600">{complaint.description}</p>
              <p className="text-sm mt-2">Status: {complaint.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VisitorsSection({ visitors }: { visitors: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Visitor Requests</h2>
      {visitors?.length === 0 ? (
        <p>No visitors</p>
      ) : (
        <div className="space-y-4">
          {visitors.map(visitor => (
            <div key={visitor.id} className="border p-4 rounded">
              <h3 className="font-bold">{visitor.visitor_name}</h3>
              <p className="text-sm">Purpose: {visitor.purpose}</p>
              <p className="text-sm">Status: {visitor.approval_status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Checklist for Implementation

### Phase 1: Types & Validation (Day 1)
- [ ] Extend `lib/types.ts` with Property, Bill, Complaint, VisitorLog, Announcement
- [ ] Extend `lib/validation.ts` with validators
- [ ] Extend `lib/db.ts` with methods

### Phase 2: APIs (Days 2-3)
- [ ] Create `/api/properties/route.ts`
- [ ] Create `/api/maintenance-bills/route.ts`
- [ ] Create `/api/complaints/route.ts`
- [ ] Create `/api/visitor-logs/route.ts`
- [ ] Test each endpoint with Postman/curl

### Phase 3: Frontend Hooks (Day 4)
- [ ] Create `hooks/useApi.ts`
- [ ] Create `hooks/useProperties.ts`
- [ ] Create `hooks/useBills.ts`
- [ ] Create `hooks/useComplaints.ts`
- [ ] Create `hooks/useVisitors.ts`

### Phase 4: Integration (Days 5-6)
- [ ] Update Resident Dashboard to use hooks
- [ ] Update Society Admin Dashboard
- [ ] Update Watchman Dashboard
- [ ] Test end-to-end data flow

### Phase 5: Enhancement (Days 7+)
- [ ] Add update endpoints (PUT)
- [ ] Add delete endpoints (DELETE)
- [ ] Add announcements API
- [ ] Add real-time updates

---

## Testing Strategy

### Unit Testing
- Validate each API route works
- Test authentication/authorization
- Test validation rules

### Integration Testing
- Create data via API, verify in frontend
- Update data, verify changes propagate
- Delete data, verify removal

### E2E Testing
- User logs in → sees dashboard → creates data → sees updated UI
