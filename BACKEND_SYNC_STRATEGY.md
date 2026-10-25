# Production Backend Sync Strategy

## The Problem: Current System Lacks Synchronization

### Current State:
```
Frontend (Dashboards)  ←→  Backend (API Routes)  ←→  Database (Supabase)
```

**Issues:**
1. Most dashboards use hardcoded mock data instead of API calls
2. No real-time data fetching from database
3. Frontend state is disconnected from backend
4. No single source of truth
5. No proper error handling between layers
6. Missing critical entities (Properties, Bills, Complaints, Visitor Logs)

### Solution: Three-Tier Synchronization Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  (React Components with Hooks)                                  │
│  - Dashboards                                                   │
│  - Forms                                                        │
│  - Real-time UI                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ API Calls (Fetch/POST/PUT/DELETE)
                       │ Using custom hooks (useAPI)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      API LAYER (Backend)                        │
│  (Next.js Route Handlers)                                       │
│  - Validation                                                   │
│  - Business Logic                                               │
│  - Error Handling                                               │
│  - Database Queries                                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Database Queries (Supabase REST API)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  (Supabase PostgreSQL Tables)                                   │
│  - societies                                                    │
│  - residents, society_admins, watchmen                          │
│  - properties, maintenance_bills                                │
│  - complaints, visitor_logs                                     │
│  - announcements, notifications                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Define Complete Data Models

### A. Core User Types (Already Exists)

```typescript
// Database Table: societies
interface Society {
  id: string (PK)
  name: string
  slug: string (unique)
  address: string
  city: string
  state: string
  phone: string
  contact_person: string
  villas: number
  bungalows: number
  flats: number
  created_at: timestamp
  updated_at: timestamp
}

// Database Table: society_admins
interface SocietyAdmin {
  id: string (PK)
  society_id: string (FK → societies)
  username: string (unique per society)
  password_hash: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  created_at: timestamp
  updated_at: timestamp
}

// Database Table: residents
interface Resident {
  id: string (PK)
  society_id: string (FK → societies)
  username: string (unique per society)
  password_hash: string
  name: string
  email: string
  phone: string
  property_id: string | null (FK → properties)
  unit_number: string | null
  status: 'active' | 'inactive'
  family_size: number | null
  created_at: timestamp
  updated_at: timestamp
}

// Database Table: watchmen
interface Watchman {
  id: string (PK)
  society_id: string (FK → societies)
  username: string (unique per society)
  password_hash: string
  name: string
  email: string
  phone: string
  shift_timing: 'day' | 'night' | 'flexible'
  status: 'active' | 'inactive'
  created_at: timestamp
  updated_at: timestamp
}
```

### B. Missing Entities (Need to Create)

#### Properties/Apartments
```typescript
// Database Table: properties
interface Property {
  id: string (PK)
  society_id: string (FK → societies)
  unit_number: string
  building: string
  floor: number
  property_type: 'villa' | 'bungalow' | 'flat'
  owner_id: string | null (FK → residents, nullable = vacant)
  status: 'occupied' | 'vacant' | 'for_sale' | 'for_rent'
  area_sqft: number | null
  created_at: timestamp
  updated_at: timestamp
}

API Endpoints:
POST   /api/properties              → Create property
GET    /api/properties?society_id=x → List all properties
GET    /api/properties/{id}         → Get property details
PUT    /api/properties/{id}         → Update property
DELETE /api/properties/{id}         → Delete property
```

#### Maintenance Bills
```typescript
// Database Table: maintenance_bills
interface MaintenanceBill {
  id: string (PK)
  society_id: string (FK → societies)
  property_id: string (FK → properties)
  resident_id: string (FK → residents)
  amount: number
  month_year: string (YYYY-MM format)
  due_date: date
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  breakdown: {
    maintenance: number
    water: number
    electricity: number
    parking: number
    other: number
  }
  paid_date: date | null
  paid_amount: number | null
  notes: string | null
  created_at: timestamp
  updated_at: timestamp
}

API Endpoints:
POST   /api/maintenance-bills                    → Create bill
GET    /api/maintenance-bills?society_id=x       → List all (admin)
GET    /api/maintenance-bills?resident_id=x      → List my bills (resident)
GET    /api/maintenance-bills?status=overdue     → Filter by status
PUT    /api/maintenance-bills/{id}               → Update bill (payment)
DELETE /api/maintenance-bills/{id}               → Cancel bill
```

