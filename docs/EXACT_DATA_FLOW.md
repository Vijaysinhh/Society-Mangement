# Complete Data Flow & Database Schema Analysis

## What's ACTUALLY Built

### Frontend Data Structures (TypeScript Types in /types/index.ts)

#### 1. **Society**
```
Society {
  id, name, address, city, state, phone, contactPerson
  admins[], totalResidents, totalWatchmen
  villas, bungalows, flats, occupiedUnits
  status: 'active' | 'paused'
  todayVisitors, weekVisitors
  emergencyContactName, emergencyContactPhone
}
```
- **Where Created**: CreateSocietyForm (Superadmin Dashboard)
- **Data Input**: Name, address, city, state, phone, contact person, property counts
- **API Call**: POST /api/societies
- **Current Status**: Saved to localStorage + DataContext, needs DB persistence

#### 2. **Unit (Property/Flat/Villa)**
```
Unit {
  id, societyId, unitType, unitNumber, floor
  status: 'occupied' | 'empty' | 'rented' | 'maintenance'
  residentId, rentalInfo, propertyValues
  residents[], vehicles[]
  createdAt, updatedAt
}
```
- **Where Created**: When society is created (auto-generated based on villas/bungalows/flats count)
- **Data Flow**: Superadmin specifies "100 flats" → System generates Unit records
- **Current Status**: NOT yet created/stored

#### 3. **Resident**
```
Resident {
  id, name, email, phone, societyId, unitId, createdAt
}
```
- **Where Created**: Society Admin creates from dashboard
- **Multi-device Access**: Same email + password = can login on any device (shares JWT token)
- **Current Status**: Designed but not yet implemented

#### 4. **Watchman**
```
Watchman {
  id, name, phone, societyId
  shift: 'morning' | 'evening' | 'night'
  createdAt
}
```
- **Where Created**: Society Admin creates from dashboard with credentials
- **Login**: Uses `/{societyName}/watchman/login` with given credentials
- **Current Status**: Designed but not yet implemented

#### 5. **Visitor**
```
Visitor {
  id, name, phone, purpose, societyId, residentId
  checkInTime, checkOutTime
  status: 'checked-in' | 'checked-out'
  photo?, approvalStatus?, approvedBy?, approvalTime?  <-- NEEDS ADDITION
}
```
- **Where Created**: Watchman at gate creates when visitor arrives
- **Approval Flow**: 
  - Watchman captures photo at gate
  - Sends notification to resident 
  - Resident approves/denies photo
  - Watchman checks status before allowing entry
- **Current Status**: Basic structure exists, photo approval flow INCOMPLETE

#### 6. **PropertyPayment (Billing)**
```
PropertyPayment {
  id, unitId, residentId, societyId
  amount, paymentType: 'rent' | 'maintenance' | 'tax' | 'other'
  dueDate, paidDate
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod, transactionId, month
  notes, createdAt, updatedAt
}
```
- **Where Used**: FinancialManagement component in Resident Dashboard
- **Data Flow**: 
  1. Society Admin creates bills per property/resident
  2. Resident views in FinancialManagement component
  3. Resident makes payment → triggers PropertyPayment record
  4. System updates Bill status to 'paid'
- **Current Status**: Frontend UI complete, backend logic exists but not persisted to DB

#### 7. **PropertyMaintenance (Complaints)**
```
PropertyMaintenance {
  id, unitId, societyId
  reportedBy, category, description
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  estimatedCost, actualCost
  assignedTo, startDate, completionDate
  createdAt, updatedAt
}
```
- **Where Created**: SmartIssueForm in Resident Dashboard
- **Data Flow**: Resident reports issue → Society Admin assigns vendor → Status updates
- **Current Status**: Frontend form complete, backend storage MISSING

#### 8. **ActivityLog**
```
ActivityLog {
  id, type, description, timestamp
  societyId, userId, actionBy, actionByRole
}
```
- **Types**: visitor-check-in, visitor-check-out, society-created, admin-added, resident-added, etc.
- **Where Logged**: Every major action across system
- **Purpose**: Audit trail, analytics
- **Current Status**: Type definitions exist, logging logic INCOMPLETE

