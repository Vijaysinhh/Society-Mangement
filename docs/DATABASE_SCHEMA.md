# Property Management System - Database Schema Design

## Multi-Tenancy Strategy: Row-Level Security (RLS) + Application Filtering

### Why RLS?
1. **Security**: Enforced at database level - even if app logic fails, data stays isolated
2. **Supabase Native**: Built-in support with `auth.uid()` and custom policies
3. **Scalable**: Works perfectly as system grows
4. **Compliance**: Industry standard for multi-tenant apps

### Why Application Filtering?
- Double validation: RLS catches accidental queries, app logic filters results
- Better error handling and user feedback
- Audit trails easier to implement

---

## Core Tables & Fields

### 1. SOCIETIES (Root tenant entity)
**Purpose**: Store each community/society
```sql
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,  -- Used in URLs:/{slug}/resident/login
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  logo_url VARCHAR(255),
  total_units INT DEFAULT 0,
  settings JSONB DEFAULT '{
    "max_residents_per_unit": 4,
    "visitor_approval_required": true,
    "check_out_approval": false
  }',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS: Everyone can read (for signup pages), but only admins can update
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
```

---

### 2. USERS - Superadmin (System level)
**Purpose**: System-level superadmins who manage societies
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'superadmin',
  name VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS: Users can only read/update their own record
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

### 3. SOCIETY_ADMINS (Tenant-level admins)
**Purpose**: Admin for each society, manages residents/watchmen/properties
```sql
CREATE TABLE society_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'society_admin',
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{
    "can_manage_residents": true,
    "can_manage_watchmen": true,
    "can_manage_properties": true,
    "can_view_reports": true
  }',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(society_id, email)
);

-- RLS: Admins can only access their own society
ALTER TABLE society_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_access_own_society" ON society_admins
  USING (society_id = (SELECT society_id FROM auth.jwt() WHERE claim = 'societyId'));
```

---

### 4. PROPERTIES/UNITS
**Purpose**: Individual apartments, villas, or units in a society
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,  -- e.g., "A-101", "Villa-5"
  unit_type VARCHAR(50) NOT NULL,    -- 'apartment', 'villa', 'townhouse'
  floor_number INT,
  wing_name VARCHAR(50),             -- e.g., "Wing A", "Building 1"
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  owner_phone VARCHAR(20),
  total_bedrooms INT,
  total_occupants INT DEFAULT 1,
  property_status VARCHAR(50) DEFAULT 'active',  -- 'active', 'vacant', 'under_maintenance'
  metadata JSONB DEFAULT '{}',       -- Store extra info: sq_ft, amenities, etc.
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(society_id, unit_number)
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "residents_access_own_property" ON properties
  USING (society_id = (SELECT society_id FROM auth.jwt() WHERE claim = 'societyId'));
```

---

### 5. RESIDENTS (Tenant users)
**Purpose**: People living in properties
```sql
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'resident',
  profile_photo_url VARCHAR(255),
  occupation VARCHAR(100),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(society_id, email),
  UNIQUE(property_id)  -- One resident per property (can adjust if needed)
);

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "residents_access_own_society" ON residents
  USING (society_id = (SELECT society_id FROM auth.jwt() WHERE claim = 'societyId'));
```

---

### 6. WATCHMEN (Security staff)
**Purpose**: Gate security and staff managing visitor entry
```sql
CREATE TABLE watchmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'watchman',
  employee_id VARCHAR(50),
  shift_timing VARCHAR(50),          -- 'morning', 'evening', 'night', 'flexible'
  shift_start_time TIME,
  shift_end_time TIME,
  is_active BOOLEAN DEFAULT true,
  profile_photo_url VARCHAR(255),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(society_id, email)
);

ALTER TABLE watchmen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchmen_access_own_society" ON watchmen
  USING (society_id = (SELECT society_id FROM auth.jwt() WHERE claim = 'societyId'));
```

---

### 7. VISITORS (Visitor log/gate pass system)
**Purpose**: Track who visits, when, and their status
```sql
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  watchman_id UUID NOT NULL REFERENCES watchmen(id),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20),
  visitor_email VARCHAR(255),
  purpose_of_visit VARCHAR(255) NOT NULL,
  visit_type VARCHAR(50) DEFAULT 'entry',  -- 'entry', 'checkout'
  visitor_photo_url VARCHAR(255),
  vehicle_info VARCHAR(255),               -- License plate, etc.
  gate_time TIMESTAMP NOT NULL,           -- When logged at gate
  approval_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'denied'
  approved_by UUID REFERENCES residents(id),
  approval_time TIMESTAMP,
  entry_time TIMESTAMP,
  exit_time TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
