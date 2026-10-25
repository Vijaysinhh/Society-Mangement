# Property Management System - Complete Deep Dive

## 1. SYSTEM OVERVIEW

This is a **Multi-Tenant Property Management Platform** with role-based access for:
- **Superadmins**: System-level management (create societies)
- **Society Admins**: Manage individual societies (create residents, watchmen)
- **Residents**: Manage property, invite guests, pay bills
- **Watchmen**: Gate management, visitor tracking

---

## 2. COMPLETE DATA FLOW ARCHITECTURE

### A. Society Creation Flow (Superadmin)

```
Superadmin Login (/superadmin-login)
    ↓
Superadmin Dashboard (/superadmin-dashboard)
    ↓
Create Society Form
    ↓
POST /api/societies
    ↓
Database Operations:
  - Create society record
  - Generate societyName (slug)
  - Create auto-login URLs:
    * /{societyName}/societyadmin/login
    * /{societyName}/resident/login
    * /{societyName}/watchman/login
  - Create initial society_admin user with temp credentials
    ↓
Return:
  - societyName
  - society_admin credentials (email + password)
  - Login URLs for each role
```

### B. Society Admin Flow

```
Receive Credentials from Superadmin
    ↓
Visit /{societyName}/societyadmin/login
    ↓
Login with email + password
    ↓
POST /api/auth/login
  {
    email: "admin@society.com",
    password: "temp_password",
    role: "societyadmin",
    societyId: "society_uuid"
  }
    ↓
Backend:
  - Query society_admins table
  - Verify password hash
  - Create JWT Token:
    {
      userId: "admin_id",
      email: "admin@society.com",
      role: "societyadmin",
      societyId: "society_uuid",
      iat: timestamp,
      // NO EXPIRY
    }
    ↓
Store token in localStorage
    ↓
Redirect to /{societyName}/societyadmin/dashboard
    ↓
Dashboard Features:
  - Create Properties/Units
  - Create Residents (send signup link)
  - Create Watchmen (assign credentials)
  - View visitor logs
  - Manage complaints/maintenance
  - View billing status
```

### C. Resident Signup & Access Flow

```
1. SIGNUP PHASE:
   - Society Admin generates signup link
   - Link: /{societyName}/resident/signup?code=unique_invite_code
   - Resident fills form (name, email, password, property selection)
   - POST /api/residents
     {
       email: "resident@email.com",
       password: "chosen_password",
       name: "John Doe",
       property_id: "unit_123",
       society_id: "society_uuid",
       invite_code: "unique_code"
     }
   - Backend:
     * Verify invite_code is valid
     * Hash password
     * Create resident record
     * Send confirmation email

2. LOGIN PHASE:
   - Resident visits /{societyName}/resident/login
   - Enters email + password
   - POST /api/auth/login
     {
       email: "resident@email.com",
       password: "chosen_password",
       role: "resident",
       societyId: "society_uuid"
     }
   - Backend creates JWT:
     {
       userId: "resident_id",
       email: "resident@email.com",
       role: "resident",
       societyId: "society_uuid",
       propertyId: "unit_123",
       iat: timestamp
     }
   - Token stored in localStorage
   - Can login from ANY device with same account

3. MULTI-DEVICE LOGIN:
   - Resident A logs in on Phone (Token 1 generated)
   - Same resident logs in on Laptop (Token 2 generated)
   - Both tokens valid simultaneously
   - Both sessions persist independently
   - No session conflicts

4. DASHBOARD ACCESS:
   - Resident visits /{societyName}/resident/dashboard
   - Middleware checks:
     * Token exists in Authorization header
     * Token is valid JWT
     * Role = "resident"
     * societyId in token matches URL societyId
     * propertyId exists
   - Access granted
```

### D. Watchman Flow

```
1. CREATION:
   - Society Admin creates watchman via dashboard
   - Assigns credentials (email + auto-generated password)
   - Sends credentials to watchman (in-app/SMS/email)

2. FIRST LOGIN:
   - Watchman visits /{societyName}/watchman/login
   - Enters credentials provided by society admin
   - JWT Token created with:
     {
       userId: "watchman_id",
       email: "watchman@email.com",
       role: "watchman",
       societyId: "society_uuid",
       duty: "gate_duty"
     }

3. DUTIES:
   - View pending visitors (approved by residents)
   - Check visitor photos
   - Mark check-in/check-out
   - Log suspicious activity
   - Create blacklist entries
```

---

## 3. AUTHENTICATION SYSTEM (DETAILED)

### Token Structure
```javascript
{
  sub: "user_id",           // Subject (who token is for)
  userId: "user_id",        // Explicit user ID
  email: "user@email.com",
  role: "resident",         // or "watchman", "societyadmin", "superadmin"
  societyId: "society_uuid",// Multi-tenancy isolation
  propertyId: "unit_123",   // For residents only
  duty: "gate",             // For watchmen only
  iat: 1625097600,         // Issued at time
  // NO exp field - sessions never expire unless manually logged out
}
```

