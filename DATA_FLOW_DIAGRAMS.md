# Data Flow Diagrams & Examples

## 1. Complete Authentication & Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ RESIDENT LOGIN FLOW                                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: Resident enters credentials
    ┌──────────────────────────────┐
    │ Login Page                   │
    │ Username: rajesh_001         │
    │ Password: ••••••••           │
    │ Role: Resident               │
    │ [Login Button]               │
    └──────────────┬───────────────┘

Step 2: Frontend sends login request
    POST /api/auth/resident-login
    Headers: { Content-Type: application/json }
    Body: {
      societyId: "society_001",
      username: "rajesh_001",
      password: "secretPassword123"
    }

Step 3: Backend validates
    ✓ Query residents table WHERE society_id='society_001' AND username='rajesh_001'
    ✓ Hash password: crypto.SHA256('secretPassword123' + salt)
    ✓ Compare hashes
    ✓ Validate status = 'active'

Step 4: Backend returns response
    {
      success: true,
      data: {
        id: "resident_12345",
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543210",
        society_id: "society_001",
        property_id: "property_001",
        unit_number: "201",
        status: "active",
        created_at: "2026-01-15T10:00:00Z"
      }
    }

Step 5: Frontend stores session
    localStorage.setItem('userId', 'resident_12345')
    localStorage.setItem('societyId', 'society_001')
    localStorage.setItem('userType', 'resident')
    localStorage.setItem('userName', 'Rajesh Kumar')

Step 6: Redirect to dashboard
    window.location.href = '/resident-dashboard'

Step 7: Dashboard loads and fetches data
    useMyBills('resident_12345') → GET /api/maintenance-bills?resident_id=resident_12345
    useMyComplaints('resident_12345') → GET /api/complaints?resident_id=resident_12345
    useMyVisitors('resident_12345') → GET /api/visitor-logs?resident_id=resident_12345

Step 8: All API calls include headers automatically
    GET /api/maintenance-bills?resident_id=resident_12345
    Headers: {
      x-user-id: "resident_12345",
      x-society-id: "society_001",
      x-user-type: "resident"
    }

Step 9: Backend authorizes each request
    if (userType === 'resident' && queryResidentId !== userId) {
      return 403 Unauthorized
    }

Step 10: Dashboard displays data
    ✓ Bills table
    ✓ Complaints list
    ✓ Visitor history
```

---

## 2. Create Bill Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN CREATES MAINTENANCE BILL FLOW                              │
└──────────────────────────────────────────────────────────────────┘

ADMIN SIDE (Society Admin Dashboard)
├─ Sees all properties for their society
├─ Clicks: "Generate Bills for March 2026"
├─ Form appears with:
│  ├─ Select Month: March 2026
│  ├─ Base Amount: 5000
│  ├─ Water Charge: 500
│  ├─ Parking: 500
│  ├─ Total: 6000
│  └─ [Generate Bills] Button
└─ Clicks button

FRONTEND (Resident Dashboard)
    ├─ Collects form data
    ├─ For each property in society:
    │  └─ Creates POST request
    └─ Sends batch of bills

API LAYER (/api/maintenance-bills/route.ts)
    ├─ Validates authorization
    │  └─ if (userType !== 'admin') → 403 Forbidden
    ├─ Validates input
    │  ├─ amount > 0 ✓
    │  ├─ month_year = YYYY-MM format ✓
    │  └─ property_id exists ✓
    ├─ Gets resident_id from property
    │  └─ SELECT residents WHERE property_id = 'prop_001'
    └─ Calls db.createBill()

DATABASE (Supabase maintenance_bills table)
    INSERT INTO maintenance_bills VALUES (
      id:              'bill_12345',
      society_id:      'society_001',
      property_id:     'prop_001',
      resident_id:     'resident_12345',
      amount:          6000,
      month_year:      '2026-03',
      due_date:        '2026-03-31',
      status:          'pending',
      breakdown: {
        maintenance:   5000,
        water:         500,
        parking:       500
      },
      created_at:      NOW(),
      updated_at:      NOW()
    )

RESPONSE TO ADMIN
    {
      success: true,
      data: {
        id: 'bill_12345',
        amount: 6000,
        status: 'pending',
        ...
      }
    }

ADMIN SEES
    ├─ Success toast: "Bill created"
    ├─ Bill added to table
    └─ Bills refreshed

RESIDENT SIDE (What happens next)
    ├─ May receive notification: "New bill: ₹6000"
    ├─ When logs into dashboard:
    │  └─ useMyBills() hook fetches updated bills
    ├─ Sees new bill in table:
    │  └─ March 2026 | ₹6000 | Pending | Due: Mar 31
    ├─ Can click "View" or "Pay"
    └─ Pays bill → status changes to "paid"

NEW BILL NOTIFICATION FLOW (Optional Real-time)
    └─ Database triggers webhook
       └─ Sends push notification to app
       └─ SMS/Email notification service
       └─ Resident sees: "New bill received"
```

