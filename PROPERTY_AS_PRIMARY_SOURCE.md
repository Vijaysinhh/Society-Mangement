# Property as Primary Source - Architecture Brainstorm

## Core Principle
**PROPERTY IS THE CONSTANT** - Everything else (owners, tenants, payments, maintenance) flows from the property.

```
TRADITIONAL (WRONG):
Resident → has → Property
Problem: When resident leaves, property data is orphaned

CORRECT (NEW):
Property → has → Residents (with roles and time periods)
Property → has → Payment Records
Property → has → Maintenance History
Property → has → Documents/Lease
```

## Why Property as Primary?

### Problem with Current Model
```
Current:
- Resident table stores: name, phone, email, role, paymentStatus
- If Priya (Tenant in B-202) leaves, what happens to B-202?
- Data is fragmented

What we need:
- Property B-202 persists forever
- Priya's assignment to B-202 has dates: 2023-01-15 to 2024-01-14
- New tenant assigned: 2024-01-15 onwards
- Property history is complete and traceable
```

### Benefits
1. **Historical Data** - Know every owner/tenant a property had
2. **Financial Tracking** - All payments linked to property, not resident
3. **Maintenance** - All repairs/maintenance tracked to property
4. **Owner Turnover** - When owner changes, property data intact
5. **Tenant Turnover** - When tenant changes, property records stay
6. **Audit Trail** - Complete history for compliance
7. **Reports** - "Which properties have highest complaints?" "Revenue per property"
8. **Multi-unit** - Handle properties with co-owners or multiple spaces

## New Data Model

### Property (Primary Entity)
```typescript
interface Property {
  id: string                           // P-001, P-002 (unique)
  societyId: string                    // Which society/building
  unitNumber: string                   // A-101, B-202, C-301
  floor: number                        // 1, 2, 3
  type: 'residential' | 'commercial'   // Type
  area: number                         // Sq ft
  registryNumber?: string              // Legal/registry number
  createdAt: Date                      // When property was added
  
  // Financial
  monthlyRent?: number                 // Base rent
  deposit?: number                     // Security deposit amount
  taxValue?: number                    // Property tax
  
  // Current Status (derived from assignments)
  currentOwnerId?: string              // Current owner ID
  currentTenantId?: string             // Current tenant ID
  status: 'vacant' | 'occupied' | 'maintenance'
  
  // Metadata
  documents?: string[]                 // IDs of deed, lease docs
  notes?: string                       // Admin notes
}

interface PropertyAssignment {
  id: string
  propertyId: string                   // Link to property
  residentId: string                   // Which resident
  role: 'owner' | 'tenant' | 'co-owner'
  
  // Timeline
  startDate: Date                      // When they took over
  endDate?: Date                       // When they left (null = current)
  
  // Assignment Details
  leaseAgreement?: string              // Document ID
  assignmentReason?: 'purchase' | 'rental' | 'inheritance' | 'transfer'
  
  // Status
  status: 'active' | 'completed' | 'transferred'
  
  // Metadata
  notes?: string
  createdAt: Date
}

interface Resident {
  id: string
  name: string
  phone: string
  email: string
  avatar: string
  
  // Removed from resident:
  // - unitNumber (now in PropertyAssignment)
  // - role (now in PropertyAssignment - can have multiple)
  // - paymentStatus (now linked to property)
  
  // Dates
  createdAt: Date
  updatedAt: Date
}

interface PaymentRecord {
  id: string
  propertyId: string                   // Link to property, not resident
  residentId?: string                  // Who paid (for receipt)
  month: Date                          // Which month
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: Date
  paidDate?: Date
  method: 'cash' | 'upi' | 'bank' | 'cheque'
  notes?: string
}
```

## Real-World Scenario

### Scenario: B-202 Property History

**2023-01-15:** Rajesh Kumar (Owner) purchases B-202
```
PropertyAssignment:
- residentId: rajesh_001
- role: owner
- startDate: 2023-01-15
- endDate: null (current)
```

**2023-02-01:** Rajesh rents to Priya Sharma
```
PropertyAssignment:
- residentId: priya_002
- role: tenant
- startDate: 2023-02-01
- endDate: null (current)
```