```

---

### 8. COMPLAINTS/NOTICES
**Purpose**: Community issues, maintenance requests, notices
```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  -- 'maintenance', 'noise', 'cleaning', 'others'
  priority VARCHAR(50) DEFAULT 'normal',  -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'open',      -- 'open', 'in_progress', 'resolved', 'closed'
  assigned_to UUID REFERENCES society_admins(id),
  resolution_notes TEXT,
  attachment_urls JSONB DEFAULT '[]',
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
```

---

### 9. AMENITIES
**Purpose**: Society facilities and recreational areas
```sql
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amenity_type VARCHAR(50),        -- 'gym', 'pool', 'community_hall', 'park', 'parking'
  location VARCHAR(255),
  capacity INT,                    -- Max people at same time
  is_bookable BOOLEAN DEFAULT true,
  booking_rules JSONB DEFAULT '{
    "max_hours_per_booking": 2,
    "advance_booking_days": 7,
    "cancellation_hours": 24
  }',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(society_id, name)
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
```

---

### 10. AMENITY_BOOKINGS
**Purpose**: Resident bookings for amenities
```sql
CREATE TABLE amenity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/3600) STORED,
  status VARCHAR(50) DEFAULT 'confirmed',  -- 'confirmed', 'cancelled', 'completed'
  number_of_guests INT DEFAULT 1,
  special_requirements TEXT,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
```

---

### 11. ANNOUNCEMENTS
**Purpose**: Society-wide messages from admin
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES society_admins(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) DEFAULT 'general',  -- 'maintenance', 'event', 'notice', 'general'
  visibility VARCHAR(50) DEFAULT 'all',  -- 'all', 'residents', 'admins'
  attachment_urls JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
```

---

### 12. AUDIT_LOGS (Optional but recommended)
**Purpose**: Track all important actions for security/compliance
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  user_id UUID,  -- NULL if system action
  user_type VARCHAR(50),  -- 'superadmin', 'society_admin', 'resident', 'watchman'
  action VARCHAR(255) NOT NULL,      -- 'create_resident', 'approve_visitor', etc.
  entity_type VARCHAR(50),           -- 'resident', 'visitor', 'property'
  entity_id UUID,
  changes JSONB,                     -- What changed: {old_value, new_value}
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

---

## Relationships Summary

```
societies (root)
├── society_admins
├── properties
│   └── residents
├── watchmen
├── visitors (logged by watchmen, approved by residents)
├── complaints
├── amenities
│   └── amenity_bookings (by residents)
├── announcements (by society_admins)
└── audit_logs
```

---

## Key Design Decisions

### 1. **Email as Unique Identifier per Society**
- `(society_id, email)` unique constraint means same email can sign up in different societies
- Perfect for your multi-tenant model

### 2. **Passwords as Hash (No Plain Text)**
- Always hash before storing
- Use bcrypt or similar

### 3. **JSONB for Flexible Settings**
- `settings`, `metadata`, `permissions` stored as JSONB
- Can add new settings without schema migration
- Query-able with PostgreSQL operators

### 4. **Soft Delete Alternative**
- Use `is_active` boolean instead of hard delete
- Preserves audit trail and relationships

### 5. **Timestamps**
- `created_at` and `updated_at` on all tables
- Helps with auditing and debugging

---

## What's NOT in this schema yet (discuss later):

1. **Complaints/Maintenance Assignments** - More complex workflow tracking
2. **User Notifications** - Notification log and preferences
3. **Payments/Billing** - Monthly dues, amenity charges
4. **Parking Slots** - If you need detailed parking management
5. **Emergency Contacts** - Besides field in residents
6. **Multiple Properties per Resident** - Currently one resident per property
7. **Family Members/Dependents** - Additional people in unit

---

## Questions to Finalize Design:

1. Can one property have multiple residents? (Family members, roommates)
2. Do visitors need photo approval workflow?
3. Should we track check-in/checkout times for residents?
4. Do residents have different access levels within a property?
5. Should we store complaint/maintenance attachment files?
6. Do you need expense tracking or just complaints?
7. Should amenity bookings have approval workflow or auto-confirm?

