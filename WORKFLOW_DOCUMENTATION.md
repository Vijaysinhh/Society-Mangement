# DETAILED WORKFLOW DOCUMENTATION

This document describes every major workflow in the Society Management System with step-by-step flows, data changes, and integration points.

---

## WORKFLOW 1: VISITOR LOGGING & APPROVAL

### User Roles: Watchman, Resident (NOT Admin)

### The Correct Flow:
```
WATCHMAN LOGS VISITOR AT GATE → WATCHMAN RECORDS DETAILS → 
RESIDENT CONFIRMS/DENIES → WATCHMAN APPROVES/REJECTS → ENTRY ALLOWED/BLOCKED
```

### Step-by-Step Flow:

**Stage 1: WATCHMAN LOGS VISITOR AT GATE**
1. Visitor arrives at society gate
2. Watchman opens VisitorApprovals tab in resident dashboard (Watchman has access)
3. Clicks "Log New Visitor"
4. Enters:
   - Visitor name
   - Phone number
   - Purpose (Meeting, Delivery, Maintenance, Other)
   - Expected arrival time
   - Expected departure time
   - Vehicle details (if any)
   - Number of people
5. Watchman takes visitor photo (optional)
6. Submits
7. Status: **PENDING** (Waiting for resident confirmation)

**Data Created:**
```javascript
{
  id: "visitor-123",
  name: "John Doe",
  phone: "9876543210",
  purpose: "Meeting",
  vehicle: { number: "MH-02-AB-1234", color: "White" },
  people: 1,
  arrival: "2024-03-30 10:00",
  departure: "2024-03-30 11:00",
  loggedAt: "2024-03-30 09:55",
  loggedBy: "Rajesh (Watchman)",
  status: "pending",
  notes: "Verified by phone",
  photo: "photo-url"
}
```

**Stage 2: RESIDENT CONFIRMS VISITOR**
1. Resident gets notification (or checks Visitors tab)
2. Sees visitor details logged by watchman
3. Resident decides:
   - "Yes, I'm expecting this person" → CONFIRM
   - "No, I don't know this person" → DENY
4. If confirmed:
   - Resident clicks "Approve"
   - Watchman is notified → Can allow entry
5. If denied:
   - Resident clicks "Reject"
   - Watchman is notified → Entry blocked

**Data Updated (if resident confirms):**
```javascript
{
  status: "approved",
  approvedBy: "resident-456",
  approvedAt: "2024-03-30 10:00",
}
```

**Data Updated (if resident rejects):**
```javascript
{
  status: "rejected",
  rejectedBy: "resident-456",
  rejectedAt: "2024-03-30 09:57",
  notes: "Not identified by resident"
}
```

**Stage 3: WATCHMAN TAKES ACTION**
1. Watchman sees approval/rejection status
2. If approved:
   - Watchman allows visitor entry
   - Marks entry time
3. If rejected:
   - Watchman denies entry
   - Informs visitor visitor not authorized

**Stage 4: RECURRING VISITORS (WHITELIST)**
1. For frequent visitors (maid, vendor, etc.)
2. Watchman can mark as "Recurring"
3. Resident whitelist them
4. Future visits skip confirmation step

### Status Flow Diagram:
```
PENDING → APPROVED → [Entry Allowed] → Visitor leaves
              ↓
          REJECTED → [Entry Denied]
```

### Key Differences from Wrong Workflow:
- ❌ NOT: Resident requests → Admin approves
- ✓ YES: Watchman logs → Resident confirms → Watchman allows

- ❌ NOT: Admin is gatekeeper
- ✓ YES: Resident + Watchman decide entry

- ❌ NOT: Resident creates visitor pass
- ✓ YES: Watchman logs existing visitor at gate

### Data Structure:
```typescript
Visitor {
  id: string
  name: string
  phone: string
  purpose: string
  vehicle?: { number: string, color: string }
  people: number
  arrival: DateTime
  departure: DateTime
  loggedAt: DateTime
  loggedBy: string // Watchman name
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  photo?: string
}
```

### Data Integrations:
- Watchman dashboard: Log visitors, see approvals
- Resident dashboard: Confirm/deny visitors, see history
- System tracks: Visitor frequency, recurring visitors, whitelist
- No admin involvement in approval process

---

## WORKFLOW 2: MAINTENANCE/ISSUE REPORTING

### User Roles: Resident, Admin, Technician

