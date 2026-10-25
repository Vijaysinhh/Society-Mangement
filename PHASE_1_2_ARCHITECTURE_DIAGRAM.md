# Phase 1 & 2 Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOCIETY ADMIN DASHBOARD                      │
│                                                                   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────┐ │
│  │Dashboard │Properties│Residents │ Issues   │Financial │More  │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌───────────────┐  ┌─────────────┐  ┌─────────────┐
        │ Properties    │  │  Residents  │  │   Issues    │
        │   Dashboard   │  │   List      │  │             │
        └───────────────┘  └─────────────┘  └─────────────┘
                ▲              ▲
                │              │
                │ (shows)       │ (links to)
                │              │
        ┌───────────────────────────────┐
        │   PROPERTY ENTITY (PRIMARY)   │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ A-101 (Unit)            │  │
        │  │ Floor: 1                │  │
        │  │ Status: Occupied        │  │
        │  │ Payment: Paid           │  │
        │  └─────────────────────────┘  │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ CURRENT ASSIGNMENTS     │  │
        │  │                         │  │
        │  │ Owner:                  │  │
        │  │ Rajesh Kumar ────────┐  │  │
        │  │ (2023-01-15→present) │  │  │
        │  │                      │  │  │
        │  │ Tenant:              │  │  │
        │  │ Neha Verma ──────────┘  │  │
        │  │ (2024-01-15→present)    │  │
        │  └─────────────────────────┘  │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ PREVIOUS ASSIGNMENTS    │  │
        │  │                         │  │
        │  │ ▪ Priya Sharma (Tenant) │  │
        │  │   2023-02-01 to         │  │
        │  │   2024-01-14            │  │
        │  └─────────────────────────┘  │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ ASSOCIATED DATA         │  │
        │  │                         │  │
        │  │ • Vehicles [2]          │  │
        │  │ • Payments [37 months]  │  │
        │  │ • Maintenance [5]       │  │
        │  │ • Documents             │  │
        │  └─────────────────────────┘  │
        └───────────────────────────────┘
                ▲                ▲
                │                │
                │ (lives at)      │ (assigned to)
                │                │
        ┌───────────────────────────────┐
        │   RESIDENT ENTITIES (SECONDARY)
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ Rajesh Kumar (Owner)    │  │
        │  │ • Phone: 98765 43210    │  │
        │  │ • Email: rajesh@...     │  │
        │  │ • Role: Owner           │  │
        │  │ • propertyId: 1         │  │
        │  │ • propertyStart: 01-15  │  │
        │  │ ─────────────────────── │  │
        │  │ Linked to Property ✓    │  │
        │  │ Since 2023-01-15        │  │
        │  └─────────────────────────┘  │
        │                               │
        │  ┌─────────────────────────┐  │
        │  │ Neha Verma (Tenant)     │  │
        │  │ • Phone: 99123 45678    │  │
        │  │ • Email: neha@...       │  │
        │  │ • Role: Tenant          │  │
        │  │ • propertyId: 1         │  │
        │  │ • propertyStart: 01-15  │  │
        │  │ ─────────────────────── │  │
        │  │ Linked to Property ✓    │  │
        │  │ Since 2024-01-15        │  │
        │  └─────────────────────────┘  │
        │                               │
        └───────────────────────────────┘
```

## Data Flow: Property-First Model

```
USER INTERACTION (Properties Dashboard)
            ▼
┌─────────────────────────────────────┐
│  1. View All Properties             │
│     • List 5 properties             │
│     • Each shows owner + tenant     │
│     • Color-coded status badges     │
└─────────────────────────────────────┘
            ▼
┌─────────────────────────────────────┐
│  2. Click Property A-101            │
│     • Expand card                   │
│     • Show all details              │
└─────────────────────────────────────┘
            ▼