---

## Current Data Flow (Frontend Only)

### Superadmin Flow:
```
1. Superadmin Login (/superadmin-login)
   ↓ (JWT token generated, societyId='superadmin')
2. Superadmin Dashboard (/superadmin-dashboard)
   ↓ CreateSocietyForm component
3. Input: Society data (name, properties count, contact)
   ↓ POST /api/societies
4. Response: Society object
   ↓ Saved to DataContext + localStorage
5. Society appears in SocietiesTab
   ↓ SocietyCard shows: name, total residents, total watchmen, visitors
   ↓ (ALL THIS DATA IS MOCKED - not real!)
```

### Society Admin Flow:
```
1. Society Admin Login (/{societyName}/societyadmin/login)
   ↓ (JWT token: {userId, societyId, role: 'societyadmin'})
2. Society Admin Dashboard (/{societyName}/societyadmin/dashboard)
   ↓ Multiple tabs: residents, watchmen, units, billing, complaints
3. Create Resident:
   ↓ Input: email, name, phone → POST /api/residents
   ↓ Resident gets login URL: /{societyName}/resident/login
4. Create Watchman:
   ↓ Input: email, name, phone, shift → POST /api/watchmen
   ↓ Watchman gets credentials for /{societyName}/watchman/login
5. View Billing:
   ↓ Shows bills per resident (all mocked data currently)
```

### Resident Flow:
```
1. Signup (from link provided by Society Admin)
   ↓ Registers email + password
2. Resident Login (/{societyName}/resident/login)
   ↓ (JWT token: {userId, societyId, residingUnitId, role: 'resident'})
   ↓ Token stored in localStorage (multi-device access enabled)
3. Resident Dashboard (/{societyName}/resident/dashboard)
   ↓ Multiple sections:
     - ActionRequired: pending approvals
     - VisitorsAtGate: watchman sends visitor photo → approval flow
     - FinancialDashboard: bills, payments, history
     - MaintenanceTickets: submit complaints
     - Announcements: society-wide messages
     - Community: messaging with other residents
```

### Watchman Flow:
```
1. Watchman Login (/{societyName}/watchman/login)
   ↓ (JWT token: {userId, societyId, shift, role: 'watchman'})
2. Watchman Dashboard (/{societyName}/watchman/dashboard)
   ↓ Main task: Gate Management (check visitors)
3. Visitor Arrives:
   ↓ Watchman: Capture photo, scan ID/purpose
   ↓ POST /api/visitors (with photo)
   ↓ System: Send notification + photo to resident
4. Resident Approves:
   ↓ Visitor status → 'approved'
   ↓ Watchman sees update → allows entry
5. Visitor Leaves:
   ↓ Watchman: Mark checkout
   ↓ PUT /api/visitors/{id} (checkOutTime)
```

---

## Frontend → Backend Data Transfer Points

### Currently MISSING DB Tables (Need to Create):

| Table | Purpose | Created By | Read By | Current Status |
|-------|---------|-----------|---------|-----------------|
| **societies** | Store society data | Superadmin | Superadmin, Society Admin | ❌ MISSING |
| **units** | Store properties/flats/villas | Auto-generated | All | ❌ MISSING |
| **residents** | Store resident accounts | Society Admin | Resident, Society Admin | ❌ MISSING |
| **watchmen** | Store watchman accounts | Society Admin | Watchman, Society Admin | ❌ MISSING |
| **visitors** | Store visitor records + photos | Watchman | Watchman, Resident | ⚠️ PARTIAL |
| **visitor_approvals** | Track photo approval flow | Resident | Watchman, Society Admin | ❌ MISSING |
| **property_payments** | Store billing records | Society Admin | Resident, Society Admin | ❌ MISSING |
| **property_maintenance** | Store complaints/maintenance | Resident | Resident, Society Admin | ❌ MISSING |
| **activity_logs** | Audit trail | System | Superadmin, Society Admin | ❌ MISSING |
| **announcements** | Store society announcements | Society Admin | All | ❌ MISSING |

