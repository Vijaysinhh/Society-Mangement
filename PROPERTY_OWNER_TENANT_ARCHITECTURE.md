# Property → Owner → Tenant Relationship Architecture

## Current State Analysis
- **Unit** is the core property entity (flat, bungalow, row-house)
- **Resident** tracks individual residents (Owner or Tenant role)
- **Rental** tracks rental relationships between residents and units
- No direct link from Resident to Unit in the Resident interface

---

## Proposed Solution: Owner Creates & Invites Tenant Flow

### Option 1: Direct Owner-Tenant Linking (Recommended for Simplicity)
**Flow:**
1. **Owner Registration/Dashboard**
   - Owner creates account with their unit number (property)
   - Owner sees their unit details
   - Owner can add/invite tenants to their property

2. **Tenant Invitation Flow**
   - Owner generates invitation link/code for their unit
   - Tenant receives invitation (email/SMS with code)
   - Tenant creates account with code attached to owner's unit
   - System creates Unit → Resident link for tenant

3. **Data Structure Changes Needed:**
```typescript
interface Resident {
  id: string
  unitNumber: string
  name: string
  phone: string
  email: string
  role: 'Owner' | 'Tenant'
  ownerId?: string  // If tenant, link to owner's resident ID
  invitationCode?: string
  invitedBy?: string
  relationType?: 'owner-occupied' | 'rented' | 'shared'
}

interface Unit {
  id: string
  ownerId: string // Primary owner resident ID
  tenantIds: string[] // Array of tenant resident IDs
  currentOccupants: 'owner-only' | 'tenant-only' | 'owner-and-tenant'
}

interface TenantInvitation {
  id: string
  code: string
  unitId: string
  ownerId: string
  ownerName: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: Date
  expiresAt: Date
  tenantEmail?: string
  tenantPhone?: string
}
```

### Option 2: Hierarchical Property Management
**Flow:**
1. Owner creates/registers property first (before resident account)
2. Property shows: Address, Unit Number, Type, Value
3. Owner links their account to property
4. Owner can add tenant(s) to the same property
5. System maintains property-centric view

**Advantages:**
- Property exists independent of residents
- Multiple tenants can rotate without property recreation
- Better for tracking property assets long-term

---

## Implementation Steps

### Phase 1: Owner Registration & Dashboard
**Page:** `/owner/properties`
- Owner sees owned properties (units)
- Can edit property details
- Can view current tenant(s) if any
- Button: "Invite Tenant"

### Phase 2: Tenant Invitation System
**Components:**
1. **Invite Tenant Modal**
   - Owner enters tenant email/phone
   - System generates invitation code
   - Email/SMS sent to tenant

2. **Tenant Acceptance Flow**
   - Tenant clicks link in email with code
   - Page: `/join-property/{invitationCode}`
   - Tenant fills signup form
   - Account created, linked to owner's unit

### Phase 3: Multi-Tenant Support
**Features:**
- Same property can have multiple registered tenants (for shared flats)
- Owner can set tenant permissions (view-only, edit, etc.)
- Tenant can see property details, shared expenses, announcements
- Payment tracking separate for owner vs tenant

### Phase 4: Tenant Management UI
**Admin Dashboard:**
- View owner-tenant relationships
- Manually link/unlink tenants to properties
- Track tenure periods
- View payment status per resident

---

## Database Changes Required

### Add to Resident table:
- `ownerId` (foreign key to another Resident)
- `linkedUnits` (array of unit IDs for owners)
- `invitationStatus` (for pending tenants)

### Add to Unit table:
- `ownerId` (primary owner)
- `tenants` (array of tenant IDs)
- `occupancyType` (owner-only, tenant-only, shared)
- `lastModified` (track changes)

### New table: TenantInvitations
- Code (unique)
- Status (pending/accepted/expired)
- ExpiresAt
- Email/Phone
- OwnerDetails

---

## UI/UX Workflow

### Owner Dashboard Flow:
```
My Properties
├── Property 1 (Unit A-101)
│   ├── Status: Occupied by Me (Owner)
│   ├── Current Tenant: None
│   ├── [+ Invite Tenant]
│   └── Property Details (Edit)
├── Property 2 (Unit B-202)
│   ├── Status: Rented to Tenant
│   ├── Current Tenant: Priya Sharma
│   ├── [Change Tenant] [Remove Tenant]
│   └── Property Details (Edit)
```

### Tenant Dashboard Flow:
```
My Rented Properties
├── Property A-101
│   ├── Owner: Rajesh Kumar
│   ├── Duration: 2023-2024
│   ├── [View Owner Details] [Contact Owner]
│   └── Payment Status: Pending
```

### Admin Dashboard Flow:
```
Property-Tenant Mapping
├── A-101 (Owner: Rajesh Kumar)
│   ├── Current Tenant: Priya Sharma (linked 2024)
│   ├── Payment: 50% Owner, 50% Tenant
│   └── [View Details] [Modify Mapping]
```

---

## Benefits of This Approach

✅ **Owner Control:** Owner decides who accesses their property
✅ **Secure:** Invitation code ensures only intended tenants join
✅ **Scalable:** Same unit can have multiple tenants over time
✅ **Trackable:** Clear audit trail of who occupied what property
✅ **Payment Split:** Can track payments per resident type
✅ **Privacy:** Tenants see only their rented property details

---

## Implementation Priority

1. **Quick Win:** Add `ownerId` to Resident, update Residents page to show owner/tenant linking
2. **Medium Effort:** Build invitation system with email/SMS
3. **Full Feature:** Complete tenant management dashboard for owners
4. **Polish:** Payment split, permissions, audit logs

