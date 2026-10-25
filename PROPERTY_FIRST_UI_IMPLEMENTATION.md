# Property-First Architecture: Implementation Guide

## Core Concept
**The Property (Unit) is the heart of the system. Everything revolves around it.**

```
┌─────────────────────────────────────────────────────────────┐
│                      PROPERTY (Unit)                        │
│                    The Central Hub                          │
└─────────────────────────────────────────────────────────────┘
         ↙         ↓         ↘         ↙         ↓         ↘
    Owners      Tenants   Payments  Maintenance  Visitors  Documents
    (History)   (History) (Linked)  (Linked)    (Linked)   (Linked)
```

## UI Components to Build

### 1. Property Profile Card
Shows complete snapshot of a property with current and historical data.

```
┌─────────────────────────────────────────────────┐
│ A-101 | 3 BHK | 1000 Sq Ft | Floor 1          │
├─────────────────────────────────────────────────┤
│                                                 │
│ CURRENT STATUS                                  │
│ ├─ Owner: Rajesh Kumar (Since Jan 2023)        │
│ ├─ Tenant: Neha Verma (Since Jan 2024)         │
│ ├─ Lease Expires: Jan 2025                     │
│ └─ Status: Occupied                            │
│                                                 │
│ THIS MONTH                                      │
│ ├─ Rent Due: ₹6,500                            │
│ ├─ Status: Paid ✓                              │
│ └─ Paid Date: 01 Jun 2024                      │
│                                                 │
│ QUICK STATS                                     │
│ ├─ Payment Rate: 95% (19/20 months)            │
│ ├─ Maintenance Tickets: 3                      │
│ └─ Owners (Lifetime): 2                        │
│                                                 │
│ [History] [Edit Assignments] [Payments]        │
│ [Maintenance] [Documents] [Visitors]           │
└─────────────────────────────────────────────────┘
```

### 2. Property Assignment Timeline

Shows complete history of who occupied the property and when.

```
A-101 ASSIGNMENT HISTORY

┌─ 2024-06-01 ────────────────────────────────────┐
│ Amit Patel (OWNER) - ACTIVE                    │
│ Status: Current Owner                          │
│ Acquired from: Rajesh Kumar                    │
│ Documents: [Deed] [Transfer Papers]            │
│ Contact: amit@email.com | 98765-43210         │
└─────────────────────────────────────────────────┘

┌─ 2024-01-15 ────────────────────────────────────┐
│ Neha Verma (TENANT) - ACTIVE                   │
│ Status: Current Tenant                         │
│ Lease Expires: 2025-01-14                      │
│ Rent: ₹6,500/month                             │
│ Documents: [Active Lease]                      │
│ Contact: neha@email.com | 98765-43211         │
└─────────────────────────────────────────────────┘

┌─ 2023-02-01 ────────────────────────────────────┐
│ Priya Sharma (TENANT) - ENDED                  │
│ Status: Completed (Moved Out)                  │
│ Duration: 11 months 15 days                    │
│ Rent: ₹6,000/month (Historical)                │
│ Vacated: 2024-01-14                            │
│ Exit Reason: Lease Completed                   │
│ Contact: priya@email.com | 98765-43212        │
└─────────────────────────────────────────────────┘

┌─ 2023-01-15 ────────────────────────────────────┐
│ Rajesh Kumar (OWNER) - ENDED                   │
│ Status: Transferred (Sold Property)            │
│ Duration: 1 year 4 months                      │
│ Transferred To: Amit Patel                     │
│ Documents: [Deed] [Sale Agreement]             │
│ Contact: rajesh@email.com | 98765-43213      │
└─────────────────────────────────────────────────┘
```

### 3. Assign Resident Modal

For assigning/changing owners or tenants.

```
┌──────────────────────────────────────┐
│ ASSIGN RESIDENT TO PROPERTY          │
├──────────────────────────────────────┤
│                                      │
│ Property                             │
│ [A-101 - 3 BHK] ▼                   │
│                                      │
│ Current: Rajesh Kumar (Owner)        │
│ Assigned Since: 2023-01-15           │
│                                      │
│ ─────────────────────────────        │
│                                      │
│ New Assignment                       │
│                                      │
│ Resident                             │
│ [Select from existing...] ▼          │
│ Or create new [+ Add New]            │
│                                      │
│ Role                                 │
│ [Owner] ▼                            │
│ □ Owner  ☑ Tenant  □ Co-Owner       │
│                                      │
│ Assignment Date                      │
│ [2024-06-01] 📅                      │
│                                      │
│ Previous Owner/Tenant                │
│ Mark end date for: Rajesh Kumar      │
│ [2024-06-01] 📅  (Auto-filled)      │
│                                      │
│ Reason                               │
│ [Sale] ▼                             │
│ □ Purchase  □ Rental  □ Transfer    │
│ □ Inheritance  □ Other              │
│                                      │
│ Lease/Agreement                      │
│ [Upload Document] 📎 [Optional]      │
│                                      │
│ Notes                                │
│ [Add notes...] ✏️                    │
│                                      │
│ [Cancel] [Save & Previous] [Assign] │
└──────────────────────────────────────┘
```