---

## 3. Submit Complaint Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ RESIDENT SUBMITS COMPLAINT FLOW                                  │
└──────────────────────────────────────────────────────────────────┘

RESIDENT DASHBOARD
    ├─ Clicks: "New Complaint" button
    ├─ Form appears:
    │  ├─ Title: "Water Leakage in Bathroom"
    │  ├─ Category: Plumbing
    │  ├─ Severity: High
    │  ├─ Description: "Water leaking from ceiling..."
    │  ├─ Photos: [upload 2 images]
    │  └─ [Submit] Button
    └─ Clicks Submit

FRONTEND PREPARATION
    ├─ Validates form
    │  ├─ title.length > 0 ✓
    │  ├─ category in ['plumbing', ...] ✓
    │  └─ description.length > 10 ✓
    ├─ Uploads photos to storage
    │  ├─ Image 1 → Vercel Blob → "https://blob.vercel.com/img1.jpg"
    │  └─ Image 2 → Vercel Blob → "https://blob.vercel.com/img2.jpg"
    └─ Creates POST request

API REQUEST
    POST /api/complaints
    Headers: {
      x-user-id: 'resident_12345',
      x-society-id: 'society_001',
      x-user-type: 'resident'
    }
    Body: {
      title: "Water Leakage in Bathroom",
      category: "plumbing",
      severity: "high",
      description: "Water leaking from ceiling...",
      photos: [
        "https://blob.vercel.com/img1.jpg",
        "https://blob.vercel.com/img2.jpg"
      ]
    }

BACKEND VALIDATION & PROCESSING
    ├─ Check auth:
    │  └─ user_id matches logged-in user ✓
    ├─ Validate input:
    │  ├─ title not empty ✓
    │  ├─ category in enum ✓
    │  ├─ severity in enum ✓
    │  └─ photos array valid ✓
    └─ Create complaint object:
       {
         id: uuid(),
         society_id: 'society_001',
         resident_id: 'resident_12345',
         property_id: 'prop_001',
         title: "Water Leakage in Bathroom",
         category: "plumbing",
         severity: "high",
         description: "Water leaking from ceiling...",
         photos: [...],
         status: 'open',
         created_at: NOW()
       }

DATABASE INSERT
    INSERT INTO complaints VALUES (...)
    ✓ Row created

RESPONSE
    {
      success: true,
      data: {
        id: 'complaint_abc123',
        status: 'open',
        created_at: '2026-03-15T10:00:00Z',
        ...
      }
    }

RESIDENT FEEDBACK
    ├─ Success message: "Complaint submitted"
    ├─ New complaint appears in list
    └─ Can see status: "Open - Awaiting review"

ADMIN NOTIFICATION
    ├─ Dashboard shows: "New complaint from Rajesh Kumar"
    ├─ Admin can:
    │  ├─ View complaint details
    │  ├─ Assign to contractor
    │  ├─ Update status to "in_progress"
    │  └─ Add resolution notes
    └─ When done: status → "resolved"

RESIDENT UPDATE
    ├─ Notification: "Your complaint has been resolved"
    ├─ Can view:
    │  ├─ Work photos
    │  ├─ Completion date
    │  └─ Resolution notes
    └─ Can rate satisfaction (optional)

COMPLETE DATA SYNC
    Frontend ← API ← Database
    ├─ Resident sees updated complaint status
    ├─ Admin sees completion confirmation
    └─ Both sides synchronized
```

---

## 4. Visitor Approval Flow (Real-time)

```
┌──────────────────────────────────────────────────────────────────┐
│ VISITOR GATE ENTRY APPROVAL FLOW                                 │
└──────────────────────────────────────────────────────────────────┘

TIME: 2:00 PM
────────────

RESIDENT HOME (2:00 PM)
    ├─ Doorbell rings
    ├─ "Your maid Lakshmi is at the gate"
    ├─ Sees notification on phone
    └─ Opens app