**2024-01-14:** Priya's lease ends
```
PropertyAssignment for Priya:
- endDate: 2024-01-14 (MARKED AS ENDED)
```

**2024-01-15:** New tenant Neha Verma moves in
```
PropertyAssignment:
- residentId: neha_003
- role: tenant
- startDate: 2024-01-15
- endDate: null (current)
```

**2024-06-01:** Rajesh sells to Amit Patel (New Owner)
```
PropertyAssignment for Rajesh:
- endDate: 2024-06-01 (MARKED AS ENDED)

PropertyAssignment for Amit:
- residentId: amit_004
- role: owner
- startDate: 2024-06-01
- endDate: null (current)
```

### Property View (Complete History)
```
B-202 - 3 BHK, 1000 Sq Ft

OWNERS:
- Rajesh Kumar (Jan 2023 - May 2024) ✓ Transferred
- Amit Patel (Jun 2024 - Present) ✓ Current

TENANTS:
- Priya Sharma (Feb 2023 - Jan 2024) ✓ Completed
- Neha Verma (Jan 2024 - Present) ✓ Current

PAYMENT HISTORY:
- 24 payments tracked
- Revenue: ₹6,00,000
- All linked to property, regardless of who paid

MAINTENANCE LOG:
- 15 entries
- Total spent: ₹25,000
- All linked to property

DOCUMENTS:
- Deed (uploaded)
- Lease with Neha (active)
- Previous lease with Priya (archived)
```

## Data Flow Diagram

```
SOCIETY
  ├── Property P-001 (A-101)
  │   ├── PropertyAssignment (Role: Owner)
  │   │   ├── Resident: Rajesh (2023-01-15 to present)
  │   │   └── Links to Rajesh's record for name, phone, email
  │   ├── PropertyAssignment (Role: Tenant)
  │   │   ├── Resident: Priya (2023-02-01 to 2024-01-14)
  │   │   └── Completed - moved out
  │   ├── PropertyAssignment (Role: Tenant)
  │   │   ├── Resident: Neha (2024-01-15 to present)
  │   │   └── Current tenant
  │   ├── PaymentRecords (100 records)
  │   │   ├── Linked to Property (not individual resident)
  │   │   └── Who paid tracked separately
  │   ├── MaintenanceRecords (25 records)
  │   │   └── All repairs/issues for this unit
  │   └── Documents (5 files)
  │       ├── Deed
  │       ├── Current lease
  │       └── Previous leases
  │
  ├── Property P-002 (B-201)
  │   ├── PropertyAssignment...
  │   └── ...
  │
  └── Property P-003 (B-202)
      ├── PropertyAssignment...
      └── ...
```

## Key Queries Made Easy

### "Show me all residents in B-202"
```sql
SELECT r.* FROM Resident r
JOIN PropertyAssignment pa ON r.id = pa.residentId
JOIN Property p ON pa.propertyId = p.id
WHERE p.unitNumber = 'B-202'
AND pa.endDate IS NULL
```

### "Show me B-202 payment history"
```sql
SELECT * FROM PaymentRecord
WHERE propertyId = (SELECT id FROM Property WHERE unitNumber = 'B-202')
ORDER BY month DESC
```

### "Which properties are vacant?"
```sql
SELECT * FROM Property
WHERE currentTenantId IS NULL
AND status = 'vacant'
```

### "Show all properties owned by Rajesh"
```sql
SELECT DISTINCT p.* FROM Property p
JOIN PropertyAssignment pa ON p.id = pa.propertyId
WHERE pa.residentId = 'rajesh_001'
AND pa.role = 'owner'
AND pa.endDate IS NULL
```

### "Property B-202 complete history"
```sql
SELECT p.*, pa.*, r.name, r.phone
FROM Property p
LEFT JOIN PropertyAssignment pa ON p.id = pa.propertyId
LEFT JOIN Resident r ON pa.residentId = r.id
WHERE p.unitNumber = 'B-202'
ORDER BY pa.startDate DESC
```

## UI Components Needed