### 4. Property Payment Tracker

Shows all payments for a property (across all residents).

```
A-101 PAYMENT HISTORY

Month-by-Month View:

Jun 2024  ₹6,500  Paid ✓      UPI       Neha Verma    01 Jun
May 2024  ₹6,500  Paid ✓      Cash      Neha Verma    30 May
Apr 2024  ₹6,500  Paid ✓      Bank      Neha Verma    28 Apr
Mar 2024  ₹6,500  Overdue ⚠️   Pending   Neha Verma    30 Mar
Feb 2024  ₹6,500  Paid ✓      UPI       Neha Verma    29 Feb
Jan 2024  ₹6,500  Paid ✓      Cash      Neha Verma    15 Jan ⭐ Moved in

Dec 2023  ₹6,000  Paid ✓      Bank      Priya Sharma  28 Dec
Nov 2023  ₹6,000  Paid ✓      Cash      Priya Sharma  30 Nov
Oct 2023  ₹6,000  Paid ✓      UPI       Priya Sharma  27 Oct

... (earlier months)

STATISTICS:
Total Collected: ₹1,39,000
Payment Rate: 95%
Average Delay: 3.2 days
Outstanding: ₹0
```

### 5. Property Maintenance Log

All maintenance/repairs tracked to property across all residents.

```
A-101 MAINTENANCE LOG

┌─ 01 Jun 2024 ─ CLOSED ───────────────┐
│ Title: AC Repair                     │
│ Category: Electrical                │
│ Reported by: Neha Verma (Tenant)    │
│ Description: AC not cooling         │
│ Assigned to: Cool Tech Services     │
│ Start: 01 Jun | Completed: 02 Jun   │
│ Cost: ₹2,500                        │
│ Status: Closed                      │
└────────────────────────────────────┘

┌─ 15 May 2024 ─ RESOLVED ──────────────┐
│ Title: Leaky Faucet                 │
│ Category: Plumbing                  │
│ Reported by: Neha Verma (Tenant)    │
│ Description: Kitchen sink leaking   │
│ Assigned to: Plumber Ram            │
│ Start: 15 May | Completed: 16 May   │
│ Cost: ₹800                          │
│ Status: Resolved                    │
└────────────────────────────────────┘

┌─ 20 Apr 2024 ─ CLOSED ───────────────┐
│ Title: Paint Touch-up               │
│ Category: Carpentry                 │
│ Reported by: Priya Sharma (Tenant)  │
│ Description: Wall paint peeling     │
│ Assigned to: Painter Suresh         │
│ Start: 20 Apr | Completed: 22 Apr   │
│ Cost: ₹1,200                        │
│ Status: Closed                      │
└────────────────────────────────────┘

MAINTENANCE STATS:
- Total Issues: 12
- Average Resolution: 2 days
- Total Cost: ₹8,500
- Current Issues: 0
```

## Implementation Phases

### Phase 1: Core Property Management (Week 1-2)
**Goal: Get property-centric view working**

```
Tasks:
✓ Update types/index.ts with PropertyAssignment type
✓ Create Property Profile Card component
✓ Display current owner/tenant on property card
✓ Show assignment history timeline
✓ Create "Assign Resident" modal
✓ Update ResidentsMobile to use new architecture
```

**Result:** Admin can see property → owner/tenant relationships clearly

### Phase 2: Assignment Workflow (Week 2-3)
**Goal: Handle ownership and tenancy changes**

```
Tasks:
✓ Build assignment creation logic
✓ Handle previous assignment closure (set endDate)
✓ Validate role changes
✓ Track assignment reason
✓ Generate audit trail
✓ Notify affected parties
```

**Result:** Admin can assign/change owners and tenants smoothly

### Phase 3: Data Integration (Week 3-4)
**Goal: Link payments and maintenance to properties**

```
Tasks:
✓ Update payment records to link to property
✓ Create PropertyPayment type
✓ Update payment tracking UI
✓ Link maintenance tickets to property
✓ Create PropertyMaintenance type
✓ Build maintenance history view
```

**Result:** All records organized by property, not individual

### Phase 4: Historical Reporting (Week 4-5)
**Goal: Complete audit trail and reporting**

```
Tasks:
✓ Create PropertyHistoryEntry for audit
✓ Build complete timeline view
✓ Generate property reports
✓ Export ownership history
✓ Create vacancy tracking
✓ Build revenue reports by property
```

