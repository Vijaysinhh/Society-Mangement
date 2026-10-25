# Database Schema Brainstorm & Design
**Based on existing types + your requirements**

---

## Executive Summary

**What You're Building:** A multi-tenant property management system where:
- **Superadmin** creates societies
- **Society Admin** manages their society and creates residents/watchmen
- **Residents** share ONE account across devices but can only login to their property's dashboard
- **Watchmen** manage visitor gate access and check-ins

**Data Isolation:** Row-Level Security (RLS) + Application-level societyId filtering (Recommended approach)

---

## Core Entities & Tables

### 1. **SOCIETIES** (Top-level)
Core information about each property management community.

```sql
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,              -- "Green Valley Apartments"
  slug VARCHAR(255) UNIQUE NOT NULL,       -- URL slug: "green-valley"
  description TEXT,
  
  -- Contact Info
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Settings
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'paused', 'archived'
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  -- URLs (Auto-generated when society created)
  admin_login_url VARCHAR(255) UNIQUE,     -- /{slug}/societyadmin/login
  resident_login_url VARCHAR(255) UNIQUE,  -- /{slug}/resident/login
  watchman_login_url VARCHAR(255) UNIQUE,  -- /{slug}/watchman/login
  
  -- Metadata
  created_by UUID NOT NULL,  -- Superadmin who created
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (created_by) REFERENCES superadmins(id)
);

CREATE INDEX societies_slug ON societies(slug);
CREATE INDEX societies_status ON societies(status);
```

**Why These Fields?**
- `slug` enables dynamic URLs: `/green-valley/resident/login`
- `admin/resident/watchman_login_urls` - custom URLs generated at creation
- URLs allow society admin to share: "Your login is at xyz.com/green-valley/resident/login"

---

### 2. **SUPERADMINS** (System Level)
Only Superadmin accounts that create societies.

```sql
CREATE TABLE superadmins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  
  -- Password (hashed via argon2)
  password_hash VARCHAR(255) NOT NULL,
  
  -- Token
  jwt_secret VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'disabled'
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Why Separate Table?**
- Superadmin is global, not tied to any society
- Needs completely different permissions than society admins

---

### 3. **SOCIETY_ADMINS** (Per-Society)
Admins who manage individual societies.

```sql
CREATE TABLE society_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  
  -- Login credentials
  username VARCHAR(255),                   -- Can be email or custom username
  email VARCHAR(255),
  phone VARCHAR(20),
  name VARCHAR(255),
  
  -- Password (hashed via argon2)
  password_hash VARCHAR(255) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'invited', 'disabled'
  role VARCHAR(50) DEFAULT 'admin',        -- 'admin', 'super-admin' (within society)
  
  -- Access Control
  permissions JSONB DEFAULT '{}',          -- Future: granular permissions
  
  -- Activity
  last_login TIMESTAMP,
  created_by UUID,                         -- Superadmin or another society admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES superadmins(id),
  UNIQUE(society_id, username)
);

CREATE INDEX society_admins_society_id ON society_admins(society_id);
```

**Key Design:**
- One society can have multiple admins (future - for larger communities)
- Username can be email or custom (flexible login)
- `status='invited'` when first created (before they accept)

---

### 4. **PROPERTIES/UNITS** (Per-Society)
Individual units (flats, villas, etc.) in a society.

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  
  -- Unit Info
  unit_number VARCHAR(50),                 -- "101", "A-501", "Villa-12"
  unit_type VARCHAR(50),                   -- 'flat', 'villa', 'bungalow', 'commercial'
  floor INT,                               -- Floor number (nullable for villas)
  status VARCHAR(50) DEFAULT 'available',  -- 'occupied', 'available', 'maintenance'
  
  -- Property Details
  total_area DECIMAL(10,2),                -- Square feet/meters
  bedrooms INT,
  bathrooms INT,
  
  -- Ownership Details (Single Owner Per Property)
  owner_name VARCHAR(255),                 -- Property owner name
  owner_phone VARCHAR(20),
  owner_email VARCHAR(255),
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  UNIQUE(society_id, unit_number)
);

CREATE INDEX properties_society_id ON properties(society_id);
CREATE INDEX properties_status ON properties(status);
```

**Why Single Owner?**
- Simplifies billing and accountability
- If property is rented, owner is the landlord (not the tenant)
- Resident account is tied to this property_id

---

### 5. **RESIDENTS** (Per-Property/Society)
Residents of properties. **ONE account per property, but multiple logins allowed.**

```sql
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  property_id UUID NOT NULL,
  
  -- Account Details
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Password (hashed via argon2)
  password_hash VARCHAR(255) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'invited', 'inactive'
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(100), -- 'spouse', 'parent', 'sibling'
  
  -- Activity
  last_login TIMESTAMP,
  signup_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE(property_id)  -- ONE resident per property
);

CREATE INDEX residents_society_id ON residents(society_id);
CREATE INDEX residents_property_id ON residents(property_id);
```