#### Complaints/Issues
```typescript
// Database Table: complaints
interface Complaint {
  id: string (PK)
  society_id: string (FK → societies)
  resident_id: string (FK → residents)
  property_id: string (FK → properties)
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'cleaning' | 'structural' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  photos: string[] (URLs to uploaded photos)
  assigned_to: string | null (admin/contractor ID)
  notes: string | null
  resolution_notes: string | null
  created_at: timestamp
  updated_at: timestamp
  resolved_at: timestamp | null
}

API Endpoints:
POST   /api/complaints                          → Create complaint
GET    /api/complaints?society_id=x             → List all (admin)
GET    /api/complaints?resident_id=x            → List my complaints (resident)
GET    /api/complaints?status=open              → Filter by status
PUT    /api/complaints/{id}                     → Update complaint
DELETE /api/complaints/{id}                     → Delete complaint
```

#### Visitor Logs
```typescript
// Database Table: visitor_logs
interface VisitorLog {
  id: string (PK)
  society_id: string (FK → societies)
  resident_id: string (FK → residents)
  property_id: string (FK → properties)
  visitor_name: string
  visitor_phone: string | null
  purpose: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'auto_approved'
  is_recurring: boolean
  recurring_schedule: string | null (cron: "MON,WED,FRI", "DAILY", etc)
  vehicle_number: string | null
  vehicle_type: string | null
  id_proof_photo: string | null (URL)
  visitor_photo: string | null (URL)
  approved_by: string | null (resident/watchman ID)
  approved_time_window: { start: time, end: time } | null
  actual_checkin: timestamp | null
  actual_checkout: timestamp | null
  watchman_id: string | null (FK → watchmen, who logged entry/exit)
  notes: string | null
  flagged: boolean
  flag_reason: string | null
  created_at: timestamp
  updated_at: timestamp
}

API Endpoints:
POST   /api/visitor-logs                         → Request visitor entry
GET    /api/visitor-logs?society_id=x            → List all (admin/watchman)
GET    /api/visitor-logs?resident_id=x           → List my visitors (resident)
GET    /api/visitor-logs?date=TODAY              → Today's visitors
PUT    /api/visitor-logs/{id}                    → Approve/Reject/Checkin/Checkout
DELETE /api/visitor-logs/{id}                    → Cancel visitor
```

#### Announcements
```typescript
// Database Table: announcements
interface Announcement {
  id: string (PK)
  society_id: string (FK → societies)
  title: string
  content: string
  created_by: string (admin ID)
  created_at: timestamp
  expires_at: timestamp | null
  is_urgent: boolean
  category: 'general' | 'maintenance' | 'event' | 'alert' | 'emergency'
  read_by: string[] (array of resident IDs who read)
}

API Endpoints:
POST   /api/announcements                        → Create announcement
GET    /api/announcements?society_id=x           → List announcements
PUT    /api/announcements/{id}                   → Update announcement
DELETE /api/announcements/{id}                   → Delete announcement
PUT    /api/announcements/{id}/read              → Mark as read
```

---

## Step 2: Implement Complete API Layer

### A. API Response Standard

```typescript
// lib/api-response.ts (already exists, but enhanced)

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
  timestamp: string
  requestId: string // For debugging
}

// Success Response
{
  success: true,
  data: { /* entity data */ },
  statusCode: 200,
  timestamp: "2026-03-15T10:30:00Z",
  requestId: "req_abc123"
}

// Error Response
{
  success: false,
  error: "Validation failed: Email is required",
  statusCode: 400,
  timestamp: "2026-03-15T10:30:00Z",
  requestId: "req_abc123"
}
```

### B. Backend Implementation Pattern

Each API endpoint follows this pattern:

```typescript
// Example: POST /api/properties
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { validatePropertyInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()

    // 2. Get authenticated user info from session/token
    const userId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type') // admin/resident/watchman
    const societyId = request.headers.get('x-society-id')

    if (!userId || !societyId) {
      return response.error('Authentication required', 401)
    }

    // 3. Validate input
    const validated = validatePropertyInput(body)

    // 4. Check authorization (admin only for creating properties)
    if (userType !== 'admin') {
      return response.error('Only admins can create properties', 403)
    }

    // 5. Check business logic (e.g., society exists)
    const society = await db.getSocietyById(societyId)
    if (!society) {
      return response.error('Society not found', 404)
    }

    // 6. Create entity in database
    const property = {
      id: uuidv4(),
      society_id: societyId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const result = await db.createProperty(property)

    // 7. Return success response
    return response.created(result)

  } catch (error) {
    if (error instanceof ValidationError) {
      return response.error(error.message, 400)
    }
    if (error instanceof DatabaseError) {
      return response.error(error.message, error.statusCode)
    }
    console.error('[API] Unexpected error:', error)
    return response.serverError()
  }
}
```

### C. Complete API Endpoint Map

```
AUTHENTICATION (Already Implemented)
POST   /api/auth/admin-login          → Login admin
POST   /api/auth/resident-login       → Login resident
POST   /api/auth/watchman-login       → Login watchman
POST   /api/auth/superadmin-login     → Login super admin

SOCIETIES (Partially Implemented)
POST   /api/societies                 ✅ Implemented
GET    /api/societies                 ✅ Implemented
GET    /api/societies/{id}            ✅ Implemented
PUT    /api/societies/{id}            ❌ Need to implement
DELETE /api/societies/{id}            ❌ Need to implement

USERS (Partially Implemented)
POST   /api/society-admins            ✅ Implemented
GET    /api/society-admins            ❌ Need to implement
GET    /api/residents                 ❌ Need to implement
POST   /api/residents                 ✅ Implemented
GET    /api/watchmen                  ❌ Need to implement
POST   /api/watchmen                  ✅ Implemented

PROPERTIES (NOT Implemented)
POST   /api/properties                ❌ Build
GET    /api/properties                ❌ Build
GET    /api/properties/{id}           ❌ Build
PUT    /api/properties/{id}           ❌ Build
DELETE /api/properties/{id}           ❌ Build

MAINTENANCE BILLS (NOT Implemented)
POST   /api/maintenance-bills         ❌ Build
GET    /api/maintenance-bills         ❌ Build
GET    /api/maintenance-bills/{id}    ❌ Build
PUT    /api/maintenance-bills/{id}    ❌ Build
DELETE /api/maintenance-bills/{id}    ❌ Build

COMPLAINTS (NOT Implemented)
POST   /api/complaints                ❌ Build
GET    /api/complaints                ❌ Build
GET    /api/complaints/{id}           ❌ Build
PUT    /api/complaints/{id}           ❌ Build
DELETE /api/complaints/{id}           ❌ Build

VISITOR LOGS (NOT Implemented)
POST   /api/visitor-logs              ❌ Build
GET    /api/visitor-logs              ❌ Build
GET    /api/visitor-logs/{id}         ❌ Build
PUT    /api/visitor-logs/{id}         ❌ Build
DELETE /api/visitor-logs/{id}         ❌ Build

ANNOUNCEMENTS (NOT Implemented)
POST   /api/announcements             ❌ Build
GET    /api/announcements             ❌ Build
PUT    /api/announcements/{id}        ❌ Build
DELETE /api/announcements/{id}        ❌ Build
```

---

## Step 3: Frontend Integration Layer

### A. Custom Hook Pattern for Data Fetching

```typescript
// hooks/useApi.ts - Generic API hook
import { useState, useEffect } from 'react'

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  dependencies?: any[]
  autoFetch?: boolean
}

export function useApi<T>(url: string, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || '',
          'x-society-id': localStorage.getItem('societyId') || '',
          'x-user-type': localStorage.getItem('userType') || '',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetch()
    }
  }, options.dependencies || [])

  return { data, error, loading, refetch: fetch }
}
```

### B. Domain-Specific Hooks

