# Actual Complete System Flows - Gated Community Management

Based on code analysis, here are the ACTUAL flows implemented in the system:

---

## Flow 1: **Society Setup via Resident Signup - Properties Auto-Created** ✅

```
Resident signs up via signup page
    ↓
Resident provides:
  - Name
  - Unit/Property details (villa #, flat #, bungalow #)
  - Phone
  - Email
    ↓
Property record is created automatically in database
    ↓
Resident is assigned to that property
    ↓
Society Admin sees property in their system
    ↓
Admin can now manage that property and create bills for it
```

**Database Entities Involved:**
- `residents` table
- `properties` table (auto-created from resident signup)

**Admin Actions After:**
- View all properties in society
- Create maintenance bills for specific properties
- View all residents assigned to properties

---

## Flow 2: **Maintenance Bill Payment + Admin Confirmation** ✅

```
Society Admin creates Maintenance Bill
    ├─ Specifies: amount, property, due date, bill type
    └─ Bill visible only to residents of that property
    ↓
Resident sees bill in Dashboard
    ├─ Shows: amount due, due date, status (unpaid/pending)
    └─ Can view payment history
    ↓
Resident submits payment
    ├─ Resident provides: payment proof/reference
    └─ Payment status changes to "PENDING CONFIRMATION"
    ↓
Society Admin sees payment in Dashboard
    ├─ Can review payment details
    ├─ Can verify payment received
    └─ Must MANUALLY CONFIRM/MARK AS PAID
    ↓
Admin clicks "Confirm Payment" / "Mark as Paid"
    ↓
Bill status changes to "PAID"
    ↓
Notification sent to Resident
    ↓
Resident Dashboard shows bill as "PAID" ✓
```

**Booking Request States:**
- `pending` - Resident has submitted payment, waiting for admin confirmation
- `approved` - Admin confirmed payment was received
- `paid` - Payment fully processed and confirmed
- `overdue` - Payment due date passed without payment