WATCHMAN AT GATE (2:00 PM)
    ├─ Scans visitor ID
    ├─ Takes photo of visitor Lakshmi
    ├─ Enters in system:
    │  ├─ Name: Lakshmi
    │  ├─ Purpose: Household Help
    │  ├─ Unit: 201 (Rajesh Kumar)
    │  └─ [Request Entry] button
    └─ Creates visitor log (status: pending)

API: POST /api/visitor-logs
    {
      society_id: 'society_001',
      resident_id: 'resident_12345',
      property_id: 'prop_001',
      visitor_name: 'Lakshmi',
      purpose: 'Household Help',
      visitor_photo: 'https://blob.vercel.com/lakshmi.jpg',
      approval_status: 'pending',
      approved_by: null
    }

DATABASE
    INSERT INTO visitor_logs VALUES (
      id: 'visit_xyz789',
      approval_status: 'pending',
      ...
    )

RESIDENT DASHBOARD (Real-time Update)
    ├─ If polling: Refetches every 5 seconds
    ├─ If WebSocket: Receives instant notification
    ├─ Sees: "Lakshmi is waiting at gate"
    ├─ Shows photo of Lakshmi
    ├─ Options: [Approve] [Reject]
    └─ Clicks [Approve]

RESIDENT APPROVES
    PUT /api/visitor-logs/{visit_xyz789}
    Headers: { x-user-id: resident_12345, ... }
    Body: {
      approval_status: 'approved',
      approved_time_window: {
        start: '14:00',
        end: '16:00'
      }
    }

DATABASE UPDATE
    UPDATE visitor_logs
    SET approval_status = 'approved',
        approved_by = 'resident_12345',
        updated_at = NOW()
    WHERE id = 'visit_xyz789'

WATCHMAN DASHBOARD (Real-time Update)
    ├─ Notification: "Visitor approved by resident"
    ├─ Shows: "Lakshmi - APPROVED"
    ├─ Can now let visitor in
    ├─ Clicks: [Check-in] button
    └─ Records actual check-in time

CHECK-IN
    PUT /api/visitor-logs/{visit_xyz789}
    Body: {
      actual_checkin: '2026-03-15T14:02:30Z'
    }

DATABASE UPDATE
    visitor_logs.actual_checkin = '2026-03-15T14:02:30Z'

TIME: 3:30 PM
────────────

VISITOR LEAVING
    ├─ Lakshmi exits building
    ├─ Informs watchman
    └─ Watchman clicks: [Check-out]

CHECK-OUT
    PUT /api/visitor-logs/{visit_xyz789}
    Body: {
      actual_checkout: '2026-03-15T15:32:15Z'
    }

DATABASE FINAL STATE
    visitor_logs record:
    {
      id: 'visit_xyz789',
      visitor_name: 'Lakshmi',
      approval_status: 'approved',
      actual_checkin: '2026-03-15T14:02:30Z',
      actual_checkout: '2026-03-15T15:32:15Z',
      duration: 90 minutes
    }

REPORTS & ANALYTICS
    ├─ Admin Dashboard shows:
    │  └─ "Lakshmi visited: 2:02 PM - 3:32 PM"
    ├─ Resident sees:
    │  └─ "Visitor check-in: 2:02 PM, check-out: 3:32 PM"
    └─ Watchman duty report:
       └─ "Total visitors today: 5, All approved"

FULL SYNC ACHIEVED
    ✓ Resident app: Updated immediately
    ✓ Watchman app: Updated immediately  
    ✓ Admin dashboard: Updated immediately
    ✓ Database: Single source of truth
```

---

## 5. State Management Pattern

```
┌────────────────────────────────────────────────────────────────┐
│ HOW FRONTEND STATE STAYS IN SYNC WITH DATABASE               │
└────────────────────────────────────────────────────────────────┘

SCENARIO: Resident bills page

INITIAL LOAD
    ├─ User navigates to /resident-dashboard/bills
    ├─ Component mounts
    ├─ useMyBills(userId) hook called
    │  └─ Fetches: GET /api/maintenance-bills?resident_id=123
    ├─ Response: [Bill1, Bill2, Bill3]
    ├─ React state updated: setBills([...])
    ├─ UI renders: 3 bills displayed
    └─ User sees: "March: ₹6000 | February: ₹6000 | January: ₹6000"