**Multi-Device Logic:**
- Same phone/password = can login on multiple devices simultaneously
- Token contains: `{ resident_id, property_id, society_id }`
- Each device stores token in localStorage
- No session limit - as many devices as user wants

---

### 6. **WATCHMEN** (Per-Society)
Security staff managing gates and visitor entry.

```sql
CREATE TABLE watchmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  
  -- Personal Info
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Password (hashed via argon2)
  password_hash VARCHAR(255) NOT NULL,
  
  -- Shift Details
  shift VARCHAR(50),                       -- 'morning', 'evening', 'night'
  shift_start TIME,
  shift_end TIME,
  assigned_gate VARCHAR(100),              -- 'main', 'side', 'etc'
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',     -- 'active', 'on-leave', 'inactive'
  
  -- Activity
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  UNIQUE(society_id, phone)
);

CREATE INDEX watchmen_society_id ON watchmen(society_id);
```

---

### 7. **VISITORS** (Per-Society)
Visitor logs with check-in/check-out tracking.

```sql
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  
  -- Visitor Info
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Visit Details
  purpose VARCHAR(255),                    -- 'meeting', 'delivery', 'repair', etc
  property_id UUID,                        -- Which unit visiting (nullable for visitors to common areas)
  resident_id UUID,                        -- Which resident authorized (nullable)
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',    -- 'pending', 'approved', 'denied', 'checked-in', 'checked-out'
  
  -- Photo & Verification
  photo_url VARCHAR(512),                  -- URL to visitor photo
  photo_approved_by UUID,                  -- Resident who approved
  photo_approved_at TIMESTAMP,
  
  -- Gates & Checkpoints
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  checked_in_by UUID,                      -- Watchman ID
  checked_out_by UUID,                     -- Watchman ID
  
  -- Duration Limits
  allowed_until TIMESTAMP,                 -- When visit expires
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE SET NULL,
  FOREIGN KEY (photo_approved_by) REFERENCES residents(id),
  FOREIGN KEY (checked_in_by) REFERENCES watchmen(id),
  FOREIGN KEY (checked_out_by) REFERENCES watchmen(id)
);

CREATE INDEX visitors_society_id ON visitors(society_id);
CREATE INDEX visitors_status ON visitors(status);
CREATE INDEX visitors_property_id ON visitors(property_id);
```

**Visitor Flow:**
1. Resident adds visitor → creates record with `status='pending'`
2. Resident uploads/approves photo → `status='approved'`
3. Watchman checks photo at gate, approves entry → `check_in_time` set, `status='checked-in'`
4. Watchman scans on exit → `check_out_time` set, `status='checked-out'`

---

### 8. **BILLING & PAYMENTS** (Per-Property/Society)
Track maintenance charges, rent, and payments.

```sql
CREATE TABLE billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  property_id UUID NOT NULL,
  resident_id UUID,                        -- Who owes (nullable if owner responsible)
  
  -- Bill Details
  bill_type VARCHAR(50) NOT NULL,          -- 'maintenance', 'utilities', 'parking', 'other'
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Dates
  month_year DATE,                         -- Billing period
  due_date DATE,
  payment_date TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'unpaid',     -- 'unpaid', 'paid', 'partial', 'overdue'
  payment_method VARCHAR(50),              -- 'cash', 'upi', 'bank_transfer', 'cheque'
  transaction_id VARCHAR(255),             -- External payment reference
  
  -- Details
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE SET NULL
);

CREATE INDEX billing_society_id ON billing(society_id);
CREATE INDEX billing_property_id ON billing(property_id);
CREATE INDEX billing_status ON billing(status);
```

---

### 9. **MAINTENANCE REQUESTS** (Per-Society)
Track maintenance issues and resolutions.

```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  property_id UUID,                        -- Which unit (nullable for common area issues)
  created_by_resident_id UUID,             -- Who reported (nullable if society admin)
  
  -- Issue Details
  category VARCHAR(50),                    -- 'plumbing', 'electrical', 'carpentry', etc
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',   -- 'low', 'medium', 'high', 'urgent'
  
  -- Images
  images JSONB DEFAULT '[]',               -- Array of photo URLs
  
  -- Status & Assignment
  status VARCHAR(50) DEFAULT 'open',       -- 'open', 'assigned', 'in-progress', 'resolved', 'closed'
  assigned_to UUID,                        -- Vendor/Worker ID (future table)
  estimated_completion_date DATE,
  actual_completion_date TIMESTAMP,
  
  -- Cost Tracking
  estimated_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  cost_approved_by UUID,                   -- Society admin approval
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_resident_id) REFERENCES residents(id) ON DELETE SET NULL
);

CREATE INDEX maintenance_requests_society_id ON maintenance_requests(society_id);
CREATE INDEX maintenance_requests_status ON maintenance_requests(status);
```

---