### Storage Strategy
- **Client**: localStorage under key `auth_token`
- **Transmission**: Authorization header: `Bearer {token}`
- **Server**: Middleware validates on every protected route

### No Expiry Implications
- ✅ User stays logged in indefinitely
- ✅ Works across device restarts
- ✅ Multi-device login works seamlessly
- ⚠️ Manual logout is CRITICAL (no auto-cleanup)
- ⚠️ Device theft = permanent access until manual logout
- ⚠️ Consider adding optional PIN/biometric for resident phones

---

## 4. DATABASE SCHEMA (CURRENT STATE)

### Established Tables:

#### societies
```sql
id (UUID, PK)
name (VARCHAR)
slug (VARCHAR, UNIQUE) -- auto-generated custom URL component
address (TEXT)
contact_email (VARCHAR)
contact_phone (VARCHAR)
admin_id (UUID, FK)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
metadata (JSONB) -- custom settings
```

#### properties/units
```sql
id (UUID, PK)
society_id (UUID, FK)
name (VARCHAR) -- "A-101", "Villa 5", etc
type (ENUM) -- "apartment", "villa", "townhouse"
floor (INT, nullable)
owner_name (VARCHAR)
owner_email (VARCHAR)
area_sqft (INT, nullable)
bedrooms (INT, nullable)
created_at (TIMESTAMP)
```

#### residents
```sql
id (UUID, PK)
society_id (UUID, FK)
property_id (UUID, FK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
name (VARCHAR)
phone (VARCHAR)
emergency_contact_name (VARCHAR)
emergency_contact_phone (VARCHAR)
emergency_contact_relation (VARCHAR)
status (ENUM) -- "active", "inactive", "blocked"
invite_code (VARCHAR, nullable) -- for signup
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### watchmen
```sql
id (UUID, PK)
society_id (UUID, FK)
email (VARCHAR)
password_hash (VARCHAR)
name (VARCHAR)
phone (VARCHAR)
shift (ENUM) -- "morning", "evening", "night"
status (ENUM) -- "active", "inactive"
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### society_admins
```sql
id (UUID, PK)
society_id (UUID, FK)
email (VARCHAR)
password_hash (VARCHAR)
name (VARCHAR)
phone (VARCHAR)
permissions (JSONB) -- granular permissions
created_at (TIMESTAMP)
```

#### superadmins
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
name (VARCHAR)
created_at (TIMESTAMP)
```

#### visitors
```sql
id (UUID, PK)
society_id (UUID, FK)
resident_id (UUID, FK)
watchman_id (UUID, FK)
name (VARCHAR)
phone (VARCHAR)
photo_url (TEXT, nullable) -- Vercel Blob URL
purpose (ENUM)
vehicle_number (VARCHAR, nullable)
status (ENUM) -- "pending", "approved", "rejected", "checkedin", "checkedout"
gate_time (TIMESTAMP)
checkout_time (TIMESTAMP, nullable)
created_at (TIMESTAMP)
```

#### bills
```sql
id (UUID, PK)
society_id (UUID, FK)
property_id (UUID, FK) -- tied to property, not resident
bill_type (ENUM) -- "maintenance", "water", "electricity", "parking"
amount (DECIMAL)
due_date (DATE)
status (ENUM) -- "pending", "paid", "overdue"
payment_date (TIMESTAMP, nullable)
created_at (TIMESTAMP)
```

#### complaints/maintenance
```sql
id (UUID, PK)
society_id (UUID, FK)
resident_id (UUID, FK)
category (VARCHAR)
description (TEXT)
status (ENUM) -- "open", "assigned", "inprogress", "resolved"
priority (ENUM) -- "low", "medium", "high"
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

## 5. API ENDPOINTS BREAKDOWN

### Authentication APIs
- POST /api/auth/login - Unified login for all roles
- POST /api/auth/logout - Clear token
- POST /api/auth/superadmin-login - Specific superadmin login
- POST /api/auth/resident-login - Specific resident login
- POST /api/auth/watchman-login - Specific watchman login
- POST /api/auth/admin-login - Specific admin login

### Society Management
- POST /api/societies - Create society (Superadmin only)
- GET /api/societies - List societies (Superadmin only)

### User Management
- POST /api/residents - Create/signup resident
- GET /api/residents - List residents (Society admin only)
- POST /api/watchmen - Create watchman (Society admin only)
- GET /api/watchmen - List watchmen
- POST /api/society-admins - Create society admin (Superadmin only)

### Guest & Visitor Management
- POST /api/visitors - Create visitor entry (Resident)
- GET /api/visitors - List visitors (Watchman/Resident)
- PUT /api/visitors/{id} - Update visitor status (approve/reject)

### Financial
- GET /api/bills - List bills
- POST /api/bills/pay - Process payment
- POST /api/bills/confirm-payment - Confirm payment
- GET /api/financial - Financial reports

### Maintenance & Complaints
- POST /api/complaints - Create complaint
- GET /api/complaints - List complaints
- PUT /api/complaints/{id} - Update status

