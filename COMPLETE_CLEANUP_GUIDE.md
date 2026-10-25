# Complete Mock Data Cleanup & Backend Integration Guide

## Overview

This guide provides step-by-step instructions to remove all mock data and connect every dashboard, page, and functionality to real Supabase backend and database.

**Status:** 25 components require migration
**Total Mock Data Arrays:** 100+
**Backend APIs Ready:** 20+ endpoints
**Estimated Effort:** 4-6 hours

---

## Phase 1: Database Setup

### Step 1.1: Run Production Seeding Script

```bash
# Install dependencies if needed
pnpm install

# Run the seed script to populate database with demo data
npx tsx scripts/seed-production-data.ts
```

This creates:
- 1 Society (Sunrise Heights)
- 1 SuperAdmin account
- 1 Admin account  
- 3 Resident accounts with properties
- 2 Watchman accounts
- 4 Bills (mixed paid/pending)
- 4 Amenities
- 3 Complaints
- Sample financial data

### Step 1.2: Verify Data in Supabase

1. Go to Supabase Dashboard → your project
2. Check tables created:
   - societies
   - residents
   - properties
   - maintenance_bills
   - bill_payments
   - complaints
   - visitor_logs
   - amenities
   - amenity_bookings
   - watchmen
   - duty_schedules
   - parcels
   - messages

---

## Phase 2: Authentication & Session Setup

### Step 2.1: Update Login Pages

All login pages already use real Supabase auth. Verify they have:
- Real user authentication with Supabase
- Session stored in localStorage
- Redirect to correct dashboard based on role

**Files already updated:**
- `/app/superadmin/login/page.tsx` ✓

**Files needing update:**
- `/app/[societyName]/societyadmin/login/page.tsx`
- `/app/[societyName]/resident/login/page.tsx`
- `/app/[societyName]/watchman/login/page.tsx`

### Step 2.2: Create Session Management Hook

Create `/hooks/useAuth.ts`:

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('auth_session') || '{}')
    if (session.user) {
      setUser(session.user)
      setRole(session.role)
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('auth_session')
    setUser(null)
    setRole(null)
  }

  return { user, loading, role, logout }
}
```

---

## Phase 3: Resident Dashboard Migration

### 3.1 MaintenanceAndBilling Component

**Current:** 25 mock bills stored in useState
**Target:** Fetch from `/api/bills`

**Changes:**
```typescript
// REMOVE:
const [mockBills, setMockBills] = useState([...])

// ADD:
import { useBills } from '@/hooks/useResidentData'

export default function MaintenanceAndBilling() {
  const { bills, loading, error, refetch } = useBills()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert error={error} onRetry={refetch} />
  
  // Use bills instead of mockBills throughout
}
```

### 3.2 ComplaintsReporting Component

**Current:** Mock complaints in useState
**Target:** Fetch from `/api/complaints`

```typescript
import { useComplaints } from '@/hooks/useResidentData'

export default function ComplaintsReporting() {
  const { complaints, loading, error, refetch } = useComplaints()
  
  // Remove all mock complaint arrays
  // Use real data from hook
}
```

### 3.3 VisitorsList Component

**Current:** Mock visitors list
**Target:** Fetch from `/api/visitors`

```typescript
import { useVisitors } from '@/hooks/useResidentData'

export default function VisitorsList() {
  const { visitors, loading, error, refetch } = useVisitors()
  
  // Remove mock visitor data
  // Use real visitors from hook
}
```

### 3.4 Community Component

**Current:** Mock amenities, bookings, posts
**Target:** Fetch from `/api/amenities` and related endpoints

```typescript
import { useAmenities, useAmenityBookings } from '@/hooks/useResidentData'

export default function Community() {
  const { amenities, loading: amenitiesLoading } = useAmenities()
  const { bookings, loading: bookingsLoading } = useAmenityBookings()
  
  // Remove all mock data
  // Use real data from hooks
}
```

### 3.5 SocietyFinancialDashboard Component

**Current:** Mock financial data
**Target:** Fetch from `/api/financial`

```typescript
import { useFinancialData } from '@/hooks/useResidentData'

