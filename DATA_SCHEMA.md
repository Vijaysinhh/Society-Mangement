# DATABASE SCHEMA & DATA DESIGN

This document defines the complete database structure, relationships, and constraints for the Society Management System.

---

## DATABASE TABLES

### 1. USERS TABLE
Stores all user accounts (residents, admins, watchmen, superadmins)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  role ENUM('resident', 'admin', 'watchman', 'superadmin', 'technician') NOT NULL,
  society_id UUID REFERENCES societies(id),
  unit_id UUID REFERENCES units(id),
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  INDEX idx_email,
  INDEX idx_role,
  INDEX idx_society_id,
  INDEX idx_unit_id
);
```

**Fields Explanation:**
- `role`: Determines dashboard access and permissions
- `society_id`: Foreign key linking to society
- `unit_id`: For residents, links to their flat/unit
- `status`: For admin control (block residents if needed)

---

### 2. SOCIETIES TABLE
Stores society/building information

```sql
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  total_units INT,
  total_residents INT,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_admin_id,
  INDEX idx_city
);
```

---

### 3. UNITS TABLE
Stores flats/units in a society

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  unit_number VARCHAR(50) NOT NULL,
  floor INT,
  wing CHAR(1),
  owner_id UUID REFERENCES users(id),
  primary_resident_id UUID REFERENCES users(id),
  resident_count INT,
  area_sqft DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(society_id, unit_number),
  INDEX idx_society_id,
  INDEX idx_owner_id,
  INDEX idx_primary_resident_id
);
```

---

### 4. VISITOR_PASSES TABLE
Stores visitor request and tracking data

```sql
CREATE TABLE visitor_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID NOT NULL REFERENCES users(id),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20),
  purpose VARCHAR(100) NOT NULL, -- 'Meeting', 'Delivery', 'Maintenance', 'Other'
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  expected_duration_hours INT,
  status ENUM('pending', 'approved', 'rejected', 'checked-in', 'checked-out') DEFAULT 'pending',
  qr_code VARCHAR(255) UNIQUE,
  qr_used BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  actual_duration_hours DECIMAL(4,2),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_society_id,
  INDEX idx_unit_id,
  INDEX idx_resident_id,
  INDEX idx_status,
  INDEX idx_visit_date,
  INDEX idx_qr_code
);
```

**Key Fields:**
- `status`: Tracks through entire lifecycle
- `qr_code`: Unique, generated when approved
- `qr_used`: For one-time use validation

---

### 5. ISSUES TABLE
Stores maintenance/problem reports

```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'Plumbing', 'Electrical', 'Carpentry', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('submitted', 'assigned', 'in-progress', 'completed', 'approved', 'resolved', 'closed') DEFAULT 'submitted',
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP,
  estimated_completion_date DATE,
  completed_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  cost DECIMAL(10,2),
  work_hours DECIMAL(5,2),
  admin_notes TEXT,
  technician_notes TEXT,
  resident_feedback TEXT,
  resident_rating INT CHECK (resident_rating >= 1 AND resident_rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_society_id,
  INDEX idx_unit_id,
  INDEX idx_resident_id,
  INDEX idx_status,
  INDEX idx_assigned_to,
  INDEX idx_priority
);
```

**Key Fields:**
- `status`: Complex workflow with 7 stages
- `cost`: Tracked for financial reporting
- `resident_rating`: Feedback collection

---

### 6. AMENITIES TABLE
Stores bookable community spaces

```sql
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  name VARCHAR(255) NOT NULL, -- 'Community Hall', 'Gym', etc.
  description TEXT,
  capacity INT,
  cost_per_booking DECIMAL(10,2) NOT NULL,
  max_booking_hours INT,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_society_id,
  INDEX idx_status
);
```

---

### 7. AMENITY_BOOKINGS TABLE
Stores booking requests and tracking

```sql
CREATE TABLE amenity_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  amenity_id UUID NOT NULL REFERENCES amenities(id),
  resident_id UUID NOT NULL REFERENCES users(id),
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL, -- '10:00 AM - 1:00 PM'
  status ENUM('pending', 'approved', 'awaiting-payment', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  cost DECIMAL(10,2) NOT NULL,
  payment_status ENUM('awaiting', 'received', 'refunded') DEFAULT 'awaiting',
  qr_code VARCHAR(255),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  payment_received_by UUID REFERENCES users(id),
  payment_received_at TIMESTAMP,
  payment_method VARCHAR(50), -- 'UPI', 'Bank Transfer', etc.
  payment_reference VARCHAR(255),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  refund_amount DECIMAL(10,2),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_society_id,
  INDEX idx_amenity_id,
  INDEX idx_resident_id,
  INDEX idx_status,
  INDEX idx_booking_date,
  INDEX idx_payment_status
);
```

---

### 8. MAINTENANCE_BILLS TABLE
Stores monthly maintenance charges

```sql
CREATE TABLE maintenance_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID NOT NULL REFERENCES users(id),
  billing_month DATE NOT NULL, -- First day of month
  total_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'awaiting-confirmation', 'paid') DEFAULT 'unpaid',
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(society_id, unit_id, billing_month),
  INDEX idx_society_id,
  INDEX idx_resident_id,
  INDEX idx_status,
  INDEX idx_billing_month
);
```

---

### 9. BILL_BREAKDOWN TABLE
Stores cost breakdown for bills