**Result:** Full historical record and comprehensive reports

## Database Schema

### PropertyAssignment Table
```sql
CREATE TABLE property_assignments (
  id UUID PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  role VARCHAR(20) CHECK (role IN ('owner', 'tenant', 'co-owner', 'caretaker')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'transferred')),
  lease_agreement_id UUID,
  assignment_reason VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for fast queries
  INDEX idx_unit_id (unit_id),
  INDEX idx_resident_id (resident_id),
  INDEX idx_active_assignments (unit_id, status, end_date)
);
```

### PropertyPayment Table
```sql
CREATE TABLE property_payments (
  id UUID PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID,
  society_id UUID NOT NULL REFERENCES societies(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) CHECK (status IN ('paid', 'pending', 'overdue')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  notes TEXT,
  month DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_unit_id (unit_id),
  INDEX idx_status (status),
  INDEX idx_month (month)
);
```

## Key Queries

### Get Current Owner of Property
```typescript
const getPropertyOwner = async (unitId: string) => {
  return await db.query(`
    SELECT r.* FROM residents r
    JOIN property_assignments pa ON r.id = pa.resident_id
    WHERE pa.unit_id = $1
    AND pa.role = 'owner'
    AND pa.end_date IS NULL
  `, [unitId])
}
```

### Get Property Complete History
```typescript
const getPropertyHistory = async (unitId: string) => {
  return await db.query(`
    SELECT pa.*, r.name, r.phone, r.email
    FROM property_assignments pa
    JOIN residents r ON pa.resident_id = r.id
    WHERE pa.unit_id = $1
    ORDER BY pa.start_date DESC
  `, [unitId])
}
```

### Get All Properties Owned by Resident
```typescript
const getResidentOwnedProperties = async (residentId: string) => {
  return await db.query(`
    SELECT DISTINCT u.* FROM units u
    JOIN property_assignments pa ON u.id = pa.unit_id
    WHERE pa.resident_id = $1
    AND pa.role = 'owner'
    AND pa.end_date IS NULL
  `, [residentId])
}
```

### Change Assignment (Owner to New Owner)
```typescript
const changePropertyOwner = async (unitId: string, currentOwnerId: string, newOwnerId: string, changeDate: Date) => {
  // Start transaction
  
  // 1. End current assignment
  await db.query(`
    UPDATE property_assignments
    SET end_date = $1, status = 'transferred'
    WHERE unit_id = $2 AND resident_id = $3 AND role = 'owner' AND end_date IS NULL
  `, [changeDate, unitId, currentOwnerId])
  
  // 2. Create new assignment
  await db.query(`
    INSERT INTO property_assignments 
    (unit_id, resident_id, role, start_date, status)
    VALUES ($1, $2, 'owner', $3, 'active')
  `, [unitId, newOwnerId, changeDate])
  
  // Commit transaction
}
```

## UI State Management

```typescript
interface PropertyStore {
  selectedUnitId: string | null
  currentAssignments: PropertyAssignment[]
  assignmentHistory: PropertyAssignment[]
  payments: PropertyPayment[]
  maintenance: PropertyMaintenance[]
  isEditingAssignment: boolean
  selectedAssignment: PropertyAssignment | null
  
  // Actions
  loadPropertyData: (unitId: string) => Promise<void>
  assignResident: (assignment: PropertyAssignment) => Promise<void>
  endAssignment: (assignmentId: string, endDate: Date) => Promise<void>
  getPropertyOwner: () => PropertyAssignment | null
  getPropertyTenant: () => PropertyAssignment | null
  getPropertyHistory: () => PropertyAssignment[]
}
```

## Migration Path

For existing data, here's how to migrate:

```typescript
// 1. For each resident with unitNumber
// 2. Create PropertyAssignment with:
//    - start_date = account creation date (retroactive)
//    - end_date = null (if currently active)
//    - role = based on resident role
//    - status = 'active'

const migrateResidents = async () => {
  const residents = await getOldResidents()
  
  for (const resident of residents) {
    const assignment = {
      unitId: resident.unitId,
      residentId: resident.id,
      role: resident.role,
      startDate: resident.createdAt,
      endDate: null,
      status: 'active'
    }
    
    await createPropertyAssignment(assignment)
  }
}
```

## Benefits Checklist

- ✓ Property is permanent, residents change
- ✓ Complete audit trail of all occupants
- ✓ Financial records tied to property
- ✓ Maintenance history stays with property
- ✓ Easy owner/tenant transitions
- ✓ Multi-ownership support
- ✓ Historical reporting
- ✓ Compliance ready
- ✓ Scalable architecture
- ✓ Clear data relationships