### 10. **ACTIVITY LOGS** (Per-Society)
Audit trail for all important actions.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL,
  
  -- Action Details
  action_type VARCHAR(50),                 -- 'login', 'visitor_check_in', 'billing_created', etc
  actor_type VARCHAR(50),                  -- 'resident', 'watchman', 'admin', 'superadmin'
  actor_id UUID,                           -- Who performed action
  
  -- What Changed
  entity_type VARCHAR(50),                 -- 'visitor', 'billing', 'property', etc
  entity_id UUID,
  description TEXT,
  
  -- Meta
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
);

CREATE INDEX activity_logs_society_id ON activity_logs(society_id);
CREATE INDEX activity_logs_created_at ON activity_logs(created_at);
```

---

## Data Isolation Strategy: Recommended Approach

### **Hybrid: RLS + Application Filtering**

**1. Row-Level Security (Supabase RLS)**
```sql
-- Example: Residents can only see their own property's visitors
CREATE POLICY "residents_see_own_visitors"
  ON visitors FOR SELECT
  USING (
    resident_id = auth.uid() OR
    property_id IN (
      SELECT property_id FROM residents WHERE id = auth.uid()
    )
  );
```

**Benefits:**
- Database enforces isolation (can't accidentally query cross-society data)
- Prevents SQL injection attacks
- Backend safety net

**2. Application-Level Filtering (Node.js)**
```typescript
// Every API query includes societyId verification
const residents = await db
  .from('residents')
  .select('*')
  .eq('society_id', req.user.societyId)  // Always filter by societyId
  .eq('property_id', req.user.propertyId);
```

**Benefits:**
- Simpler to debug
- Faster queries (doesn't rely on RLS policy evaluation)
- Clear in code what's being filtered

### Why Hybrid?
- **Defense in Depth**: RLS catches bugs, app filtering is main line
- **Performance**: App filtering is faster than RLS evaluation
- **Auditability**: App code clearly shows data scope

---

## Key Design Decisions Explained

### 1. **No Session Table**
❌ Don't store sessions in DB  
✅ Use JWT tokens with societyId embedded

**Why?**
- JWT is stateless (no database queries for auth)
- Resident can login on multiple devices simultaneously
- Logout is instant (client just clears token)

### 2. **One Resident Per Property**
✅ Simplified model for MVP

**Future Enhancement:**
```sql
-- Later: If you want multiple residents per property
CREATE TABLE property_residents (
  id UUID PRIMARY KEY,
  property_id UUID,
  resident_id UUID,
  role VARCHAR(50),  -- 'owner', 'tenant', 'co-owner', 'family'
  -- ... other fields
);
```

### 3. **Photos in Visitors Table**
✅ Store visitor photo URL + approval metadata

**Alternative: Separate Table**
```sql
CREATE TABLE visitor_photos (
  id UUID,
  visitor_id UUID,
  photo_url VARCHAR(512),
  uploaded_at TIMESTAMP,
  approved_by UUID,
  approved_at TIMESTAMP
);
```

**Recommendation:** Start with visitors table (simpler), refactor to separate table if needed later.

### 4. **Billing Tied to Property, Not Tenant**
✅ Property owner is always billed
✅ Rent/maintenance are property responsibilities

**This allows:**
- Owner to pay even if no tenant
- Accurate billing history across resident changes
- Clear accountability

---

## Next Steps: SQL Migration

1. **Create migration file**: `supabase/migrations/001_initial_schema.sql`
2. **Generate types**: `supabase gen types typescript --local > types/database.ts`
3. **Create RLS policies**: `supabase/migrations/002_rls_policies.sql`
4. **Seed demo data**: `scripts/seed-demo-data.ts`

---

## Future Enhancements (Not MVP)

- [ ] **Parking Slots**: Track vehicle assignments
- [ ] **Services Directory**: List plumbers, electricians, etc.
- [ ] **Documents**: Store NOC, sale deeds, lease agreements
- [ ] **Complaints/Issues**: Resolution tracking
- [ ] **Events**: Community events calendar
- [ ] **Announcements**: Society-wide notifications
- [ ] **Accounts/Ledger**: Detailed financial tracking
- [ ] **Vendors**: Manage approved service providers

---

## Summary Table

| Entity | Scope | Key Field | Purpose |
|--------|-------|-----------|---------|
| **Societies** | System | `slug` | Each community |
| **Superadmins** | System | `email` | Platform administrators |
| **Society Admins** | Per-Society | `society_id` | Manage their society |
| **Properties** | Per-Society | `unit_number` | Individual units |
| **Residents** | Per-Property | `property_id` | Account per property (multiple device logins OK) |
| **Watchmen** | Per-Society | `society_id` | Gate security staff |
| **Visitors** | Per-Society | `property_id` | Guest tracking & approval |
| **Billing** | Per-Property | `property_id` | Charges & payments |
| **Maintenance** | Per-Society | `society_id` | Issue tracking |
| **Activity Logs** | Per-Society | `society_id` | Audit trail |

---

This is a complete, production-ready schema that supports your entire flow from superadmin creating societies down to residents approving visitors.