### Other
- GET /api/properties - List properties
- GET /api/amenities - List amenities
- GET /api/parcels - Parcel tracking
- GET /api/messages - Messages/notifications
- GET /api/reminders - Bill reminders
- POST /api/emergency - Emergency contacts
- GET /api/blacklist - Blacklisted visitors

---

## 6. MIDDLEWARE & ROUTE PROTECTION

### Flow:
```
Request comes in
    ↓
Middleware.ts checks pathname
    ↓
Is it public? (login, signup)
    └─→ ALLOW
    
Is it dashboard?
    ├─ Extract societyName and role from URL
    ├─ Get token from Authorization header
    ├─ If no token → REDIRECT to login
    ├─ Verify JWT token
    ├─ Check role matches URL role
    ├─ Check societyId in token matches URL
    └─ ALLOW or DENY
```

### Protected Routes:
- /{societyName}/societyadmin/dashboard/*
- /{societyName}/resident/dashboard/*
- /{societyName}/watchman/dashboard/*
- /superadmin-dashboard/*

### Allowed Public Routes:
- /{societyName}/resident/login
- /{societyName}/watchman/login
- /{societyName}/societyadmin/login
- /superadmin-login
- /api/auth/login

---

## 7. CROSS-SOCIETY ACCESS PREVENTION

### Scenario: How does it work?

**Resident A (Property 101, Society XYZ):**
- Token contains: societyId="xyz_uuid"
- Tries: /abc_society/resident/dashboard
- Middleware checks: URL societyId="abc_uuid" ≠ Token societyId="xyz_uuid"
- Result: DENIED (404 or redirect to own society)

**Implementation:**
```
URL: /{societyName}/resident/dashboard
Token: { societyId: "xyz_uuid", ... }

Middleware:
  urlSocietyId = getSocietyIdFromName(societyName)
  tokenSocietyId = token.societyId
  
  if (urlSocietyId !== tokenSocietyId) {
    DENY
  }
```

---

## 8. CURRENT GAPS & CHALLENGES

### G1: Database Tables Not Yet Created
- No Supabase migration script to create these tables
- No RLS (Row Level Security) policies set up
- No database initialization

### G2: API Endpoints Incomplete
- Many endpoints stub files exist but logic not fully implemented
- Need to add society filtering to all queries
- No pagination on list endpoints

### G3: UI Dashboards Incomplete
- Superadmin dashboard partially done (EnhancedDashboard component)
- Society admin dashboard not created
- Resident dashboard exists but not fully integrated
- Watchman dashboard exists but not fully integrated

### G4: Visitor Approval Flow
- Visitor photo storage location unclear (Vercel Blob configured?)
- No approve/reject UI for residents
- No notification system when visitor arrives

### G5: Billing System
- Payment gateway not integrated (Stripe mentioned but not configured)
- No payment processing flow
- No invoice generation

### G6: Error Handling
- Auth failures not graceful
- No retry logic
- Limited error messages to users

---

## 9. RECOMMENDED NEXT STEPS

### Phase 1: Database Foundation
1. Create Supabase migration script (SQL)
2. Set up RLS policies for multi-tenancy
3. Create test data seeding

### Phase 2: Core API Integration
1. Implement full CRUD for all endpoints
2. Add societyId filtering to all queries
3. Add pagination and filtering

### Phase 3: Dashboard Completion
1. Finish society admin dashboard
2. Finish resident dashboard with full features
3. Finish watchman dashboard

### Phase 4: Features
1. Implement visitor photo upload + approval
2. Implement payment integration
3. Add notification system

---

## 10. KEY TECHNICAL DECISIONS

| Decision | Why | Trade-offs |
|----------|-----|-----------|
| JWT No Expiry | Better UX, multi-device works seamlessly | Security risk if device stolen |
| No Exp Field | Simpler, no refresh token needed | No forced re-auth |
| SocietyId in Token | Single source of truth | If societyId changes, token stale |
| Multi-Tenant at App Layer | Flexible, easier to debug | More error-prone than DB-level |
| One Resident per Property | Simpler MVP | Families need shared account |
| Token in localStorage | Easy access from JS | Vulnerable to XSS |

---

## 11. SECURITY CONSIDERATIONS

### Current Implementation
- ✅ JWT tokens signed with secret
- ✅ Password hashing (bcrypt)
- ✅ SocietyId prevents cross-society access
- ✅ Role-based access (middleware validates role)

### Missing
- ❌ HttpOnly Cookies (localStorage vulnerable to XSS)
- ❌ HTTPS only enforcement
- ❌ Rate limiting on login endpoints
- ❌ Session revocation (tokens can't be revoked except via time)
- ❌ Two-factor authentication
- ❌ Audit logs for sensitive operations

---

## 12. SCALABILITY CONSIDERATIONS

### Current Bottlenecks
1. No database indexing strategy
2. No caching (Redis) for frequently accessed data
3. File uploads to Vercel Blob (potential bandwidth cost)
4. No API rate limiting

### Improvements Needed
- Add database indexes on societyId, resident_id, property_id
- Implement Redis for session caching
- Add CDN for photos
- Implement rate limiting

---