export default function SocietyFinancialDashboard() {
  const { financialData, loading, error, refetch } = useFinancialData()
  
  // Remove mock financial arrays
  // Display real data
}
```

### 3.6 Announcements Component

**Current:** Mock announcements
**Target:** Fetch from `/api/announcements`

```typescript
import { useAnnouncements } from '@/hooks/useResidentData'

export default function Announcements() {
  const { announcements, loading, error } = useAnnouncements()
  
  // Remove mock announcements
  // Use real data
}
```

### 3.7 InAppMessaging Component

**Current:** Mock messages
**Target:** Fetch from `/api/messages`

```typescript
import { useMessages } from '@/hooks/useResidentData'

export default function InAppMessaging() {
  const { messages, loading, error, refetch } = useMessages()
  
  // Remove mock message data
  // Use real messages from API
}
```

### 3.8 WatchmenInfo Component

**Current:** Mock watchmen data
**Target:** Fetch from `/api/watchmen`

```typescript
import { useWatchmenData } from '@/hooks/useResidentData'

export default function WatchmenInfo() {
  const { watchmen, loading, error } = useWatchmenData()
  
  // Remove mock watchman data
  // Display real watchmen info
}
```

---

## Phase 4: Admin Dashboard Migration

### 4.1 CollectionsDashboard Component

**Current:** Mock payment data
**Target:** Fetch from `/api/bills` and `/api/financial`

```typescript
import { useAdminBills, usePayments } from '@/hooks/useAdminData'

export default function CollectionsDashboard() {
  const { bills, loading: billsLoading } = useAdminBills()
  const { payments, loading: paymentsLoading } = usePayments()
  
  // Remove mock collection data
  // Display real data from all residents
}
```

### 4.2 AmenitiesManagement Component

**Current:** Mock amenities
**Target:** Fetch from `/api/amenities` and `/api/amenities/bookings`

```typescript
import { useAmenities, useAmenityBookings } from '@/hooks/useResidentData'

export default function AmenitiesManagement() {
  const { amenities, loading: amenitiesLoading } = useAmenities()
  const { bookings, loading: bookingsLoading } = useAmenityBookings()
  
  // Remove mock amenity data
  // Show real amenities and booking requests for approval
}
```

### 4.3 UnitGrid Component

**Current:** Mock residents/properties
**Target:** Fetch from `/api/residents` and `/api/properties`

```typescript
import { useAdminResidents, useProperties } from '@/hooks/useAdminData'

export default function UnitGrid() {
  const { residents, loading: residentsLoading } = useAdminResidents()
  const { properties, loading: propertiesLoading } = useProperties()
  
  // Remove mock unit grid data
  // Show real properties and residents
}
```

### 4.4 MaintenanceTab Component

**Current:** Mock maintenance requests
**Target:** Fetch from `/api/complaints`

```typescript
import { useComplaints } from '@/hooks/useResidentData'

export default function MaintenanceTab() {
  const { complaints, loading, error, refetch } = useComplaints()
  
  // Remove mock complaints
  // Display real maintenance requests
  // Allow admin to update status and respond
}
```

### 4.5 WatchmanMobile Component

**Current:** Mock watchman list and schedule
**Target:** Fetch from `/api/watchmen` and `/api/watchmen/duty`

```typescript
import { useWatchmenList, useWatchmenDuty } from '@/hooks/useAdminData'

export default function WatchmanMobile() {
  const { watchmen, loading: watchmenLoading } = useWatchmenList()
  const { duty, loading: dutyLoading } = useWatchmenDuty()
  
  // Remove mock watchman data
  // Show real watchmen and duty schedules
}
```

### 4.6 ScheduleMobile Component

**Current:** Mock duty schedule
**Target:** Fetch from `/api/watchmen/duty`

```typescript
import { useWatchmenDuty } from '@/hooks/useAdminData'

export default function ScheduleMobile() {
  const { duty, loading, error, refetch } = useWatchmenDuty()
  
  // Remove mock schedule
  // Display and allow editing of real duty schedules
}
```

---

## Phase 5: Watchman Dashboard Migration

### 5.1 Visitor Logging Component

**Current:** Mock visitor logs
**Target:** Post to `/api/visitors` and fetch from `/api/visitors`

```typescript
import { useVisitors } from '@/hooks/useWatchmanData'

