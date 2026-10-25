# Mock Data Removal & Backend Integration - Migration Status

## Current Progress

### Completed (✅ Ready for Use)

**Core Infrastructure:**
- ✅ Supabase database schema defined in types.ts
- ✅ Seed script created: `scripts/seed-production-data.ts`
- ✅ 20+ API routes built and ready
- ✅ Data fetching hooks created: `useResidentData.ts`, `useAdminData.ts`, `useWatchmanData.ts`
- ✅ Authentication system (login pages with real Supabase auth)
- ✅ Error handling and loading states

**Component Migrations:**
- ✅ FinancialDashboard.tsx - Migrated to real API
- ✅ MaintenanceAndBilling.tsx - Fully migrated with real bills (DONE THIS SESSION)

### In Progress (🔄 Next Priority)

**High Priority - Resident Dashboard (5 components):**
1. ComplaintsReporting.tsx - Remove mock complaints, use `useComplaints()`
2. VisitorsList.tsx - Remove mock visitors, use `useVisitors()`
3. Community.tsx - Remove mock amenities/bookings, use `useAmenities()` + `useAmenityBookings()`
4. Announcements.tsx - Remove mock announcements, use real API
5. InAppMessaging.tsx - Remove mock messages, use `useMessages()`

**Medium Priority - Admin Dashboard (6 components):**
1. CollectionsDashboard.tsx - Use real bills and payments
2. AmenitiesManagement.tsx - Use real amenities and bookings
3. UnitGrid.tsx - Use real residents and properties
4. MaintenanceTab.tsx - Use real complaints
5. WatchmanMobile.tsx - Use real watchmen and schedule
6. ScheduleMobile.tsx - Use real duty schedules

**Lower Priority - Watchman Dashboard (2 components):**
1. VisitorLogging.tsx - Use real visitor logs
2. DutyLog.tsx - Use real duty logs

**Lower Priority - Other:**
1. WatchmenInfo.tsx - Real watchmen data
2. PaymentCollectionTracker.tsx - Real payment data
3. MaintenanceInsights.tsx - Real data
4. MaintenanceTickets.tsx - Real tickets
5. FamilyMemberDelegation.tsx - Remove (not implementing per user request)
6. SocietyFinancialDashboard.tsx - Already using real data
7. VisitorsAtGateWidget.tsx - Real visitor data
8. WatchmenDutyLog.tsx - Real duty logs
9. CommunityMobile.tsx - Real data
10. IssuesMobile.tsx - Real issues
11. ProfileMobile.tsx - Real user data
12. AnnouncementsTab.tsx - Real announcements

### Not Started (⏳ Backlog)

- SuperAdmin dashboard components
- Additional admin components
- Testing suite
- Deployment verification

---

## Quick Migration Template

For each component, follow this pattern:

### Step 1: Remove Mock Data
```typescript
// REMOVE all of these:
const [mockData, setMockData] = useState([...])
const mockArray = [...]
```

### Step 2: Add Hook Import
```typescript
import { useComplaints, useBills, useVisitors, etc } from '@/hooks/useResidentData'
```

### Step 3: Replace State with Hook
```typescript
// BEFORE:
const [complaints, setComplaints] = useState(mockComplaints)

// AFTER:
const { complaints, loading, error, refetch } = useComplaints()
```

### Step 4: Add Loading/Error States
```typescript
if (loading) return <LoadingSpinner />
if (error) return <ErrorAlert error={error} onRetry={refetch} />
```

### Step 5: Update JSX to Use Real Data
```typescript
// Change all references from mock arrays to hook data
{complaints.map(complaint => (...))}
```

### Step 6: Update Event Handlers for API Calls
```typescript
// Instead of setState, call API:
const handlePayment = async (bill) => {
  const response = await fetch('/api/bills/pay', {
    method: 'POST',
    headers: { 'x-user-id': localStorage.getItem('user_id') },
    body: JSON.stringify({ billId: bill.id }),
  })
  if (response.ok) refetch()
}
```

---

## Database Seeding

Run this once to populate database with demo data:

```bash
npx tsx scripts/seed-production-data.ts
```

This creates:
- 1 Demo Society (Sunrise Heights)
- 1 SuperAdmin
- 1 Admin
- 3 Residents
- 2 Watchmen
- Sample Bills, Complaints, Amenities, etc.

---

## Test Credentials

After seeding, use these to test:

```
SuperAdmin:
  Email: superadmin@demo.com
  Password: Demo@123456

Admin:
  Email: admin@demo.com
  Password: Admin@123456

Residents:
  Email: resident1@demo.com (or 2/3)
  Password: Resident@123

Watchmen:
  Email: watchman1@demo.com (or 2)
  Password: Watchman@123
```

---

## Environment Check

Verify these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Remaining Work Estimates

| Task | Components | Effort | Status |
|------|-----------|--------|--------|
| Resident Dashboard | 5 | 2-3 hrs | Ready to start |
| Admin Dashboard | 6 | 2-3 hrs | After resident done |
| Watchman Dashboard | 2 | 30-45 min | After admin done |
| SuperAdmin Dashboard | 1-3 | 30-60 min | Last |
| Testing & Verification | - | 1-2 hrs | Final |

**Total Remaining Effort: 6-8 hours**

---

## Next Steps

1. Run seed script: `npx tsx scripts/seed-production-data.ts`
2. Start dev server: `pnpm dev`
3. Test login with demo accounts
4. Migrate resident dashboard components (highest priority)
5. Migrate admin dashboard components
6. Migrate watchman dashboard components
7. Test all end-to-end flows
8. Deploy to production

---

## Helpful Commands

```bash
# Run seed script
npx tsx scripts/seed-production-data.ts

# View logs
tail -f /vercel/share/v0-project/.logs

# Check Supabase data
# Go to: https://supabase.com/dashboard/project/[project]/editor

# Restart dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm eslint .
```

---

## Support

For each component migration:
1. Reference the COMPLETE_CLEANUP_GUIDE.md for detailed instructions
2. Use the Quick Migration Template above
3. Test with demo credentials
4. Verify data appears in dashboard
5. Test create/update/delete operations

Once all components are migrated, this system will be fully production-ready with zero mock data.
