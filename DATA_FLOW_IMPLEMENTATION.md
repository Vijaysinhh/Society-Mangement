# Complete Data Flow Architecture

## System Overview

The application now uses a **Centralized Data Store** pattern that connects all dashboards (Resident, Admin, Watchman) with real-time synchronization through event-based updates.

## Core Components

### 1. Central Data Store (`lib/centralDataStore.ts`)
- **Single Source of Truth**: All data stored in one location
- **Persistence**: Uses localStorage for data persistence
- **Real-time Updates**: EventEmitter pattern for instant propagation
- **No Backend Required**: Works entirely client-side

### 2. Data Access Hooks (`hooks/useCentralDataStore.ts`)
- `useVisitors()` - Manage visitor approvals and check-ins
- `useIssues()` - Handle maintenance requests and work orders
- `useBills()` - Track billing and payments
- `usePayments()` - Record and manage payments
- `useAnnouncements()` - Distribute announcements to residents/watchmen
- `useShifts()` - Manage watchman shifts and attendance
- `useIncidents()` - Report and track security incidents
- `useStats()` - Get real-time analytics across all data

### 3. Sample Data Initializer (`lib/initializeSampleData.ts`)
- Populates realistic data for testing
- Creates users, visitors, bills, issues, announcements, shifts, incidents
- One-time initialization (checks if data exists first)

## Data Flow Examples

### Flow 1: Visitor Approval Process
```
Resident → Approves Visitor (Resident Dashboard)
  ↓
dataStore.approveVisitor() called
  ↓
Event emitted: 'visitors:approved'
  ↓
All subscribed components re-render with new data
  ↓
Watchman sees approved visitor (Watchman Dashboard)
```

### Flow 2: Issue Status Update
```
Admin → Creates Building Care Work Order
  ↓
dataStore.createIssue() → Event: 'issues:created'
  ↓
Issue appears in Resident Dashboard (marked as "Building Update")
  ↓
Admin → Updates status to "In Progress", adds message
  ↓
dataStore.updateIssueStatus() → Event: 'issues:status-updated'
  ↓
Residents see progress bar update (30% → 60%)
```

### Flow 3: Payment Recording
```
Resident → Pays bill
  ↓
Admin → Records payment in Financials tab
  ↓
dataStore.recordPayment() called
  ↓
Event emitted: 'payments:recorded'
  ↓
Bill status updates from 'pending' to 'paid'
  ↓
Event propagates to all components
  ↓
Resident Dashboard shows updated bill status
```

### Flow 4: Shift & Incident Management
```
Watchman → Checks in for shift
  ↓
dataStore.checkInShift() → Event: 'shifts:checked-in'
  ↓
Admin sees watchman status updated in Security Team tab
  ↓
Watchman → Reports incident
  ↓
dataStore.reportIncident() → Event: 'incidents:reported'
  ↓
Incident linked to shift automatically
  ↓
Admin sees incident in dashboard for acknowledgment
```

### Flow 5: Announcements Distribution
```
Admin → Creates announcement for "residents" visibility
  ↓
dataStore.createAnnouncement() → Event: 'announcements:created'
  ↓
All residents' dashboards show new announcement
  ↓
Resident → Reads announcement
  ↓
dataStore.markAnnouncementRead() → Event: 'announcements:read'
  ↓
Admin sees read count in announcements tab
```

## Data Storage Structure

```
localStorage:
├── app_visitors: Visitor[]
├── app_issues: Issue[]
├── app_bills: Bill[]
├── app_payments: Payment[]
├── app_announcements: Announcement[]
├── app_shifts: WatchmanShift[]
├── app_incidents: Incident[]
├── app_users: User[]
└── app_last_sync: ISO string
```

## Real-Time Synchronization

1. **Component subscribes**: `useVisitors()` registers listener for 'visitors:added'
2. **Action triggered**: Admin approves visitor via `approveVisitor()`
3. **Data updated**: Central store updates state and saves to localStorage
4. **Event emitted**: `emit('visitors:approved', visitor)`
5. **Subscribers notified**: All listening components get callback
6. **State updated**: Components call setState with new data
7. **UI re-renders**: Changes visible immediately across all dashboards

## Key Features

### No Database Needed
- ✅ All data persists in localStorage
- ✅ Data survives page refreshes
- ✅ Each browser has independent data store
- ✅ Perfect for prototype/demo/single-device scenarios

### Real-Time Updates
- ✅ Changes propagate instantly across all open dashboards
- ✅ No polling or API calls
- ✅ Event-driven architecture for efficiency

### Automatic Synchronization
- ✅ Related data updates automatically (bill → payment → status)
- ✅ Shift incidents linked automatically
- ✅ No manual sync required

### Analytics Ready
- ✅ `useStats()` provides real-time metrics
- ✅ All calculations based on current data
- ✅ No lag in reporting

## How to Use

### In a Component

```tsx
import { useVisitors, useBills, useIssues } from '@/hooks/useCentralDataStore'
import { initializeSampleData } from '@/lib/initializeSampleData'

export default function MyDashboard() {
  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData()
  }, [])

  // Use hooks to access and modify data
  const { visitors, approveVisitor } = useVisitors('101')
  const { bills, recordPayment } = useBills('101')
  const { issues, updateStatus } = useIssues()

  const handleApproveVisitor = (visitorId) => {
    approveVisitor(visitorId, 'admin_1')
    // Data updates automatically across all components
  }

  return (
    // Render using data from hooks
  )
}
```

### Direct Data Store Access

```tsx
import { dataStore } from '@/lib/centralDataStore'

// Get data
const allVisitors = dataStore.getVisitors()
const stats = dataStore.getStats()

// Modify data
dataStore.approveVisitor('visitor_123', 'admin_1')

// Subscribe to changes
dataStore.subscribe('visitors:approved', (visitor) => {
  console.log('Visitor approved:', visitor)
})
```

## Migration Path

To convert to real backend when needed:
1. Replace `localStorage` calls with API calls
2. Replace EventEmitter with WebSocket connection
3. Update hooks to use async/await with API
4. Everything else remains the same (same interface, same data structure)

## Benefits

- ✅ **Immediate**: No backend setup required
- ✅ **Real**: Real data flow and synchronization
- ✅ **Testable**: All features can be tested with real interactions
- ✅ **Scalable**: Easy migration to real backend
- ✅ **Traceable**: Can see exact data flow and updates
- ✅ **Functional**: Actually works without senseless mock data