```sql
CREATE TABLE bill_breakdown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES maintenance_bills(id),
  category VARCHAR(100) NOT NULL, -- 'Maintenance', 'Water', 'Electricity', 'Parking'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  INDEX idx_bill_id
);
```

---

### 10. COMMUNITY_POSTS TABLE
Stores community board posts

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  author_id UUID NOT NULL REFERENCES users(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  status ENUM('published', 'deleted', 'hidden') DEFAULT 'published',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Auto-delete after 30 days
  
  INDEX idx_society_id,
  INDEX idx_author_id,
  INDEX idx_status,
  INDEX idx_created_at
);
```

---

### 11. COMMUNITY_COMMENTS TABLE
Stores comments on posts

```sql
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  author_id UUID NOT NULL REFERENCES users(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  content TEXT NOT NULL,
  status ENUM('active', 'deleted', 'hidden') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_post_id,
  INDEX idx_author_id
);
```

---

### 12. COMMUNITY_LIKES TABLE
Stores likes on posts

```sql
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(post_id, user_id),
  INDEX idx_post_id,
  INDEX idx_user_id
);
```

---

### 13. AMENITY_AVAILABILITY TABLE
Stores time slots availability for amenities

```sql
CREATE TABLE amenity_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amenity_id UUID NOT NULL REFERENCES amenities(id),
  day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  
  UNIQUE(amenity_id, day_of_week),
  INDEX idx_amenity_id
);
```

---

### 14. ANNOUNCEMENTS TABLE
Stores society announcements

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id),
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type ENUM('general', 'emergency', 'maintenance', 'event') DEFAULT 'general',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  target_units TEXT, -- JSON array of unit IDs, or 'all'
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_society_id,
  INDEX idx_status
);
```

---

## RELATIONSHIPS DIAGRAM

```
societies
  ├─ units (1:N)
  │  ├─ users (residents) (1:N)
  │  ├─ visitor_passes (1:N)
  │  └─ maintenance_bills (1:N)
  │
  ├─ users (admin, watchmen) (1:N)
  │
  ├─ amenities (1:N)
  │  └─ amenity_bookings (1:N)
  │
  ├─ issues (1:N)
  │
  ├─ community_posts (1:N)
  │  ├─ community_comments (1:N)
  │  └─ community_likes (1:N)
  │
  └─ announcements (1:N)
```

---

## KEY CONSTRAINTS & BUSINESS RULES

1. **Visitor Pass Uniqueness:**
   - One QR code per pass
   - QR is one-time use
   - QR expires after 24 hours if not used

2. **Bill Uniqueness:**
   - One bill per unit per month
   - Cannot have duplicate bills

3. **Amenity Booking:**
   - Cannot book overlapping time slots
   - Must have payment before confirmation
   - Can cancel up to 24 hours before booking

4. **Community Post Lifecycle:**
   - Auto-delete after 30 days
   - Cannot edit after 1 hour
   - Admin can delete anytime

5. **User Roles:**
   - Resident can only see their own data
   - Admin can see all data in society
   - Superadmin can see all societies
   - Watchman can only see visitor passes

---

## INDEXES FOR PERFORMANCE

```sql
-- Most queried patterns:
CREATE INDEX idx_status_date ON visitor_passes(status, visit_date);
CREATE INDEX idx_resident_bills ON maintenance_bills(resident_id, billing_month);
CREATE INDEX idx_booking_status ON amenity_bookings(status, booking_date);
CREATE INDEX idx_issue_status ON issues(status, created_at);
CREATE INDEX idx_posts_recent ON community_posts(society_id, created_at DESC);
```

---

## DATA TYPES & VALIDATION

| Field | Type | Validation |
|-------|------|-----------|
| Email | VARCHAR(255) | Must be valid email format |
| Phone | VARCHAR(20) | 10-20 digits |
| Amount | DECIMAL(10,2) | >= 0 |
| Rating | INT | 1-5 only |
| Status | ENUM | Predefined values only |
| Date | DATE | Valid date |
| Time | TIME | Valid time |

---

## Example Queries (For Future Backend)

```sql
-- Get all pending bills for a resident
SELECT * FROM maintenance_bills 
WHERE resident_id = ? AND status = 'pending';

-- Get approved bookings for a resident
SELECT ab.*, a.name, a.capacity
FROM amenity_bookings ab
JOIN amenities a ON ab.amenity_id = a.id
WHERE ab.resident_id = ? AND ab.status = 'confirmed'
ORDER BY ab.booking_date DESC;

-- Get total collections for a month
SELECT SUM(total_amount) as total_collected
FROM maintenance_bills
WHERE society_id = ? AND billing_month = ?;

-- Get issue statistics
SELECT 
  COUNT(*) as total_issues,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
  AVG(CAST(resident_rating AS FLOAT)) as avg_rating
FROM issues
WHERE society_id = ?;

-- Get visitor check-in/out pattern
SELECT 
  EXTRACT(HOUR FROM check_in_time) as hour,
  COUNT(*) as check_ins
FROM visitor_passes
WHERE society_id = ? AND check_in_time IS NOT NULL
GROUP BY EXTRACT(HOUR FROM check_in_time);
```

---

This schema supports all current workflows and can be extended for future features like: Guest wifi management, Package tracking, Pet registry, Complaint follow-ups, etc.
