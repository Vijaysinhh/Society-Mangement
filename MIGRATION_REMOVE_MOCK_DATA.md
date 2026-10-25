# Migration Guide: Remove All Mock Data & Connect to Real Backend

This guide provides the exact changes needed to migrate each dashboard component from mock data to real API calls.

## Overview

- **Resident Dashboard**: 10 components using mock data
- **Admin Dashboard**: 8 components using mock data
- **Watchman Dashboard**: 6 components using mock data
- **Superadmin Dashboard**: 4 components using mock data

Total: 28 components to migrate

---

## Phase 1: Resident Dashboard Components

### 1. FinancialDashboard ✅ DONE
**Status**: Migrated to `useBills()` hook
**File**: `app/resident-dashboard/components/FinancialDashboard.tsx`
**Changes**:
- Removed: `mockBills[]` and `mockPaymentHistory[]` arrays
- Added: `useBills()` hook from `@/hooks/useResidentData`
- Updated: Bill map loop to use `bills` from hook
- Added: Loading and error states

### 2. ComplaintsReporting
**File**: `app/resident-dashboard/components/ComplaintsReporting.tsx`
**Replace with**:
```tsx
import { useComplaints } from '@/hooks/useResidentData'

export default function ComplaintsReporting() {
  const { complaints, loading, error, refetch } = useComplaints()
  
  // Remove mockComplaints and mockHistory
  // Replace usage of mockComplaints with complaints
  // Replace usage of mockHistory with complaints.filter(c => c.status !== 'open')
}
```

### 3. MaintenanceAndBilling
**File**: `app/resident-dashboard/components/MaintenanceAndBilling.tsx`
**Replace with**:
```tsx
import { useBills } from '@/hooks/useResidentData'

export default function MaintenanceAndBilling() {
  const { bills, loading, error, refetch } = useBills()
  
  // Remove mockFees
  // Replace usage of mockFees with bills
}
```

### 4. Community (Amenities & Bookings)
**File**: `app/resident-dashboard/components/Community.tsx`
**Replace with**:
```tsx
import { useAmenities, useAmenityBookings, useVisitors } from '@/hooks/useResidentData'

export default function Community() {
  const { amenities, loading: amLoading } = useAmenities()
  const { bookings, loading: bookLoading } = useAmenityBookings()
  const { visitors, loading: visLoading } = useVisitors()
  
  // Remove mockAmenities, myBookings (replace with bookings)
  // Remove mockVisitorRequests (replace with visitors)
}
```

### 5. Announcements
**File**: `app/resident-dashboard/components/Announcements.tsx`
**Replace with**:
```tsx
import { useAnnouncements } from '@/hooks/useResidentData'

export default function Announcements() {
  const { announcements, loading, error, refetch } = useAnnouncements()
  
  // Remove mockAnnouncements array
  // Replace useState(mockAnnouncements) with announcements hook
}
```

### 6. InAppMessaging
**File**: `app/resident-dashboard/components/InAppMessaging.tsx`
**Replace with**:
```tsx
import { useMessages } from '@/hooks/useResidentData'

export default function InAppMessaging() {
  const { messages, loading, error, refetch } = useMessages()
  
  // Remove mockConversations and mockMessages
  // Replace with messages from hook
}
```

### 7. VisitorApproval
**File**: `app/resident-dashboard/components/VisitorApproval.tsx`
**Replace with**:
```tsx
import { useVisitors } from '@/hooks/useResidentData'

export default function VisitorApproval() {
  const { visitors, loading, error, refetch } = useVisitors()
  
  // Remove mockVisitors
  // Replace with visitors hook
}
```

### 8. SocietyFinancialDashboard
**File**: `app/resident-dashboard/components/SocietyFinancialDashboard.tsx`
**Replace with**:
```tsx
import { useFinancialData } from '@/hooks/useResidentData'

export default function SocietyFinancialDashboard() {
  const { financialData, loading, error, refetch } = useFinancialData()
  
  // Remove mockFinancialData
  // Replace with financialData from hook
}
```

### 9. ParcelTracking
**File**: `app/resident-dashboard/components/ParcelTracking.tsx`
**Replace with**:
```tsx
import { useParcels } from '@/hooks/useResidentData'

export default function ParcelTracking() {
  const { parcels, loading, error, refetch } = useParcels()
  
  // Remove mockParcels
  // Replace with parcels hook
}
```

### 10. FamilyMemberDelegation - SKIP
**Status**: User requested this be removed entirely, so no migration needed

---

## Phase 2: Admin Dashboard Components

### 1. ResidentManagement
**File**: `app/society-admin/components/ResidentManagement.tsx`
**Replace with**:
```tsx
import { useResidents } from '@/hooks/useAdminData'

export default function ResidentManagement() {
  const { residents, loading, error, refetch } = useResidents()
  
  // Remove mockResidents
  // Replace with residents hook
}
```

### 2. BillingAndPayments
**File**: `app/society-admin/components/BillingAndPayments.tsx`
**Replace with**:
```tsx
import { useBillsAdmin, usePendingPayments } from '@/hooks/useAdminData'

export default function BillingAndPayments() {
  const { bills, loading, error, refetch } = useBillsAdmin()
  const { payments, loading: payLoading } = usePendingPayments()
  
  // Remove mockBills and mockPayments
  // Replace with real data
}
```

