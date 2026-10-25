# DEVELOPER IMPLEMENTATION GUIDE

Complete guide for developers to understand, build, and extend the Society Management System.

---

## PART 1: SYSTEM ARCHITECTURE

### Frontend Structure
```
app/
├── page.tsx (Landing)
├── layout.tsx (Root with Sonner provider)
├── resident-dashboard/
│   ├── page.tsx (Main resident dashboard)
│   └── components/
│       ├── Home.tsx
│       ├── VisitorApprovals.tsx
│       ├── UnifiedIssuesTracker.tsx
│       ├── FinancialManagement.tsx
│       ├── SocietyFinancialDashboard.tsx
│       ├── Community.tsx
│       ├── Emergency.tsx
│       └── ...other components
├── society-admin/
│   ├── page.tsx (Admin dashboard)
│   └── components/
│       ├── DashboardOverview.tsx
│       ├── UnitGrid.tsx
│       ├── VisitorStats.tsx
│       ├── AmenitiesManagement.tsx
│       └── ...other components
└── ...other routes
```

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Notifications:** Sonner
- **Icons:** Lucide React
- **State Management:** React hooks + useState
- **Animations:** Tailwind transitions

---

## PART 2: KEY PATTERNS & CONVENTIONS

### Pattern 1: Dashboard Tabs
Every dashboard uses a tab-based navigation pattern:

```typescript
// Example from Resident Dashboard
const [activeTab, setActiveTab] = useState<'amenities' | 'board' | 'mybookings'>('amenities')

const navTabs: NavTab[] = [
  { id: 'amenities', label: 'Amenities', icon: <Icon /> },
  { id: 'board', label: 'Community Board', icon: <Icon /> },
  // ...
]

// Rendering:
<div className="flex gap-2 border-b">
  {navTabs.map((tab) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={activeTab === tab.id ? 'active-styles' : 'inactive-styles'}
    >
      {tab.label}
    </button>
  ))}
</div>

{activeTab === 'amenities' && <AmenitiesView />}
{activeTab === 'board' && <BoardView />}
```

### Pattern 2: Status Workflows
Every major feature follows a status progression:

```typescript
// Visitor Pass workflow:
// pending → approved → checked-in → checked-out

// Amenity Booking workflow:
// pending → approved → awaiting-payment → confirmed → completed

// Issue workflow:
// submitted → assigned → in-progress → completed → approved → resolved → closed

// Implementation pattern:
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    // ...
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
```

### Pattern 3: Mock Data Structure
Currently using mock data. Structure:

```typescript
// Mock data follows database schema
const mockBills = [
  {
    id: 'bill-001',
    residentId: 'resident-456',
    amount: 2500,
    status: 'pending',
    // ... matches DB schema
  }
]

// When migrating to real DB, replace with:
// const [bills, setBills] = useSWR('/api/bills', fetcher)
```

### Pattern 4: Form Handling
Standard form pattern using React state:

```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  // ...
})

const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}

const handleSubmit = () => {
  // Validation
  if (!formData.name) {
    toast.error('Name is required')
    return
  }
  
  // Submit (currently mock, will be API call)
  // Create data object
  const newItem = { id: Date.now(), ...formData }
  
  // Update state
  setItems([newItem, ...items])
  
  // Reset form
  setFormData({ name: '', email: '' })
  
  // Notify user
  toast.success('Added successfully!')
}
```

---

## PART 3: MIGRATION FROM MOCK DATA TO REAL DATABASE

### Step 1: Set Up Database
```bash
# Create PostgreSQL database
# Run migration scripts in /scripts folder
psql -U postgres < scripts/01-create-tables.sql
psql -U postgres < scripts/02-create-indexes.sql
```

### Step 2: Create API Routes
```typescript
// app/api/visitors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const residentId = searchParams.get('residentId')
  
  const passes = await db.query(
    'SELECT * FROM visitor_passes WHERE resident_id = $1',
    [residentId]
  )
  
  return NextResponse.json(passes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const pass = await db.query(
    'INSERT INTO visitor_passes (...) VALUES (...) RETURNING *',
    [body.visitorName, body.phone, ...]
  )
  
  return NextResponse.json(pass)
}
```

### Step 3: Replace Mock Data with API Calls
```typescript
// Before (Mock):
const [bills, setBills] = useState(mockBills)

// After (Real API):
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())
const { data: bills, mutate } = useSWR('/api/bills?residentId=123', fetcher)

// Update pattern:
const handlePayment = async () => {
  const res = await fetch('/api/bills/123', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'paid' })
  })
  mutate() // Refresh data
}
```

### Step 4: Environment Variables
```env
# .env.local
DATABASE_URL=postgresql://user:pass@localhost/society_db
NEXT_PUBLIC_API_URL=http://localhost:3000/api
JWT_SECRET=your-secret-key
```

---

## PART 4: ADDING NEW FEATURES

### Example: Adding a New Feature "Guest WiFi Management"