┌─────────────────────────────────────┐
│  3. View Details                    │
│     • Property Details              │
│     ├─ Area: 1250 sq ft             │
│     ├─ Bedrooms: 2                  │
│     └─ Price: ₹45L → ₹52L           │
│                                     │
│     • Current Owner                 │
│     ├─ Rajesh Kumar                 │
│     ├─ Since: 2023-01-15            │
│     └─ Actions: Call, Email, WA     │
│                                     │
│     • Current Tenant                │
│     ├─ Neha Verma                   │
│     ├─ Since: 2024-01-15            │
│     └─ Actions: Call, Email, WA     │
│                                     │
│     • Assignment History            │
│     ├─ Priya Sharma: 2023-2024      │
│     └─ [Show all previous]          │
│                                     │
│     • Vehicles                      │
│     ├─ DL01AB1234                   │
│     └─ Add/Delete options           │
└─────────────────────────────────────┘
            ▼
┌─────────────────────────────────────┐
│  4. Take Action                     │
│     • Change Owner                  │
│     • Change Tenant                 │
│     • Add Vehicle                   │
│     • Contact Owner/Tenant          │
└─────────────────────────────────────┘
```

## Resident-to-Property Linking Flow

```
┌─────────────────────────────────────────────────────────────┐
│              RESIDENTS DASHBOARD (Updated)                  │
│                                                             │
│  Resident Card: Rajesh Kumar                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 👨 A-101                                           Paid│ │
│  │    Rajesh Kumar                                       │ │
│  │    📞 98765 43210 Owner                              │ │
│  │    🔗 Linked to Property Since 2023-01-15           │ │ ◄─┐
│  │    ₹6,500                          May 2024          │ │   │
│  │                                                       │ │   │ Visual
│  │    [Click to Expand]                                 │ │   │ Badge
│  │ ┌─────────────────────────────────────────────────┐  │ │   │ Shows
│  │ │ Current Owner                    [Change]       │  │ │   │ Property
│  │ │ Rajesh Kumar                                    │  │ │   │ Link
│  │ │ rajesh@email.com                                │  │ │   │
│  │ │ Since 2023-01-15                                │  │ │   │
│  │ │ [Call] [Email] [WhatsApp]                       │  │ │ ◄─┘
│  │ │                                                 │  │ │
│  │ │ Registered Vehicles                             │  │ │
│  │ │ • DL01AB1234 [Delete]                           │  │ │
│  │ │ [+ Add Vehicle]                                 │  │ │
│  │ └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Property Reference Points Back to:                        │
│  └─ PropertiesMobile Dashboard (Click to view property)   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Page: /society-admin/page.tsx
│
├─ Main Navigation (Bottom Tabs)
│  ├─ Dashboard → DashboardMobile
│  ├─ Properties → PropertiesMobile ✅ NEW
│  ├─ Residents → ResidentsMobile (UPDATED)
│  ├─ Issues → MaintenanceMobile
│  ├─ Financials → FinancialsMobile
│  └─ More → MoreMobile
│
├─ PropertiesMobile Component (772 lines)
│  ├─ Header Stats
│  │  ├─ Total Properties count
│  │  ├─ Occupied count
│  │  ├─ Empty count
│  │  └─ Maintenance count
│  │
│  ├─ Search & Filter Bar
│  │  ├─ Search input (unit/owner/tenant)
│  │  └─ Filters button (modal)
│  │
│  ├─ Tab Navigation
│  │  ├─ All Properties
│  │  ├─ Occupied
│  │  ├─ Empty
│  │  └─ Maintenance
│  │
│  ├─ Properties List
│  │  └─ Property Card (Expandable)
│  │     ├─ Header (Click to expand/collapse)
│  │     │  ├─ Unit number & floor
│  │     │  ├─ Owner name with Owner badge
│  │     │  ├─ Tenant name with Tenant badge (if exists)
│  │     │  ├─ Status badges (Occupied/Paid)
│  │     │  └─ Chevron icon
│  │     │
│  │     └─ Expanded Content (Conditional)
│  │        ├─ Property Details
│  │        ├─ Current Owner Details + Actions
│  │        ├─ Current Tenant Details + Actions
│  │        ├─ Vehicles Management
│  │        └─ Assignment History
│  │
│  ├─ Floating Action Button (FAB)
│  │  └─ Add Property
│  │
│  └─ Filters Modal
│     ├─ Payment Status filter
│     ├─ Property Status filter
│     └─ Apply/Clear buttons
│
└─ ResidentsMobile Component (ENHANCED)
   ├─ Header Stats (unchanged)
   ├─ Search & Filter Bar (unchanged)
   ├─ Tab Navigation (unchanged)
   │
   ├─ Residents List
   │  └─ Resident Card (Enhanced)
   │     ├─ Header
   │     │  ├─ Avatar
   │     │  ├─ Unit number & name
   │     │  ├─ Phone & role
   │     │  ├─ NEW: Property Link Badge ✅
   │     │  │      └─ 🔗 Linked to Property Since [date]
   │     │  └─ Payment status
   │     │
   │     └─ Expanded Content
   │        ├─ Quick Actions (unchanged)
   │        ├─ Edit Details (unchanged)
   │        ├─ Family Members (unchanged)
   │        └─ Vehicles (unchanged)
   │
   ├─ Floating Action Button (FAB) (unchanged)
   └─ Filters Modal (unchanged)