### 3. ComplaintManagement
**File**: `app/society-admin/components/ComplaintManagement.tsx`
**Replace with**:
```tsx
import { useComplaintsAdmin } from '@/hooks/useAdminData'

export default function ComplaintManagement() {
  const { complaints, loading, error, refetch } = useComplaintsAdmin()
  
  // Remove mockComplaints
  // Replace with complaints hook
}
```

### 4. ParcelTracking
**File**: `app/society-admin/components/ParcelTracking.tsx`
**Replace with**:
```tsx
import { useParcelsAdmin } from '@/hooks/useAdminData'

export default function ParcelTracking() {
  const { parcels, loading, error, refetch } = useParcelsAdmin()
  
  // Remove mockParcels
  // Replace with parcels hook
}
```

### 5. AmenitiesManagement
**File**: `app/society-admin/components/AmenitiesManagement.tsx`
**Replace with**:
```tsx
import { useAmenitiesAdmin, useAmenityBookingsAdmin } from '@/hooks/useAdminData'

export default function AmenitiesManagement() {
  const { amenities, loading } = useAmenitiesAdmin()
  const { bookings, loading: bookLoading } = useAmenityBookingsAdmin()
  
  // Remove mockAmenities and mockBookings
  // Replace with real data
}
```

### 6. ScheduleMobile (Watchman Duty)
**File**: `app/society-admin/components/ScheduleMobile.tsx`
**Replace with**:
```tsx
import { useWatchmanSchedules } from '@/hooks/useAdminData'

export default function ScheduleMobile() {
  const { schedules, loading, error, refetch } = useWatchmanSchedules()
  
  // Remove mockSchedules
  // Replace with schedules hook
}
```

### 7. FinanceConsolidated
**File**: `app/society-admin/components/FinanceConsolidated.tsx`
**Replace with**:
```tsx
import { useFinancialsAdmin } from '@/hooks/useAdminData'

export default function FinanceConsolidated() {
  const { financials, loading, error, refetch } = useFinancialsAdmin()
  
  // Remove mockFinancials
  // Replace with financials hook
}
```

### 8. WatchmanMobile (Watchman Management)
**File**: `app/society-admin/components/WatchmanMobile.tsx`
**Replace with**:
```tsx
// Use existing watchman data from API
import { useAdminData } from '@/hooks/useAdminData'

// Replace mockWatchmen with real API calls
```

---

## Phase 3: Watchman Dashboard Components

### 1. VisitorLogging
**File**: `app/watchman-dashboard/VisitorLogging.tsx`
**Replace with**:
```tsx
import { useVisitorLogs } from '@/hooks/useWatchmanData'

export default function VisitorLogging() {
  const { visitors, loading, error, refetch } = useVisitorLogs()
  
  // Remove mockVisitors
  // Replace with visitors hook
}
```

### 2. DutyTracking
**File**: `app/watchman-dashboard/DutyTracking.tsx`
**Replace with**:
```tsx
import { useDutyLogs } from '@/hooks/useWatchmanData'

export default function DutyTracking() {
  const { dutyLogs, loading, error, refetch } = useDutyLogs()
  
  // Remove mockDutyLogs
  // Replace with dutyLogs hook
}
```

### 3. BlacklistManager
**File**: `app/watchman-dashboard/BlacklistManager.tsx`
**Replace with**:
```tsx
import { useBlacklist } from '@/hooks/useWatchmanData'

export default function BlacklistManager() {
  const { blacklisted, loading, error, refetch } = useBlacklist()
  
  // Remove mockBlacklist
  // Replace with blacklisted hook
}
```

### 4. EmergencyAlerts
**File**: `app/watchman-dashboard/EmergencyAlerts.tsx`
**Replace with**:
```tsx
import { useEmergencyAlerts } from '@/hooks/useWatchmanData'

export default function EmergencyAlerts() {
  const { alerts, loading, error, refetch } = useEmergencyAlerts()
  
  // Remove mockAlerts
  // Replace with alerts hook
  // Keep polling interval very frequent (5s) for real-time updates
}
```

### 5. ParcelManagement
**File**: `app/watchman-dashboard/ParcelManagement.tsx`
**Replace with**:
```tsx
import { useParcelsWatchman } from '@/hooks/useWatchmanData'

export default function ParcelManagement() {
  const { parcels, loading, error, refetch } = useParcelsWatchman()
  
  // Remove mockParcels
  // Replace with parcels hook
}
```

### 6. GateEntry
**File**: `app/watchman-dashboard/GateEntry.tsx`
**Replace with**:
```tsx
import { useVisitorLogs, useBlacklist } from '@/hooks/useWatchmanData'

export default function GateEntry() {
  const { visitors, loading } = useVisitorLogs()
  const { blacklisted } = useBlacklist()
  
  // Remove mockVisitors and mockBlacklist
  // Replace with real data
}
```

---