#### Step 1: Add to Database Schema
```sql
CREATE TABLE guest_wifi (
  id UUID PRIMARY KEY,
  society_id UUID REFERENCES societies(id),
  resident_id UUID REFERENCES users(id),
  password_hash VARCHAR(255),
  request_date DATE,
  expiry_date DATE,
  status ENUM('active', 'expired', 'revoked'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Step 2: Create Component
```typescript
// app/resident-dashboard/components/GuestWifi.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function GuestWifi() {
  const [wifiPassword, setWifiPassword] = useState('')
  const [requestDate, setRequestDate] = useState('')
  
  const handleRequest = () => {
    if (!requestDate) {
      toast.error('Please select date')
      return
    }
    
    // Make API call
    const newRequest = {
      id: Date.now(),
      requestDate,
      status: 'pending'
    }
    
    toast.success('WiFi access requested')
  }
  
  return (
    <div>
      {/* UI */}
    </div>
  )
}
```

#### Step 3: Add to Dashboard Navigation
```typescript
// In resident-dashboard/page.tsx
const navTabs: NavTab[] = [
  // ... existing tabs
  { id: 'wifi', label: 'Guest WiFi', icon: <Wifi className="..." /> }
]

// Add to ViewType
type ViewType = '...' | 'wifi'

// Add to renderContent
case 'wifi':
  return <GuestWifi />
```

#### Step 4: Create API Route
```typescript
// app/api/guest-wifi/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { residentId, requestDate } = body
  
  // Generate random password
  const password = Math.random().toString(36).slice(-8)
  
  // Store in DB
  const result = await db.query(
    'INSERT INTO guest_wifi (...) VALUES (...)',
    [residentId, password, ...]
  )
  
  // Notify admin
  // sendEmailToAdmin(...)
  
  return NextResponse.json(result)
}
```

---

## PART 5: TESTING CHECKLIST

### Unit Tests
- [ ] Form validation works
- [ ] Status transitions are correct
- [ ] Data calculations are accurate
- [ ] Icons render properly

### Integration Tests
- [ ] API endpoints return correct data
- [ ] Database queries work
- [ ] Authentication works
- [ ] Notifications display

### UI Tests
- [ ] Responsive on mobile/tablet/desktop
- [ ] Tabs switch properly
- [ ] Forms submit data
- [ ] Buttons are clickable

### Workflow Tests
- [ ] Visitor pass: request → approve → check-in → check-out
- [ ] Issue: report → assign → complete → approve
- [ ] Amenity booking: request → approve → payment → confirm
- [ ] Financial: bill created → payment received → confirmed

---

## PART 6: PERFORMANCE OPTIMIZATION

### Code Splitting
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />
})
```

### Image Optimization
```typescript
import Image from 'next/image'

<Image 
  src="/amenity.jpg" 
  alt="Community Hall"
  width={300}
  height={200}
  priority={false}
/>
```

### Caching Strategy
```typescript
// API routes - cache GET requests
export const revalidate = 60 // 1 minute

// ISR - Incremental Static Regeneration
export const revalidate = 3600 // 1 hour
```

---

## PART 7: SECURITY CHECKLIST

- [ ] Password hashing (bcrypt) implemented
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection (React auto-escapes)
- [ ] CSRF tokens in forms
- [ ] Authentication middleware
- [ ] Authorization checks (role-based)
- [ ] Rate limiting on API
- [ ] Input validation
- [ ] HTTPS enforced
- [ ] Secrets in environment variables

---

## PART 8: DEBUGGING GUIDE

### Common Issues & Solutions

**Issue: Toast not showing**
```
Solution: Check Toaster is in layout.tsx
Check: app/layout.tsx has <Toaster position="top-right" richColors />
```

**Issue: Data not updating after API call**
```
Solution: Forget to call mutate() from SWR
Fix: const { mutate } = useSWR(...)
     mutate() after API call
```

**Issue: Component not rendering**
```
Solution: Check status in switch statement
         Check component is imported
         Check ViewType includes new view
```

**Issue: Styling looks wrong on mobile**
```
Solution: Use responsive classes: md:, lg:
         Check Tailwind is configured correctly
         Use Mobile-First approach
```

---

## PART 9: DEPLOYMENT CHECKLIST

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Images optimized
- [ ] Build completes without errors
- [ ] No console warnings
- [ ] Performance metrics check
- [ ] Security audit passed
- [ ] Mobile responsiveness confirmed
- [ ] User testing completed

---

## PART 10: USEFUL COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter
npm run type-check       # Check TypeScript

# Database
psql -U postgres -f scripts/migrate.sql   # Run migration
pg_dump -U postgres > backup.sql          # Backup

# Deployment
vercel deploy            # Deploy to Vercel
vercel logs              # Check deployment logs
```

---

This guide provides everything a developer needs to understand and extend the system. Refer to WORKFLOW_DOCUMENTATION.md and DATA_SCHEMA.md for detailed specifications.