```

## State Management

### PropertiesMobile State:
```typescript
const [properties, setProperties] = useState<Property[]>([...])
const [searchTerm, setSearchTerm] = useState('')
const [activeTab, setActiveTab] = useState('all')
const [expandedPropertyId, setExpandedPropertyId] = useState(null)
const [showFiltersModal, setShowFiltersModal] = useState(false)
const [selectedPaymentStatus, setSelectedPaymentStatus] = useState([...])
const [selectedStatus, setSelectedStatus] = useState([...])
```

### ResidentsMobile State (Enhanced):
```typescript
const [residents, setResidents] = useState<Resident[]>([
  {
    // ... existing fields
    propertyId: '1',           // NEW
    propertyStartDate: '2023-01-15'  // NEW
  }
])
```

## Key Transformations

### Before (Resident-First):
```
RESIDENT → Lives at → PROPERTY
(Primary)             (Secondary)

Issues:
- When resident changes, what happens to property history?
- Can't see "all payments for property A-101" easily
- Loss of data when resident removed
```

### After (Property-First):
```
PROPERTY → Has Assignment → RESIDENT
(Primary)  (Time-bound)     (Secondary)

Benefits:
✅ Property is permanent, residents temporary
✅ Complete history preserved
✅ Easy queries: "All X for Property Y"
✅ Supports unlimited resident changes
✅ Real-world matches property transactions
```

## Temporal Assignment Model

```
Property A-101
├─ 2023-01-15 ─────────────────────────────────────────┬────
│                Owner: Rajesh Kumar (ACTIVE)         │
├─ 2023-02-01 ─────────┬─────────────────────────────┬┴─┬──
│                      │ Tenant: Priya Sharma       │   │
├─ 2024-01-15 ─────────┴────────────┬─────────────┬┴─┬─┴──
│                                   │ Tenant: Neha│  │
├─ 2024-06-01 ─────────────────────┘─────────────┴──┴────
│ Owner: Rajesh ENDS                    Neha CONTINUES
└─ 2024-06-01 ────────────────────────────────────────┬──
                  Owner: Amit Patel (NEW, ACTIVE)    │
                                                     └─→ [FUTURE]

Timeline: All assignments visible with clear date ranges
History: Complete audit trail showing every transition
```

## Production-Ready Features

✅ Property primary entity established
✅ Owner/tenant assignments temporal and trackable
✅ Complete assignment history preserved
✅ Property-resident linking in place
✅ UI components built and tested
✅ Navigation integrated
✅ User interactions working
✅ Data structure extensible

Ready for Phase 3: Link Payments & Maintenance to Properties
Ready for Phase 4: Build Property History Timeline & Reporting
