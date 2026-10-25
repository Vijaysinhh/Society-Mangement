# Property Management System - Executive Overview

## WHAT WE'RE BUILDING

A **Multi-Tenant SaaS Platform** for managing residential societies/communities with three tiers of users:

### Users & Roles

```
SYSTEM LEVEL
└─ Superadmin (create/manage societies)
   
SOCIETY LEVEL (Multiple per system)
├─ Society Admin (manage single society)
│  ├─ Creates Properties
│  ├─ Creates Residents (via signup links)
│  ├─ Creates Watchmen
│  └─ Manages Billing & Complaints
│
├─ Residents (property occupants)
│  ├─ Login to /{societyName}/resident/login
│  ├─ Manage guests/visitors
│  ├─ View & pay bills
│  ├─ Create complaints
│  └─ Add emergency contacts
│
└─ Watchmen (security staff)
   ├─ Login to /{societyName}/watchman/login
   ├─ Check in/out visitors
   ├─ Maintain security logs
   └─ Manage blacklist
```

---

## THE FLOW - From Superadmin to Resident

### Step 1: Society Creation
```
Superadmin logs in
  ↓
"Create New Society" form
  ↓
Fills: Society name, address, contact info
  ↓
System auto-generates:
  - societyName = "sample-society" (URL slug)
  - Creates society_admin with temp credentials
  - Returns: 3 custom login URLs:
    * https://myapp.com/sample-society/societyadmin/login
    * https://myapp.com/sample-society/resident/login
    * https://myapp.com/sample-society/watchman/login
```

### Step 2: Society Admin Takes Over
```
Society Admin receives credentials from Superadmin
  ↓
Logs in at: /sample-society/societyadmin/login
  ↓
Accesses Society Admin Dashboard
  ↓
Can now:
  1. Create Properties (flats, villas, etc)
  2. Create Residents (generates signup links)
  3. Create Watchmen (assigns credentials)
  4. Manage billing and complaints
```

### Step 3: Resident Signup & Access
```
Society Admin generates signup link and sends to Resident:
  "Your property #101 access link: .../sample-society/resident/signup?code=xyz"
  ↓
Resident clicks link
  ↓
Fills signup form:
  - Email
  - Password
  - Name
  - Emergency Contact
  ↓
Account created
  ↓
Can now login at: /sample-society/resident/login
  ↓
Multi-device support:
  - Login from Phone → Gets Token 1
  - Login from Laptop → Gets Token 2
  - Both tokens valid simultaneously, independent sessions
```

### Step 4: Resident Using Dashboard
```
Resident visits: /sample-society/resident/dashboard
  ↓
Can:
  1. Invite guests (upload photo + details)
  2. Approve/reject guest photos
  3. View guest history
  4. View & pay bills
  5. File complaints
  6. Manage emergency contacts
```

### Step 5: Watchman Gate Operations
```
Watchman logs in at: /sample-society/watchman/login
  ↓
Views pending approved visitors
  ↓
When guest arrives:
  1. Check photo matches real person
  2. Click "Check In"
  3. Guest enters
  ↓
When guest leaves:
  1. Click "Check Out"
  2. Record check-out time
  ↓
Can also:
  - Report suspicious activity
  - Add to blacklist
  - View duty history
```

---

## DATABASE STRUCTURE

### 10 Core Tables