### Step-by-Step Flow:

**Stage 1: RESIDENT REPORTS ISSUE**
1. Resident opens Issues tab
2. Clicks "Report New Issue"
3. Selects issue type:
   - Plumbing
   - Electrical
   - Carpentry
   - Painting
   - General Maintenance
   - Other
4. Fills details:
   - Title/Subject
   - Description (detailed)
   - Location (unit + specific area)
   - Priority (Low, Medium, High, Urgent)
   - Photos (optional)
5. Submits
6. Status: **SUBMITTED**

**Data Created:**
```javascript
{
  id: "issue-001",
  residentId: "resident-456",
  type: "Plumbing",
  title: "Water leak in kitchen",
  description: "Tap is leaking continuously",
  location: "A-101, Kitchen",
  priority: "High",
  photos: ["photo-url-1", "photo-url-2"],
  status: "submitted",
  createdAt: "2024-03-29T14:30:00Z",
  assignedTo: null,
  completedAt: null,
  cost: null,
  estimatedCompletion: null
}
```

**Stage 2: ADMIN REVIEWS & ASSIGNS**
1. Admin sees new issues in Issues tab
2. Prioritizes and reviews:
   - Is it valid?
   - What priority?
   - Which technician?
3. Clicks issue to open details
4. Assigns to technician:
   - Sets estimated completion date
   - Sets priority level
   - Can add notes
5. Status: **ASSIGNED**
6. Resident notified: "Your issue was assigned to technician [name]"

**Data Updated:**
```javascript
{
  status: "assigned",
  assignedTo: "technician-555",
  assignedAt: "2024-03-29T15:00:00Z",
  estimatedCompletion: "2024-03-31",
  adminNotes: "High priority - water damage risk"
}
```

**Stage 3: TECHNICIAN WORKS ON ISSUE**
1. Technician sees assigned issues in dashboard
2. Arrives at unit
3. Works on fix
4. Takes completion photos
5. Updates status: **IN-PROGRESS** or **COMPLETED**
6. Adds notes: "Replaced tap washer, fixed leak"
7. If completed, marks **DONE**

**Data Updated:**
```javascript
{
  status: "completed",
  completedAt: "2024-03-30T11:00:00Z",
  completionNotes: "Replaced tap washer, fixed leak",
  completionPhotos: ["photo-url-3", "photo-url-4"],
  workHours: 1.5,
  partsCost: 250
}
```

**Stage 4: ADMIN REVIEWS COMPLETION**
1. Admin sees completed work
2. Reviews photos and notes
3. Can either:
   - **APPROVE**: Mark as complete
   - **REQUEST REVISION**: Send back to technician
4. If approved:
   - Status: **RESOLVED**
   - Cost recorded (if any)
   - Resident notified: "Your issue was resolved"

**Data Updated:**
```javascript
{
  status: "resolved",
  approvedBy: "admin-789",
  approvedAt: "2024-03-30T16:00:00Z",
  totalCost: 250
}
```

**Stage 5: RESIDENT CONFIRMS**
1. Resident sees issue marked resolved
2. Can rate the work (1-5 stars)
3. Can add feedback/comment
4. Once confirmed: **CLOSED**

### Status Flow Diagram:
```
SUBMITTED → ASSIGNED → IN-PROGRESS → COMPLETED → APPROVED → RESOLVED → CLOSED ✓
                ↓                                      ↓
            ON-HOLD                            REVISION-REQUESTED
```

### Data Integrations:
- Resident dashboard: Can see all their issues
- Admin dashboard: Manages queue, assigns, approves
- Technician dashboard: See assigned work, update progress
- Financial tracking: Cost of maintenance recorded
- Analytics: Issue frequency, resolution time, costs

---

## WORKFLOW 3: AMENITY BOOKING

### User Roles: Resident, Admin

### Step-by-Step Flow:

**Stage 1: ADMIN CREATES BOOKABLE SPACE**
1. Admin opens Society Admin → Amenities tab
2. Clicks "Add New Space"
3. Fills details:
   - Name: "Community Hall"
   - Description: "100 sq ft, capacity 50 people"
   - Cost: "₹1000 per booking"
   - Availability: "Daily 10 AM - 9 PM"
   - Max booking: "8 hours"
4. Saves
5. Status: **ACTIVE**