**Database Entities:**
- `maintenance_bills` table
- `payments` table (tracks payment attempts)
- `billing_records` table (admin's view of collections)

---

## Flow 3: **Complaint Management System** ✅

```
Resident submits Complaint
    ├─ Specifies: issue type, description, priority, location
    └─ Complaint linked to resident's property
    ↓
Notification sent to Society Admin
    ↓
Society Admin Dashboard shows complaint
    ├─ Can view all complaints for the society
    ├─ Can filter by status, priority, property
    └─ Shows: resident name, unit, issue, date submitted
    ↓
Admin can take actions:
    ├─ View complaint details
    ├─ Add internal notes
    ├─ Assign to maintenance staff
    ├─ Update status: Open → In Progress → Resolved
    └─ Add resolution details
    ↓
Resident sees status updates in Dashboard
    ├─ Notification when admin responds
    └─ Can view resolution/completion details
```

**Database Entities:**
- `complaints` table
- `complaint_responses` table (admin notes/updates)

---

## Flow 4: **Visitor Access - Complete Flow** ✅ (CORRECTED)

### Phase 1: **Pre-Approval (Optional)**
```
Resident pre-approves visitor (optional):
    ├─ Enter: visitor name, date, time, reason
    └─ Property: automatically linked to resident's property
    ↓
Pre-approval stored in system
```

### Phase 2: **Visitor Arrival - Watchman Logs**
```
Visitor arrives at gate at specified time
    ↓
Watchman sees visitor at gate
    ↓
Watchman checks if pre-approved
    ├─ If pre-approved: Fetch details from system
    └─ If not pre-approved: Collect visitor details
    ↓
Watchman LOGS visitor (creates log entry):
    ├─ Visitor name
    ├─ Phone number
    ├─ Unit/Property they're visiting
    ├─ Check-in time (current timestamp)
    ├─ Reason for visit
    ├─ Visitor photo (optional)
    └─ Watchman notes
    ↓
Visitor Log entry created in database
    ↓
Status: "LOGGED" (awaiting resident confirmation)
```

### Phase 3: **Resident Gets Notified & Approves/Rejects**
```
NOTIFICATION sent to SPECIFIC RESIDENT (whose property visitor is for)
    ├─ Contains: visitor name, check-in time, reason
    └─ Shows: photos, phone, details
    ↓
Resident receives notification on Dashboard
    ├─ Shows pending visitor logs for their property ONLY
    └─ Can see: Approve or Reject buttons
    ↓
Resident makes decision:
    ├─ APPROVES visitor
    │   └─ Status changes to "APPROVED"
    │   └─ Resident can see: "Approved at [time]"
    │
    └─ REJECTS visitor
        └─ Status changes to "REJECTED"
        └─ Watchman is notified immediately
```

### Phase 4: **Watchman Gets Feedback**
```
Watchman Dashboard updates in real-time
    ├─ Shows visitor logs with resident decisions
    ├─ Each visitor log shows:
    │   ├─ Name
    │   ├─ Unit
    │   ├─ Check-in time
    │   ├─ Resident decision: [APPROVED / REJECTED]
    │   └─ Time of decision
    └─ Watchman can action accordingly:
        ├─ APPROVED: Allow visitor entry
        ├─ REJECTED: Deny entry / Ask visitor to leave
        └─ PENDING: Wait for resident response
```

### Phase 5: **Visitor Check-Out**
```
When visitor is leaving:
    ↓
Watchman logs check-out time
    ├─ Updates: timeOut field
    └─ Records departure time
    ↓
Visitor log now shows:
    ├─ Check-in time
    ├─ Check-out time
    ├─ Duration of visit
    └─ Resident decision history
    ↓
Entry log stored in audit trail
```

**Key Points:**
- Watchman ONLY logs visitors (doesn't approve/reject)
- Residents ONLY approve/reject visitors for THEIR property
- Residents can ONLY see visitors logged for their property
- Watchman can see ALL visitor logs for society
- Notifications are property-specific (only relevant resident notified)
- Status flow: LOGGED → APPROVED/REJECTED → CHECKED OUT

**Database Entities:**
- `visitor_logs` table
- `visitor_approvals` table (resident decisions)

---

## Flow 5: **Emergency Alert System** ✅ (CORRECTED)

```
Watchman encounters emergency/security incident
    ↓
Watchman triggers Emergency Alert
    ├─ Specifies: incident type, location, severity
    └─ Can add photo/video evidence
    ↓
CRITICAL ALERT sent to TWO audiences:
    ├─ Society Admin (PRIMARY)
    │   └─ Immediate notification to admin dashboard
    │   └─ Can view incident details
    │   └─ Can take action (contact authorities, etc)
    │
    └─ ALL RESIDENTS in society (BROADCAST)
        └─ Emergency notification to all resident dashboards
        └─ Shows: incident type, location, severity
        └─ Instructions for residents (shelter in place, etc)
    ↓
Alert logged in audit trail with:
    ├─ Watchman name
    ├─ Time
    ├─ Incident type
    ├─ Location
    └─ Details
    ↓
Admin/Residents can acknowledge alert
    ↓
Alert can be marked as "Resolved" by Admin
```

**Alert Types:**
- `security` - Unauthorized entry, theft, break-in
- `safety` - Fire, accident, health emergency
- `disturbance` - Noise, harassment, incident
- `other` - Custom alert type

**Database Entities:**
- `emergency_alerts` table
- `alert_logs` table (audit trail)

---

## Additional Flows: **Amenity Booking System** ✅

### Phase 1: **Admin Creates Amenities**
```
Society Admin creates Amenity
    ├─ Name: "Community Hall", "Lawn", "Meeting Room", etc
    ├─ Description
    ├─ Cost per booking
    ├─ Capacity (max people)
    ├─ Availability (days/times available)
    └─ Booking duration options
    ↓
Amenities visible in Resident Dashboard
```

### Phase 2: **Resident Books Amenity**
```
Resident browses amenities in Community section
    ↓
Resident selects amenity
    ↓
Resident provides:
    ├─ Booking date
    ├─ Time slot
    ├─ Expected guests
    └─ Purpose/notes
    ↓
Booking request created
    ├─ Status: "PENDING" (waiting for admin approval)
    ├─ Cost shown to resident
    └─ Reference number generated
    ↓
Resident sees success screen:
    ├─ Shows: booking reference number
    ├─ Shows: booking details
    └─ Shows: "Awaiting Admin Approval"
```

### Phase 3: **Admin Reviews & Approves**
```
Society Admin sees booking requests in Dashboard
    ├─ Shows: all pending amenity bookings
    ├─ Shows: resident name, unit, amenity, date, time
    └─ Shows: cost
    ↓
Admin can:
    ├─ APPROVE booking
    │   └─ Status changes to "APPROVED"
    │   └─ Notification sent to resident
    │
    ├─ REJECT booking
    │   └─ Status changes to "REJECTED"
    │   └─ Notification sent to resident (can explain why)
    │
    └─ REQUEST MORE INFO
        └─ Contacts resident for clarification
```

### Phase 4: **Resident Receives Decision**
```
Resident sees notification in Dashboard
    ├─ "Your booking for [Amenity] has been APPROVED/REJECTED"
    └─ Shows: decision date and time
    ↓
If APPROVED:
    ├─ Status changes to "AWAITING PAYMENT"
    ├─ Resident can see: amount to pay
    └─ Resident can submit payment (linked to bill system)
    ↓
If REJECTED:
    ├─ Can see: rejection reason (if provided)
    └─ Can submit new booking request with different date/time
```

### Phase 5: **Payment for Amenity Booking**
```
Resident makes payment for approved booking
    ↓
Payment submitted to Admin
    ↓
Admin sees payment in collections
    ├─ Can verify payment received
    └─ Can confirm payment
    ↓
Admin marks payment as confirmed
    ↓
Booking status changes to "PAID"
    ↓
Resident sees: "Booking Confirmed & Paid"
    ├─ Shows: booking date, time, reference
    └─ Shows: "Ready to use amenity"
```

**Booking States:**
- `pending` - Waiting for admin approval
- `approved` - Admin approved, waiting for payment
- `awaiting-payment` - Approved but payment not received
- `paid` - Payment confirmed, booking confirmed
- `rejected` - Admin rejected booking
- `cancelled` - Resident cancelled booking

**Database Entities:**
- `amenities` table
- `amenity_bookings` table
- `booking_payments` table (linked to main billing)

---

## Flow: **Residents View Society Financial Data** ✅

### What Residents Can See:

```
Resident Dashboard → Financial Section
    ↓
Residents can view READ-ONLY:
    ├─ Total Maintenance Fees Collected (this month, this year)
    ├─ Outstanding/Unpaid Bills
    ├─ Total Residents in Society
    ├─ Breakdown: Paid, Pending, Overdue residents
    ├─ Monthly Collection Graph
    ├─ Revenue sources pie chart:
    │   ├─ Maintenance fees (primary)
    │   ├─ Parking fees (if applicable)
    │   ├─ Amenity booking revenue
    │   └─ Other miscellaneous
    ├─ Expense breakdown pie chart:
    │   ├─ Building maintenance
    │   ├─ Staff salaries
    │   ├─ Utilities
    │   ├─ Security
    │   └─ Amenity maintenance
    ├─ Maintenance fund balance
    ├─ Current projects:
    │   ├─ Terrace waterproofing
    │   ├─ Elevator maintenance
    │   └─ Other ongoing projects
    ├─ Comparison: This year vs Previous year
    └─ Collection efficiency percentage
```

**Key:** All financial data is READ-ONLY for residents. No editing.

**Who Controls This Data:**
- Society Admin creates financial reports
- Society Admin uploads/updates financial data
- Residents can only VIEW
- SuperAdmin can see across all societies

**Database Entities:**
- `financial_data` table
- `financial_reports` table
- `expense_categories` table
- `project_status` table

---

## Authorization Matrix - Complete

| Action | SuperAdmin | Society Admin | Resident | Watchman |
|--------|-----------|---------------|----------|----------|
| **Create Society** | ✅ | ❌ | ❌ | ❌ |
| **Create Admin Account** | ✅ | ❌ | ❌ | ❌ |
| **Create Properties** | N/A | ❌ (auto-created on signup) | ❌ | ❌ |
| **Create Maintenance Bills** | ❌ | ✅ (their society only) | ❌ | ❌ |
| **Confirm Bill Payments** | ❌ | ✅ (their society only) | ❌ | ❌ |
| **View Financial Reports** | ✅ (all) | ✅ (their society) | ✅ (read-only, their society) | ❌ |
| **Create Amenities** | ❌ | ✅ (their society only) | ❌ | ❌ |
| **Approve Amenity Bookings** | ❌ | ✅ (their society only) | ❌ | ❌ |
| **Book Amenities** | ❌ | ❌ | ✅ (their property) | ❌ |
| **Submit Complaint** | ❌ | ❌ | ✅ (about their property) | ❌ |
| **Respond to Complaint** | ❌ | ✅ (their society) | ❌ | ❌ |
| **Pre-Approve Visitor** | ❌ | ❌ | ✅ (for their property) | ❌ |
| **Log Visitor Arrival** | ❌ | ❌ | ❌ | ✅ (all visitors in society) |
| **Approve/Reject Logged Visitor** | ❌ | ❌ | ✅ (for their property ONLY) | ❌ |
| **Trigger Emergency Alert** | ❌ | ❌ | ❌ | ✅ |
| **Receive Emergency Alert** | N/A | ✅ (their society) | ✅ (all, their society) | ❌ |
| **Create Announcements** | ❌ | ✅ (their society) | ❌ | ❌ |
| **View Audit Logs** | ✅ (all) | ✅ (their society) | ❌ | ❌ |
| **Manage Watchmen** | ❌ | ✅ (their society) | ❌ | ❌ |

---

## Property-Specific Authorization - CRITICAL

**Resident can ONLY:**
- See their own property details
- Pay bills for their property
- Submit complaints about their property
- Pre-approve visitors for their property
- Approve/reject visitors logged for their property
- Book amenities (shared across society)
- View their own payment history

**Resident CANNOT:**
- See any other resident's property
- See any other resident's bills
- See any other resident's visitor logs
- View any other resident's complaint
- Approve visitors for other properties
- View other resident's payment history

**Database Query Pattern:**
```
SELECT * FROM visitors 
WHERE property_id = current_resident.property_id
  AND status_date >= today()
```

---

## Data Synchronization Requirements

### Real-Time Sync Needed:
1. **Bill Payment** - When admin confirms, resident dashboard updates instantly
2. **Visitor Approval** - When resident approves, watchman dashboard updates instantly
3. **Complaint Status** - When admin updates, resident sees update immediately
4. **Emergency Alert** - Admin & residents see alert immediately
5. **Amenity Booking Decision** - Resident sees decision immediately
6. **Financial Data** - Residents see updated figures (admin refreshes data)

### Property-Based Filtering:
- Every query must include property_id filter
- Every API response must validate resident owns the property
- Frontend must never show cross-property data

---

## Summary - What Each Dashboard Shows

### **SuperAdmin Dashboard**
- All societies
- All society admins
- Global statistics
- Global audit logs

### **Society Admin Dashboard**
- All residents in their society
- All properties in their society
- All bills created
- Payment confirmations needed
- All amenities
- Booking approvals needed
- All complaints
- All visitor logs (read-only, info only)
- Financial reports for their society
- Announcements
- Watchmen management

### **Resident Dashboard**
- Own property details
- Own bills (view and pay)
- Own complaints (submit and track)
- Own visitor requests (pre-approve and approve)
- Own amenity bookings (book and track)
- Society announcements (read-only)
- Society financial data (read-only)
- Own payment history
- Notifications for all actions

### **Watchman Dashboard**
- All visitor logs for society (check-in/out times)
- Resident approval decisions on visitor logs
- Emergency alerts (receive and acknowledge)
- Blacklist management
- Incident/parcel logs
- Duty logs
- No access to: bills, complaints, financial data, resident personal info

---

This is the ACTUAL system based on code analysis. All flows are now correctly understood with proper authorization and data filtering.