```
superadmins
  ├─ id, email, password_hash, created_at

societies
  ├─ id, name, slug, address, created_at
  └─ Links to: society_admins, properties, residents, watchmen

society_admins
  ├─ id, society_id, email, password_hash
  └─ One per society (can add more later)

properties
  ├─ id, society_id, name, floor, bedrooms
  └─ Can have one resident per property

residents
  ├─ id, society_id, property_id, email, password_hash
  ├─ emergency_contact_name, emergency_contact_phone
  └─ Multi-device login with same account

watchmen
  ├─ id, society_id, email, password_hash, shift
  └─ One or more per society

visitors
  ├─ id, society_id, resident_id, watchman_id
  ├─ name, phone, photo_url, purpose
  ├─ status: pending → approved → checkedin → checkedout
  └─ Links resident invites to watchman checkpoints

bills
  ├─ id, society_id, property_id (NOT resident)
  ├─ type: maintenance, water, electricity, parking
  ├─ amount, due_date, status
  └─ Property pays (simplified model)

complaints
  ├─ id, society_id, resident_id
  ├─ category, description, status, priority
  └─ For maintenance requests and issues

emergency_contacts (embedded in residents table)
  ├─ name, phone, relationship

blacklist (if needed - can be in visitors table)
  ├─ id, society_id, resident_id or phone
  ├─ reason, date_added
  └─ Prevent known troublemakers
```

---

## SECURITY MODEL

### Authentication
- **Method**: JWT (JSON Web Token)
- **Storage**: Browser localStorage
- **Format**:
  ```json
  {
    "userId": "abc123",
    "email": "resident@email.com",
    "role": "resident",
    "societyId": "society_xyz",
    "propertyId": "unit_101",
    "iat": 1625097600
    // NO EXPIRY
  }
  ```
- **No Expiry**: Session never expires unless manually logged out
- **Multi-Device**: Each login creates separate token, all valid

### Authorization (Role-Based)
```
Superadmin ─→ Can create/manage all societies

Society Admin ─→ Can manage only THEIR society
                 Cannot access other societies
                 Cannot create other society admins

Resident ─→ Can only see:
           - Own property
           - Own guest list
           - Own bills
           - Cannot see other residents' data

Watchman ─→ Can only:
           - See approved visitors (all residents)
           - Check in/out visitors
           - View security logs
           - Cannot access billing
```

### Data Isolation
```
Every query includes societyId filter:
  
  SELECT * FROM residents 
  WHERE society_id = 'xyz'  ← CRITICAL
    AND id = 'resident_id'

Resident from Society A cannot access Society B because:
  1. Token contains societyId = 'xyz'
  2. URL requires societyId = 'xyz'
  3. Query filtered by societyId = 'xyz'
  (3 layers of protection)
```

---

## API ENDPOINTS SUMMARY

### Authentication (Public)
- POST /api/auth/login - Any role
- POST /api/auth/logout - Clear session

### User Management (Admin/SuperAdmin only)
- POST /api/residents - Create resident
- GET /api/residents - List residents
- POST /api/watchmen - Create watchman
- GET /api/watchmen - List watchmen
- POST /api/society-admins - Create admin

### Visitor Management
- POST /api/visitors - Resident creates invite
- GET /api/visitors - List visitors
- PUT /api/visitors/{id} - Approve/reject/checkin/out

### Billing
- GET /api/bills - List bills
- POST /api/bills/pay - Resident pays
- GET /api/financial - Reports

### Maintenance
- POST /api/complaints - Create complaint
- GET /api/complaints - List complaints
- PUT /api/complaints/{id} - Update status

---

## CUSTOM URLs PER SOCIETY

When Society "Oakwood Residences" is created:

```
Generated auto-slug: oakwood-residences

Then available:
┌─ https://myapp.com/oakwood-residences/societyadmin/login
│  └─ Only society admins of this society
│
├─ https://myapp.com/oakwood-residences/resident/login
│  └─ Only residents of this society
│
└─ https://myapp.com/oakwood-residences/watchman/login
   └─ Only watchmen of this society

No cross-society access possible because:
- URL contains societyId
- Token contains societyId
- Database queries filter by societyId
```

---

## VISITOR APPROVAL FLOW

### How Guest Access Works