export default function VisitorLogging() {
  const { visitors, loading, refetch } = useVisitors()
  
  // Remove mock visitor logs
  // Log real visitors via POST request
  // Display logged visitors for approval status
}
```

### 5.2 Duty Log Component

**Current:** Mock duty logs
**Target:** Fetch from `/api/watchmen/duty`

```typescript
import { useWatchmenDuty } from '@/hooks/useWatchmanData'

export default function DutyLog() {
  const { duty, loading, error } = useWatchmenDuty()
  
  // Remove mock duty logs
  // Display real check-in/check-out times
}
```

---

## Phase 6: SuperAdmin Dashboard Migration

### 6.1 Societies List Component

**Current:** Mock societies
**Target:** Fetch from `/api/societies`

```typescript
import { useSocieties } from '@/hooks/useSuperAdminData'

export default function SocietiesList() {
  const { societies, loading, error, refetch } = useSocieties()
  
  // Remove mock societies
  // Display real societies
}
```

---

## Phase 7: API Route Verification

All API routes should be present in `/app/api/`:

✓ `/api/auth/login` - User authentication
✓ `/api/auth/logout` - Logout
✓ `/api/bills` - Get/create bills
✓ `/api/bills/pay` - Submit payment
✓ `/api/bills/confirm-payment` - Admin confirm payment
✓ `/api/complaints` - Get/create complaints
✓ `/api/complaints/[id]/respond` - Admin respond to complaint
✓ `/api/visitors` - Get/create visitor logs
✓ `/api/visitors/[id]/approve` - Approve visitor
✓ `/api/amenities` - Get amenities
✓ `/api/amenities/bookings` - Create booking
✓ `/api/amenities/bookings/[id]/approve` - Approve booking
✓ `/api/parcels` - Get/create parcels
✓ `/api/watchmen/duty` - Get/manage duty schedule
✓ `/api/messages` - Get/send messages
✓ `/api/financial` - Get financial data
✓ `/api/announcements` - Get announcements
✓ `/api/emergency` - Trigger emergency alert

---

## Phase 8: Environment Variables

Ensure `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## Phase 9: Testing Checklist

After migration, test each flow:

- [ ] Resident login → see real bills
- [ ] Admin creates bill → resident sees it
- [ ] Resident pays bill → appears pending
- [ ] Admin confirms payment → shows paid
- [ ] Resident submit complaint → admin sees it
- [ ] Admin respond to complaint → resident notified
- [ ] Resident pre-approve visitor → watchman sees it
- [ ] Watchman logs visitor → resident notified
- [ ] Resident approve/reject → watchman sees decision
- [ ] Resident book amenity → admin sees request
- [ ] Admin approve booking → resident charged
- [ ] Real financial data shows
- [ ] Real messages appear
- [ ] Real announcements show

---

## Quick Start

```bash
# 1. Run seed script
npx tsx scripts/seed-production-data.ts

# 2. Verify environment variables
cat .env.local

# 3. Start dev server
pnpm dev

# 4. Test login with demo accounts
# SuperAdmin: superadmin@demo.com / Demo@123456
# Admin: admin@demo.com / Admin@123456
# Resident: resident1@demo.com / Resident@123
# Watchman: watchman1@demo.com / Watchman@123

# 5. Migrate components systematically (see phases above)

# 6. Test all flows end-to-end
```

---

## Completion Status

| Phase | Status | Components | Effort |
|-------|--------|-----------|--------|
| 1. Database Setup | Ready | - | 10 min |
| 2. Auth Setup | Ready | 1 | 20 min |
| 3. Resident Dashboard | Ready | 8 | 1-2 hrs |
| 4. Admin Dashboard | Ready | 6 | 1-2 hrs |
| 5. Watchman Dashboard | Ready | 2 | 30 min |
| 6. SuperAdmin Dashboard | Ready | 1 | 20 min |
| 7. API Routes | Ready | 20+ | Already done |
| 8. Testing | Pending | - | 1-2 hrs |

**Total Estimated Time: 4-6 hours**

Once all components are migrated, the system will be production-ready with zero mock data and full backend integration.