**Data Created:**
```javascript
{
  id: "space-001",
  societyId: "society-123",
  name: "Community Hall",
  description: "100 sq ft, capacity 50 people",
  cost: 1000,
  capacity: 50,
  maxBookingHours: 8,
  availability: {
    monday: { start: "10:00", end: "21:00" },
    tuesday: { start: "10:00", end: "21:00" },
    // ...all days
  },
  status: "active",
  createdAt: "2024-03-29T10:00:00Z"
}
```

**Stage 2: RESIDENT REQUESTS BOOKING**
1. Resident opens Community tab → Amenities
2. Sees all available spaces (from admin data)
3. Clicks "Book" on Community Hall
4. Booking modal opens
5. Selects:
   - Date (next 30 days only)
   - Time slot (based on admin availability)
6. Sees cost: "₹1000"
7. Clicks "Submit Booking Request"
8. Status: **PENDING APPROVAL**

**Data Created:**
```javascript
{
  id: "booking-001",
  spaceId: "space-001",
  residentId: "resident-456",
  bookingDate: "2024-04-15",
  timeSlot: "10:00 AM - 1:00 PM",
  status: "pending",
  cost: 1000,
  paymentStatus: "awaiting",
  requestedAt: "2024-03-29T11:30:00Z",
  approvedAt: null,
  paymentReceivedAt: null,
  qrCode: null // QR for payment
}
```

**Stage 3: ADMIN APPROVES/REJECTS**
1. Admin sees booking request in Amenities tab
2. Reviews:
   - Is resident valid?
   - Is date/time available?
3. Clicks APPROVE or REJECT
4. If approved:
   - Status: **APPROVED**
   - Generates payment QR code
   - Resident notified: "Your booking is approved. Please pay ₹1000 using this QR code"
5. If rejected:
   - Status: **REJECTED**
   - Resident notified with reason

**Data Updated:**
```javascript
{
  status: "approved",
  approvedBy: "admin-789",
  approvedAt: "2024-03-29T12:00:00Z",
  qrCode: "SOCIETY-PAY-XYZ789",
  paymentStatus: "awaiting"
}
```

**Stage 4: RESIDENT PAYS VIA QR**
1. Resident gets booking details with QR code
2. Scans QR or makes payment through society's payment system
3. Resident gets payment confirmation
4. Resident notifies admin (or system auto-detects payment)
5. Status: **AWAITING PAYMENT CONFIRMATION**

**Stage 5: ADMIN CONFIRMS PAYMENT**
1. Admin checks payment receipt from society's payment system
2. Verifies amount (₹1000) is received
3. Clicks "Mark Payment Received" on booking
4. Status: **CONFIRMED**
5. Resident notified: "Your booking is confirmed! ✓"

**Data Updated:**
```javascript
{
  status: "confirmed",
  paymentStatus: "received",
  paymentReceivedAt: "2024-04-14T16:00:00Z",
  paymentReceivedBy: "admin-789"
}
```

**Stage 6: RESIDENT USES BOOKING**
1. On booking date, resident shows booking details at community hall
2. Resident can:
   - Keep booking
   - Request cancellation (if before date)
3. If cancelled:
   - Status: **CANCELLED**
   - Refund processed (if before 24 hours)

### Status Flow Diagram:
```
PENDING → APPROVED → AWAITING PAYMENT → CONFIRMED → COMPLETED ✓
   ↓                                          ↓
REJECTED                              CANCELLED (refund)
```

### Data Integrations:
- Admin creates spaces (Amenities Management)
- Residents browse spaces (Community tab)
- Payment tracked separately (Financials)
- Bookings visible in "My Bookings" tab
- Admin sees booking history and revenue

---

## WORKFLOW 4: FINANCIAL PAYMENT

### User Roles: Resident, Admin, Society

### Step-by-Step Flow:

**Stage 1: SOCIETY ISSUES BILL**
1. Admin generates monthly maintenance bills
2. Bill is created for each resident:
   - Total amount due
   - Breakdown (maintenance, water, electricity, parking, etc.)
   - Due date
3. Bills sent to residents' Financial tab

**Data Created:**
```javascript
{
  id: "bill-2024-03",
  residentId: "resident-456",
  month: "March 2024",
  amount: 2500,
  dueDate: "2024-03-31",
  status: "pending",
  breakdown: {
    maintenance: 1200,
    water: 400,
    electricity: 600,
    parking: 300
  },
  createdAt: "2024-03-01T00:00:00Z",
  paidAt: null,
  paymentMethod: null
}
```