```
Day 1 - Resident Invites Guest
├─ Resident: "I have a guest coming"
├─ Uploads guest photo (from phone camera)
├─ Guest details: name, phone, purpose
└─ Guest car number (optional)

Day 1 - Guest Arrives at Gate
├─ Watchman sees notification
├─ Checks pending invites
├─ Verifies guest photo matches person
├─ Clicks "Approve & Check In"
├─ Gate opened (manually by watchman)
└─ Guest entry recorded with timestamp

Day 1 - Guest Leaves
├─ Guest tells watchman: "Leaving"
├─ Watchman clicks "Check Out"
└─ Exit recorded with timestamp

Later - Audit Trail
├─ Resident can view: "Guest was here 2:30pm - 5:45pm"
├─ Society admin can audit all visitors
├─ For disputes: "This person wasn't actually here"
└─ Photo evidence stored (for reasonable time)
```

---

## MULTI-DEVICE RESIDENT LOGIN

### Scenario: Family with Shared Account

```
Mom logs in on iPhone
├─ Gets JWT Token #1
└─ Can manage family guests from phone

Dad logs in on iPad
├─ Gets JWT Token #2
└─ Can manage family guests from tablet

Both simultaneously accessing:
├─ Same guest data ✓
├─ Same bill data ✓
├─ Same property info ✓
└─ Independent sessions (no conflicts) ✓

If one logs out:
├─ Clears their device's token only
└─ Other device still logged in
```

---

## BILLING SYSTEM

### Tied to Property (Not Resident)

```
Property 101 ─ Resident: John Doe
  ├─ Bill: Maintenance $100 (due 30th)
  ├─ Bill: Water $20 (due 30th)
  ├─ Bill: Parking $50 (due 30th)
  └─ Total: $170 due

If John moves out and Jane moves in:
  └─ Jane sees SAME bills
     (because tied to property, not John)

If property has no resident:
  └─ Bills still exist
     (maintenance still charged)
```

---

## WHAT'S COMPLETE

✅ Architecture & Design
✅ Authentication system (JWT)
✅ Multi-tenant routing
✅ Database schema design
✅ 26 API endpoint stubs
✅ 3 Dashboard UI components (partial)
✅ Middleware for route protection
✅ Multi-device login support

---

## WHAT'S INCOMPLETE

❌ Database tables (SQL migrations not run)
❌ API endpoint implementations
❌ Society Admin Dashboard (full)
❌ Visitor photo upload system
❌ Payment integration
❌ Notification system
❌ Complete testing

---

## NEXT IMMEDIATE STEPS

### This Week
1. Create Supabase table migrations (SQL)
2. Set up Row-Level Security policies
3. Seed test data
4. Implement auth API endpoints

### Next Week
1. Implement user management APIs
2. Implement visitor management APIs
3. Complete Society Admin dashboard
4. Complete Resident dashboard

### Following Week
1. Implement billing APIs
2. Add visitor photo upload
3. Integrate payment (Stripe)
4. Add notification system

---

## KEY DESIGN DECISIONS EXPLAINED

| Decision | Why | Trade-off |
|----------|-----|-----------|
| JWT no expiry | Better UX, multi-device works | Need manual logout security |
| Society-specific URLs | Simpler navigation, branding | More URLs to manage |
| One resident per property (MVP) | Simpler model for launch | Families need shared account (we support this!) |
| Bills tied to property | Clearer responsibility | Harder to track individual rent |
| Photo upload for visitors | Security & identity verification | Storage cost & privacy concerns |
| Client-side filtering | Flexibility & debugging | More error-prone than DB-level RLS |

---

## DEPLOYMENT CHECKLIST

- [ ] Database created in Supabase
- [ ] Environment variables set (JWT_SECRET, DB_URL, etc)
- [ ] All APIs tested
- [ ] All dashboards tested
- [ ] Error handling implemented
- [ ] Logging & monitoring setup
- [ ] Security audit completed
- [ ] Performance tested (<2s load time)
- [ ] Mobile responsiveness verified
- [ ] Go-live plan documented

---