## Phase 4: SuperAdmin Dashboard Components

### 1. SocietyManagement
**File**: `app/superadmin-dashboard/components/SocietyManagement.tsx`
**Replace with**:
```tsx
// Add API endpoint for superadmin to list all societies
import { usePolling } from '@/hooks/usePolling'

export default function SocietyManagement() {
  const { data: societies, loading } = usePolling('/api/superadmin/societies')
  
  // Remove mockSocieties
  // Replace with societies from API
}
```

### 2. AdminManagement
**File**: `app/superadmin-dashboard/components/AdminManagement.tsx`
**Replace with**:
```tsx
import { usePolling } from '@/hooks/usePolling'

export default function AdminManagement() {
  const { data: admins, loading } = usePolling('/api/superadmin/admins')
  
  // Remove mockAdmins
  // Replace with admins from API
}
```

### 3. SystemMetrics
**File**: `app/superadmin-dashboard/components/SystemMetrics.tsx`
**Replace with**:
```tsx
import { usePolling } from '@/hooks/usePolling'

export default function SystemMetrics() {
  const { data: metrics, loading } = usePolling('/api/superadmin/metrics')
  
  // Remove mockMetrics
  // Replace with metrics from API
}
```

### 4. AuditLogs
**File**: `app/superadmin-dashboard/components/AuditLogs.tsx`
**Replace with**:
```tsx
import { usePolling } from '@/hooks/usePolling'

export default function AuditLogs() {
  const { data: logs, loading } = usePolling('/api/superadmin/audit-logs')
  
  // Remove mockLogs
  // Replace with logs from API
}
```

---

## Quick Migration Checklist

- [ ] Phase 1: Resident Dashboard (10 components)
  - [x] FinancialDashboard (DONE)
  - [ ] ComplaintsReporting
  - [ ] MaintenanceAndBilling
  - [ ] Community
  - [ ] Announcements
  - [ ] InAppMessaging
  - [ ] VisitorApproval
  - [ ] SocietyFinancialDashboard
  - [ ] ParcelTracking
  - [ ] FamilyMemberDelegation (SKIP - user removed it)

- [ ] Phase 2: Admin Dashboard (8 components)
  - [ ] ResidentManagement
  - [ ] BillingAndPayments
  - [ ] ComplaintManagement
  - [ ] ParcelTracking
  - [ ] AmenitiesManagement
  - [ ] ScheduleMobile
  - [ ] FinanceConsolidated
  - [ ] WatchmanMobile

- [ ] Phase 3: Watchman Dashboard (6 components)
  - [ ] VisitorLogging
  - [ ] DutyTracking
  - [ ] BlacklistManager
  - [ ] EmergencyAlerts
  - [ ] ParcelManagement
  - [ ] GateEntry

- [ ] Phase 4: SuperAdmin Dashboard (4 components)
  - [ ] SocietyManagement
  - [ ] AdminManagement
  - [ ] SystemMetrics
  - [ ] AuditLogs

---

## API Endpoints That Need to Exist

Verify these endpoints are implemented in your backend:

**Resident Endpoints**:
- ✅ GET /api/bills
- ✅ GET /api/complaints
- ✅ GET /api/visitors
- ✅ GET /api/amenities
- ✅ GET /api/amenities/bookings
- ✅ GET /api/financial
- ✅ GET /api/announcements
- ✅ GET /api/messages
- ✅ GET /api/parcels

**Admin Endpoints**:
- ✅ GET /api/residents
- ✅ GET /api/bills
- ✅ GET /api/bills/pending-payments
- ✅ GET /api/complaints
- ✅ GET /api/watchmen/duty
- ✅ GET /api/financial
- ✅ GET /api/visitors
- ✅ GET /api/amenities/bookings
- ✅ GET /api/amenities
- ✅ GET /api/parcels

**Watchman Endpoints**:
- ✅ GET /api/visitors
- ✅ GET /api/watchmen/duty-logs
- ✅ GET /api/blacklist
- ✅ GET /api/emergency
- ✅ GET /api/parcels

**SuperAdmin Endpoints**:
- [ ] GET /api/superadmin/societies
- [ ] GET /api/superadmin/admins
- [ ] GET /api/superadmin/metrics
- [ ] GET /api/superadmin/audit-logs

---

## Testing After Migration

1. **Test Each Dashboard**:
   - Login as resident, check bills/complaints load
   - Login as admin, check all residents/bills load
   - Login as watchman, check visitor logs load
   - Login as superadmin, check all societies load

2. **Check Polling**:
   - Verify data updates every 15-60 seconds depending on component
   - Check browser console for API calls

3. **Error Handling**:
   - Verify error messages display if API fails
   - Test "Try Again" button refreshes data

4. **Performance**:
   - Check Network tab in DevTools
   - Ensure requests complete in <1 second
   - Verify no infinite loops

---

## Notes

- All hooks use `usePolling` with configured intervals
- Headers automatically include `x-user-id`, `x-society-id`, `x-user-role` from localStorage
- Loading and error states are consistent across all components
- Real database data provides complete multi-tenant isolation
- No more stale mock data - always fresh from Supabase