```typescript
// hooks/useProperties.ts
export function useProperties(societyId: string) {
  return useApi(`/api/properties?society_id=${societyId}`)
}

// hooks/useBills.ts
export function useMyBills(residentId: string) {
  return useApi(`/api/maintenance-bills?resident_id=${residentId}`)
}

// hooks/useComplaints.ts
export function useMyComplaints(residentId: string) {
  return useApi(`/api/complaints?resident_id=${residentId}`)
}

// hooks/useVisitors.ts
export function useMyVisitors(residentId: string) {
  return useApi(`/api/visitor-logs?resident_id=${residentId}`)
}

// hooks/useAnnouncements.ts
export function useAnnouncements(societyId: string) {
  return useApi(`/api/announcements?society_id=${societyId}`)
}
```

### C. Updated Dashboard Component Pattern

```typescript
// app/resident-dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useMyBills, useMyComplaints, useMyVisitors } from '@/hooks'

export default function ResidentDashboardPage() {
  const [residentId, setResidentId] = useState('')
  
  // Fetch all required data
  const { data: bills, loading: billsLoading, error: billsError } = useMyBills(residentId)
  const { data: complaints, loading: complaintsLoading } = useMyComplaints(residentId)
  const { data: visitors, loading: visitorsLoading } = useMyVisitors(residentId)

  // Get from session/localStorage after login
  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (id) setResidentId(id)
  }, [])

  if (billsLoading || complaintsLoading || visitorsLoading) {
    return <div>Loading...</div>
  }

  if (billsError) {
    return <div>Error: {billsError}</div>
  }

  return (
    <div>
      <BillsSection bills={bills} />
      <ComplaintsSection complaints={complaints} />
      <VisitorsSection visitors={visitors} />
    </div>
  )
}
```

---

## Step 4: Database Synchronization Pattern

### A. Data Flow: Create New Bill

```
Admin Dashboard
    ↓ (clicks: Generate Bills for March)
    ↓
Form: Select month, amount, breakdown
    ↓
POST /api/maintenance-bills
    ├─ Body: { society_id, property_id, month_year, amount, breakdown }
    ├─ Headers: { x-user-id, x-user-type: 'admin', x-society-id }
    ↓
Backend Route Handler (/api/maintenance-bills/route.ts)
    ├─ Validate input
    ├─ Check: User is admin
    ├─ Check: Society exists
    ├─ Check: Property exists in this society
    ├─ Insert into maintenance_bills table
    ↓
Database (Supabase)
    └─ NEW ROW: bills table
        {
          id: uuid,
          society_id: xxx,
          property_id: yyy,
          resident_id: zzz,
          amount: 6000,
          month_year: "2026-03",
          status: "pending",
          due_date: "2026-03-31",
          created_at: now
        }
    ↓
Response to Frontend
    {
      success: true,
      data: { /* created bill object */ }
    }
    ↓
Admin Dashboard
    ├─ Show success toast: "Bill created"
    ├─ Add new bill to UI
    ├─ OR call refetch() to reload bills from API
    ↓
Resident Receives Notification
    ├─ Push notification: "New bill: ₹6000 due by March 31"
    ├─ Resident Dashboard: useMyBills() hook automatically fetches updated data
    ├─ Bills table shows new bill
    ↓
Resident Pays Bill
    ├─ Clicks: Pay ₹6000
    ├─ Redirected to payment gateway (Stripe/Razorpay)
    ├─ After payment confirmed:
    ↓
POST /api/maintenance-bills/{bill_id}
    └─ Body: { status: "paid", paid_date: now, paid_amount: 6000 }
    ↓
Database Updated
    └─ bills table: status changed to "paid"
    ↓
Admin Dashboard
    ├─ Real-time dashboard shows: Payment received for bill
    ├─ Resident name added to "Paid" list
    ↓
Both Dashboards
    └─ Call refetch() to show updated data
```

### B. Real-Time Sync Challenge & Solution

**Problem:** Frontend doesn't know when data in database changed

**Solutions (in order of preference):**

1. **Polling** (Simple, works everywhere)
```typescript
// Refresh data every 30 seconds
useEffect(() => {
  const interval = setInterval(refetch, 30000)
  return () => clearInterval(interval)
}, [])
```

2. **WebSocket** (Real-time, requires server setup)
```typescript
// When bill is created, server broadcasts to all connected admins/residents
const ws = new WebSocket('ws://localhost:3000/api/notifications')
ws.on('bill:created', (bill) => {
  updateBillsUI(bill)
})
```