BILL IS PAID (Somewhere in the system)
    └─ Could be:
       ├─ Same resident (different tab) pays online
       ├─ Admin marks as paid
       └─ Payment webhook received

DATABASE UPDATED
    UPDATE maintenance_bills
    SET status = 'paid', paid_date = NOW()
    WHERE id = 'bill_march_001'

FRONTEND SYNC OPTIONS
    ├─ POLLING (Simple)
    │  ├─ Every 30 seconds: Refetch bills
    │  ├─ GET /api/maintenance-bills?resident_id=123
    │  ├─ Compare new data with old
    │  ├─ If different: updateState
    │  └─ UI auto-updates
    │
    ├─ MANUAL REFRESH (User-driven)
    │  ├─ User clicks "Refresh" button
    │  ├─ Calls refetch()
    │  ├─ API returns updated data
    │  └─ UI updates
    │
    ├─ WEBSOCKET (Real-time)
    │  ├─ WebSocket connection established
    │  ├─ Database change → Server detects
    │  ├─ Server broadcasts: { bill_id: 'march_001', status: 'paid' }
    │  ├─ Client receives message
    │  ├─ Local state updated immediately
    │  └─ UI updates (no refetch needed)
    │
    └─ SERVER-SENT EVENTS (Real-time, easier)
       ├─ EventSource connection to /api/stream
       ├─ Server sends: data: {type: 'bill_paid', billId: 'march_001'}
       ├─ Client listener: onMessage updates state
       ├─ React rerenders
       └─ UI shows new status

FINAL UI STATE
    ├─ March: ₹6000 → Status: PAID ✓
    ├─ February: ₹6000 → Status: PENDING
    └─ January: ₹6000 → Status: PAID ✓
```

---

## 6. Authorization Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│ WHO CAN ACCESS WHAT DATA                                        │
└─────────────────────────────────────────────────────────────────┘

API: GET /api/maintenance-bills

┌─────────────────────┬──────────────────┬─────────────────────┐
│ User Type           │ Query Parameter  │ Can Access          │
├─────────────────────┼──────────────────┼─────────────────────┤
│ SUPER ADMIN         │ society_id=x     │ ALL bills in society│
├─────────────────────┼──────────────────┼─────────────────────┤
│ SOCIETY ADMIN       │ society_id=x     │ ALL bills in their  │
│                     │                  │ own society         │
├─────────────────────┼──────────────────┼─────────────────────┤
│ RESIDENT            │ resident_id=123  │ ONLY their own bills│
│                     │                  │ (IF 123 == userId)  │
├─────────────────────┼──────────────────┼─────────────────────┤
│ WATCHMAN            │ (any)            │ ❌ DENIED (403)     │
└─────────────────────┴──────────────────┴─────────────────────┘

BACKEND CHECK:

if (userType === 'resident') {
  // Resident can only see their own bills
  if (queryResidentId !== userId) {
    return response.error('Unauthorized', 403)
  }
} else if (userType === 'admin') {
  // Admin sees all in their society
  // querySocietyId must match their societyId
  if (querySocietyId !== userSocietyId) {
    return response.error('Unauthorized', 403)
  }
}

API: POST /api/complaints

┌─────────────────────┬──────────────────────────┬────────────┐
│ User Type           │ Permission               │ Who's in DB│
├─────────────────────┼──────────────────────────┼────────────┤
│ RESIDENT            │ ✓ Can create own        │ resident_id│
│                     │   complaint              │ = userId   │
├─────────────────────┼──────────────────────────┼────────────┤
│ SOCIETY ADMIN       │ ✓ Can view all         │ Can assign │
│                     │ ✓ Can assign           │ to self or │
│                     │ ✓ Can resolve          │ others     │
├─────────────────────┼──────────────────────────┼────────────┤
│ WATCHMAN            │ ❌ Cannot create       │ Cannot     │
│                     │ ✓ Can view all in      │ submit     │
│                     │   society (read-only)   │ complaints │
└─────────────────────┴──────────────────────────┴────────────┘
```

---

## 7. Error Handling Flow