### 1. Property Card (Owner's Dashboard)
```
┌─────────────────────────────────┐
│ A-101 (3 BHK) - 1000 Sq Ft      │
├─────────────────────────────────┤
│ Owner: Rajesh Kumar (Since 2023) │
│ Tenant: Neha Verma (Active)     │
│                                 │
│ Monthly Revenue: ₹6,500         │
│ This Month: Paid ✓              │
│                                 │
│ [History] [Edit] [Maintenance]  │
└─────────────────────────────────┘
```

### 2. Property Assignment Modal
```
ASSIGN RESIDENT TO PROPERTY

Property: [B-202] ▼
Resident: [Select...] ▼
Role: [Owner / Tenant] ▼
Start Date: [2024-06-01] 📅
End Date: [Optional] 📅
Lease Agreement: [Upload] 📎

[Cancel] [Assign]
```

### 3. Property History Timeline
```
B-202 HISTORY

┌─ 2024-06-01 ─────────────────┐
│ Amit Patel (OWNER) - Active  │
│ Purchased from Rajesh Kumar  │
└──────────────────────────────┘

┌─ 2024-01-15 ─────────────────┐
│ Neha Verma (TENANT) - Active │
│ Lease expires: 2025-01-14    │
└──────────────────────────────┘

┌─ 2023-02-01 ─────────────────┐
│ Priya Sharma (TENANT) - ENDED │
│ Vacated: 2024-01-14          │
└──────────────────────────────┘

┌─ 2023-01-15 ─────────────────┐
│ Rajesh Kumar (OWNER) - ENDED  │
│ Sold to Amit Patel           │
└──────────────────────────────┘
```

## Implementation Path

### Phase 1 (Week 1): Property Core
- Create Property table
- Create PropertyAssignment table
- Add UI to show current owner/tenant
- Display property history timeline
- Update ResidentsMobile to show properties

### Phase 2 (Week 2): Assignment Flow
- Build "Assign Resident" UI
- Implement assignment logic
- Handle role changes
- Track dates and reasons
- Validate assignments

### Phase 3 (Week 3): Historical & Reporting
- Timeline view of property changes
- Complete audit trail
- Revenue reports by property
- Occupancy tracking
- Admin override capabilities

## Migration Strategy

### From Old to New
```
OLD DATA:
Resident: { id, name, phone, unitNumber, role }

NEW STRUCTURE:
1. Create Property for each unique unitNumber
2. Create PropertyAssignment linking Resident to Property
3. Set startDate to when system started (retroactive)
4. Mark as "historical" if they have endDate

Example:
- Old: Rajesh { unitNumber: 'A-101', role: 'owner' }
- New:
  - Property { id: 'p1', unitNumber: 'A-101' }
  - PropertyAssignment { propertyId: 'p1', residentId: 'r1', role: 'owner', startDate: 2024-01-01 }
```

## Benefits Summary

| Feature | Old Model | New Model |
|---------|-----------|-----------|
| Track property history | ❌ No | ✅ Yes |
| Handle role changes | ❌ Limited | ✅ Easy |
| Financial tracking | ⚠️ By resident | ✅ By property |
| Tenant turnover | ❌ Data loss | ✅ Preserved |
| Owner turnover | ❌ Orphaned data | ✅ Clean transfer |
| Multi-ownership | ❌ Not supported | ✅ Supported |
| Audit trail | ❌ None | ✅ Complete |
| Reporting | ⚠️ Limited | ✅ Comprehensive |

## Decision Points

**Q1: Should we allow co-owners?**
- A: Yes - PropertyAssignment handles it (multiple owners for same property)

**Q2: What if owner and tenant have same email?**
- A: Each gets unique Resident ID, linked via PropertyAssignment

**Q3: How to handle disputes about who "left"?**
- A: Admin can update endDate with reason - creates audit trail

**Q4: Should tenants see owner info?**
- A: Yes, via PropertyAssignment link - but limited fields (phone, email only)

**Q5: Multiple properties per person?**
- A: Yes - query all PropertyAssignments for that residentId

## Next Steps

1. Update data model in types/index.ts
2. Create migration script
3. Update ResidentsMobile component
4. Build Property view component
5. Build assignment workflow
6. Create history timeline view