3. **Server-Sent Events** (Real-time, easier than WebSocket)
```typescript
const eventSource = new EventSource('/api/notifications')
eventSource.on('bill:created', (event) => {
  updateBillsUI(JSON.parse(event.data))
})
```

4. **Manual Refetch** (User-driven)
```typescript
// User clicks "Refresh" button
<button onClick={() => refetch()}>Refresh Data</button>
```

---

## Step 5: Authentication & Session Management

### A. Login Flow

```
Resident enters: username, password
    ↓
POST /api/auth/resident-login
    ├─ Validate credentials
    ├─ Query residents table
    ├─ Hash password, compare
    ├─ Generate JWT token (optional)
    ↓
Response:
{
  success: true,
  data: {
    id: "resident_123",
    name: "Rajesh Kumar",
    society_id: "soc_001",
    property_id: "prop_001",
    email: "rajesh@example.com",
    token: "eyJhbGc..." // optional JWT
  }
}
    ↓
Frontend stores:
    localStorage.setItem('userId', 'resident_123')
    localStorage.setItem('societyId', 'soc_001')
    localStorage.setItem('userType', 'resident')
    localStorage.setItem('token', 'eyJhbGc...')
    ↓
All subsequent API calls include headers:
    x-user-id: resident_123
    x-society-id: soc_001
    x-user-type: resident
    Authorization: Bearer eyJhbGc...
```

### B. Authorization Pattern

```typescript
// Backend: Check user has permission
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  const userType = request.headers.get('x-user-type')
  const societyId = request.headers.get('x-society-id')

  // Check: Resident can only access their own data
  if (userType === 'resident') {
    const queryResidentId = request.nextUrl.searchParams.get('resident_id')
    if (queryResidentId !== userId) {
      return response.error('Unauthorized', 403)
    }
  }

  // Check: Admin can access their society's data
  if (userType === 'admin') {
    const querySocietyId = request.nextUrl.searchParams.get('society_id')
    if (querySocietyId !== societyId) {
      return response.error('Unauthorized', 403)
    }
  }

  // Proceed with query
}
```

---

## Implementation Priority

### Phase 1: Critical (Week 1)
- ✅ Societies CRUD (already done)
- ✅ Users CRUD (already done)
- ✅ Authentication (already done)
- ❌ Properties CRUD (NEW - needed by all dashboards)
- ❌ GET endpoints for listing data

### Phase 2: Important (Week 2)
- ❌ Maintenance Bills CRUD
- ❌ Complaints CRUD
- ❌ Visitor Logs CRUD
- ❌ Frontend integration with hooks

### Phase 3: Enhancement (Week 3)
- ❌ Announcements CRUD
- ❌ Real-time notifications
- ❌ Advanced filtering/search
- ❌ Analytics endpoints

### Phase 4: Polish (Week 4)
- ❌ File uploads (photos for complaints/visitors)
- ❌ Payment integration
- ❌ Reporting/exports
- ❌ Performance optimization

---

## Summary: How Everything Will Sync

```
┌─────────────────────────────────────────────────┐
│         RESIDENT DASHBOARD                      │
│  • Fetches data via useMyBills(), useMyComplaints()
│  • User sees: Bills, Complaints, Visitors, Announcements
│  • User can: Pay bills, Submit complaints, Invite visitors
└──────────────┬──────────────────────────────────┘
               │ Calls API endpoints
               │
┌──────────────▼──────────────────────────────────┐
│         API ROUTES (/api/...)                   │
│  • Validate user (admin/resident/watchman)      │
│  • Check authorization (own data or society)    │
│  • Query Supabase database                      │
│  • Return JSON response                         │
└──────────────┬──────────────────────────────────┘
               │ Database queries
               │
┌──────────────▼──────────────────────────────────┐
│    SUPABASE DATABASE                            │
│  • Tables: residents, maintenance_bills, etc    │
│  • Single source of truth                       │
│  • All changes persisted                        │
└─────────────────────────────────────────────────┘
```

**Key Principle:** Frontend is DUMB (just displays what API returns)
API is SMART (validates, checks permissions, queries DB)
Database is PERSISTENT (single source of truth)