```
┌────────────────────────────────────────────────────────────────┐
│ HOW ERRORS PROPAGATE THROUGH LAYERS                           │
└────────────────────────────────────────────────────────────────┘

SCENARIO: Resident submits bill payment with invalid amount

FRONTEND
    ├─ Form: Amount = "abc" (not a number)
    ├─ User clicks [Pay]
    ├─ Client-side validation: ❌ Fails
    │  └─ Show error: "Amount must be a number"
    ├─ No API call made
    └─ User corrects input

USER CORRECTS:
    ├─ Amount = "5000"
    ├─ Clicks [Pay] again
    ├─ Client validation: ✓ Passes
    ├─ Makes API call:
    │  POST /api/maintenance-bills/{id}
    │  Body: { status: 'paid', paid_amount: 5000 }
    └─ Sends to backend

BACKEND VALIDATION
    ├─ Parse body: paid_amount = 5000
    ├─ Validate:
    │  ├─ Is paid_amount a number? ✓ Yes
    │  ├─ Is paid_amount > 0? ✓ Yes
    │  ├─ Is paid_amount <= bill.amount? Check...
    │  │  └─ Bill amount: 6000
    │  │  └─ Paid amount: 5000
    │  │  └─ ✓ Valid (partial payment OK)
    │  └─ Validation passes
    ├─ Business logic:
    │  ├─ Check: Bill not already marked paid
    │  ├─ Check: Same society_id
    │  └─ Update bill in database
    ├─ Try update:
    │  └─ UPDATE maintenance_bills SET ...
    └─ Success!

DATABASE
    ├─ Row updated
    └─ No errors

RESPONSE
    {
      success: true,
      data: {
        id: 'bill_123',
        status: 'paid',
        paid_amount: 5000,
        paid_date: '2026-03-15T15:30:00Z'
      }
    }

FRONTEND RECEIVES
    ├─ Parse response: result.success = true
    ├─ Update state
    ├─ Show success: "Payment recorded"
    ├─ Refresh UI
    └─ Bill marked as paid

ERROR SCENARIO: Payment amount exceeds bill
    ├─ User enters: paid_amount = 7000 (more than 6000)
    ├─ Clicks [Pay]
    └─ Backend validation:
       ├─ Check: paid_amount (7000) <= bill.amount (6000)
       ├─ ❌ FAILS
       ├─ Returns error:
       │  {
       │    success: false,
       │    error: "Payment amount cannot exceed bill amount",
       │    statusCode: 400
       │  }
       └─ Frontend catches error:
          ├─ Shows toast: "Payment failed: Amount exceeds bill"
          └─ User corrects and retries

ERROR SCENARIO: Database is down
    ├─ Backend tries UPDATE
    ├─ Database connection fails
    ├─ Error thrown: ConnectionError
    ├─ Backend catches:
    │  {
    │    success: false,
    │    error: "Database error. Please try again.",
    │    statusCode: 500
    │  }
    └─ Frontend shows:
       ├─ Alert: "Server error. Please try again later."
       ├─ Shows "Retry" button
       └─ User can retry or go back
```

---

## Summary: Complete Synchronization

```
┌──────────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA SYNC                           │
└──────────────────────────────────────────────────────────────────┘

FRONTEND                    API                        DATABASE
│                          │                          │
├─ useMyBills()           │                          │
│  └─ GET /bills    ──────→ Validate auth ──────────→ SELECT bills
│                          │ Check permission          WHERE resident=123
│                          │ Query DB                 │
│  ←─ Response data ────────┤ Return [Bill1, Bill2]  │
│                          │                          │
├─ setState(bills)        │                          │
│ [Bill1, Bill2]          │                          │
│                          │                          │
├─ Render UI              │                          │
│ ┌──────────────┐        │                          │
│ │ Bills:       │        │                          │
│ │ Mar: ₹6000   │        │                          │
│ │ Feb: ₹6000   │        │                          │
│ └──────────────┘        │                          │
│                          │                          │
├─ User pays bill         │                          │
│ POST /bills/1/pay ──────→ Validate ────────────────→ UPDATE bill
│                          │ Process payment          WHERE id=1
│                          │                          SET status='paid'
│                          │                         │
│  ←─ Success response ────┤ Return { status:'paid'}│
│                          │                          │
├─ setState updated       │                          │
│ [Bill1(paid), Bill2]     │                          │
│                          │                          │
├─ Render updated         │                          │
│ ┌──────────────┐        │                          │
│ │ Bills:       │        │                          │
│ │ Mar: PAID ✓  │        │                          │
│ │ Feb: ₹6000   │        │                          │
│ └──────────────┘        │                          │
│                          │                          │

EVERYONE IS IN SYNC!
✓ Frontend shows paid status
✓ Backend validated the transaction  
✓ Database has the truth
✓ All dashboards reflect reality
```