---

## Data Dependencies (What Needs What)

```
Superadmin
    ↓
    └─→ Society
         ├─→ Units (auto-generated: totalFlats + totalVillas + totalBungalows)
         │    ├─→ PropertyPayments (per unit monthly)
         │    ├─→ PropertyMaintenance (repairs, issues)
         │    └─→ PropertyAssignments (owner/tenant/caretaker)
         │
         ├─→ SocietyAdmins (invited by Superadmin)
         │
         ├─→ Residents (created by SocietyAdmin, linked to Units)
         │    ├─→ Visitor approvals (resident approves photos)
         │    ├─→ MaintenanceTickets (resident reports)
         │    ├─→ Announcements (resident receives)
         │    └─→ Messages (resident sends/receives)
         │
         ├─→ Watchmen (created by SocietyAdmin)
         │    ├─→ Visitors (watchman logs at gate)
         │    ├─→ Check-ins (watchman records)
         │    └─→ Shifts (morning/evening/night)
         │
         └─→ ActivityLogs (system tracks all actions)
```

---

## What You Specifically Asked For:

### 1. "Understand frontend what data is creating and each dashboard data transfer or exchange"

**Superadmin Dashboard Creates:**
- Society objects → POST /api/societies
- Admin invitations → POST /api/admins/invite

**Society Admin Dashboard Creates:**
- Residents → POST /api/residents
- Watchmen → POST /api/watchmen
- Units/Properties → Auto-created when society created
- Announcements → POST /api/announcements
- Billing records → POST /api/payments/create-bill

**Resident Dashboard Creates:**
- Visitor approvals → PUT /api/visitors/{id}/approve
- Maintenance tickets → POST /api/maintenance/create-ticket
- Payments → POST /api/payments/record-payment
- Messages → POST /api/messages/send

**Watchman Dashboard Creates:**
- Visitor check-ins → POST /api/visitors
- Visitor check-outs → PUT /api/visitors/{id}/checkout
- Shift records → PUT /api/watchmen/{id}/shift

### 2. "Are dumb i never build functionality to track rent is dumb question..."

You're right - I see now:
- **PropertyPayment** table has `paymentType: 'rent' | 'maintenance' | 'tax' | 'other'`
- Rent is tracked per unit, per resident
- Bills show maintenance, electricity, water, parking separately
- Overdue tracking with late fees is built

### 3. "Push" for notifications:
- Push notifications needed for:
  - Visitor photo approvals (resident)
  - Maintenance ticket updates (resident)
  - Bill due notifications (resident)
  - Shift assignments (watchman)
  - System alerts (superadmin)

---

## Critical Database Tables to Create (Priority Order)

### Phase 1 (Week 1): Core Tables
1. `societies` - Foundation everything else depends on
2. `units` - Auto-generated from society
3. `residents` - Residents table

### Phase 2 (Week 1-2): User Management  
4. `watchmen` - Watchman accounts
5. `users` - Superadmin + Society Admin accounts

### Phase 3 (Week 2): Visitors & Gate Management
6. `visitors` - Visitor check-in/out logs
7. `visitor_approvals` - Photo approval tracking

### Phase 4 (Week 2-3): Financial & Maintenance
8. `property_payments` - Billing + rent tracking
9. `property_maintenance` - Complaints/tickets

### Phase 5 (Week 3): Audit & Messaging
10. `activity_logs` - Audit trail
11. `announcements` - Society communications
12. `messages` - Resident-to-resident messaging

---

## Next Steps:

1. **Confirm this matches your vision** - Do the tables and data flows make sense?
2. **Finalize payment types** - Just rent/maintenance or need more?
3. **Notification channels** - Email only? SMS? Push? In-app?
4. **Custom URLs** - Already designed, generates `/{societyName}/resident/login` etc
5. **Ready for SQL migration?** - Once we finalize, I'll generate Supabase migration SQL