**Stage 2: RESIDENT RECEIVES BILL**
1. Resident opens Financial tab
2. Sees "Current Bills" section
3. Bill shows: Amount due, due date, payment status
4. Can expand to see breakdown

**Stage 3: RESIDENT PAYS**
1. Resident sees payment QR code
2. Scans QR and makes payment through bank/UPI
3. Gets payment confirmation from bank
4. Status shows: "Payment pending confirmation"

**Stage 4: ADMIN CONFIRMS PAYMENT**
1. Admin checks society's bank account for payment
2. Opens Financial tab → Bills section
3. Finds payment received notification
4. Marks payment as received:
   - Status: **PAID**
   - Payment date recorded
   - Payment method recorded
5. Resident dashboard updates: Bill now shows as PAID

**Data Updated:**
```javascript
{
  status: "paid",
  paidAt: "2024-03-25T14:30:00Z",
  paymentMethod: "UPI",
  paymentReference: "TXN-20240325-001"
}
```

**Stage 5: RESIDENT SEES PAYMENT HISTORY**
1. Resident sees payment in "Payment History" tab
2. Shows: Date paid, amount, payment method, reference
3. Can download receipt (if admin enables)

**Stage 6: SOCIETY SEES COLLECTIONS**
1. Admin/Superadmin opens Financial dashboard
2. Sees total collections vs outstanding
3. Generates reports for society records

### Status Flow Diagram:
```
PENDING → PAYMENT INITIATED → CONFIRMED → PAID ✓
                  ↓
              (by admin)
```

### Data Integrations:
- Bills created automatically each month
- Payment tracked in Financial system
- Collections shown in Society dashboard
- Payment method stored for records
- Year-over-year comparison for residents
- Financial reports for admin

---

## WORKFLOW 5: COMMUNITY BOARD POST

### User Roles: Resident

### Step-by-Step Flow:

**Stage 1: RESIDENT CREATES POST**
1. Resident opens Community tab → Community Board
2. Clicks "Create New Post"
3. Types message: "Lost my keys in community hall today"
4. Optionally adds photo
5. Clicks "Post"
6. Status: **POSTED**

**Data Created:**
```javascript
{
  id: "post-001",
  residentId: "resident-456",
  unitNumber: "A-101",
  title: "Lost keys in community hall",
  content: "Lost my keys in community hall today. If found, please contact me.",
  photo: "photo-url",
  createdAt: "2024-03-29T15:45:00Z",
  likes: 0,
  comments: [],
  visibility: "all-residents"
}
```

**Stage 2: OTHER RESIDENTS SEE & INTERACT**
1. Other residents see post in Community Board feed
2. Can like the post (heart icon)
3. Can reply/comment: "Found keys near reception"
4. Post shows: Author unit, time posted, like count

**Data Updated:**
```javascript
{
  likes: [resident-123, resident-789],
  comments: [
    {
      id: "comment-001",
      authorId: "resident-123",
      authorUnit: "B-201",
      content: "Found keys near reception",
      createdAt: "2024-03-29T16:00:00Z"
    }
  ]
}
```

**Stage 3: ORIGINAL POSTER RESPONDS**
1. Original resident sees comment
2. Clicks "Reply" or "Contact"
3. Can message commenter directly
4. Resolves issue

### Status Flow Diagram:
```
POSTED → COMMENTED → RESOLVED (by residents)
   ↓
(Auto-deleted after 30 days or marked as resolved)
```

### Data Integrations:
- All residents see posts (except personal details)
- No admin involvement needed
- Community engagement metric tracked
- Can add moderation if needed later

---

## INTERCONNECTION MATRIX

| Workflow | Creates Data | Updates | Reads | Notifies |
|----------|--------------|---------|-------|----------|
| Visitor Pass | Visitor record | Pass status, QR | Resident, Admin, Watchman | Resident |
| Issue Report | Issue record | Issue status, assignments | Resident, Admin, Tech | Resident, Admin |
| Amenity Book | Booking record | Booking status, payment | Resident, Admin | Resident |
| Financial | Bill record | Payment status | Resident, Admin | Resident, Admin |
| Board Post | Post record | Likes, comments | All residents | -|

---

This documentation covers the complete workflows. Each can be implemented independently but they all share the same design philosophy: Request → Approval → Execution → Notification.
