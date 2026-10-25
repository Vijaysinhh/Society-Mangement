# Multi-Tenant Backend Architecture Plan
## Society Management System - v1.0

---

## EXECUTIVE SUMMARY

Currently, the system is **100% frontend with localStorage**, making it unsuitable for multi-tenant production. This document outlines the architecture for a scalable, secure, multi-tenant backend supporting 10-20 societies with ~1000 concurrent users.

**Key Decision:** Row-level database tenancy (PostgreSQL) for optimal scalability at this level.

---

## PART 1: CURRENT SYSTEM ANALYSIS

### 1.1 Current State
```
Frontend Only (Next.js 16)
├── Dashboards (React)
│   ├── Super Admin Dashboard (/superadmin-dashboard)
│   ├── Society Admin Dashboard (/society-admin)
│   ├── Resident Dashboard (/resident-dashboard)
│   └── Watchman Dashboard (/watchman-dashboard)
└── Storage: localStorage (EventEmitter for real-time)
```

### 1.2 Current Data Models

**Core Entities (from centralDataStore.ts):**

```typescript
// Visitors
Visitor: {
  id, name, phone, unitNumber, residentName, purpose,
  arrivalTime, status (pending|approved|denied|checked-in|checked-out),
  approvedBy, approvalTime, checkedInBy, checkedInTime, notes
}

// Issues (consolidated system)
Issue: {
  id, type (admin-work-order|resident-report|help-request|watchman-incident),
  title, description, category, createdBy, createdAt, unitAffected,
  status, priority, assignedTo, completionPercentage, updates[], visibility,
  createdByAdmin, reportedBy, attachments
}

// Financial
Bill: {
  id, unitNumber, residentId, residentName, type, month, amount,
  dueDate, status (paid|pending|overdue|partial), paymentDate, amountPaid,
  notes, lateFee, daysOverdue, breakdown[], disputed, createdAt
}

Payment: {
  id, billId, residentId, unitNumber, amount, paymentDate, method,
  recordedBy, reference, status, createdAt
}

// Communication
Announcement: {
  id, title, content, createdBy, createdAt, expiryDate,
  priority (low|medium|high), visibility (residents|watchmen|admin|all),
  readBy[]
}

// Watchman Operations
WatchmanShift: {
  id, watchmanId, watchmanName, date, startTime, endTime,
  status (scheduled|checked-in|checked-out|completed),
  checkInTime, checkOutTime, incidents[], notes
}

Incident: {
  id, shiftId, watchmanId, title, description, location,
  severity (low|medium|high|critical), reportedAt,
  status (reported|acknowledged|resolved), notes
}

// Authentication (3-tier)
SuperAdminAccount: {
  id, email, passwordHash, createdAt, lastPasswordChange, isActive
}

SocietyAdminAccount: {
  id, societyId, username, passwordHash, createdBy, createdAt,
  lastPasswordChange, isActive, customAdminPosition
}

ResidentAccount: {
  id, email, passwordHash, societyId, unitNumber, fullName, phoneNumber,
  createdAt, lastPasswordChange, isActive, passwordResetToken, passwordResetExpiry
}

// Audit & Security
ActivityLog: {
  id, timestamp, accountType, accountId, accountIdentifier, ipAddress,
  userAgent, action, details, status (success|failed), societyId
}

SessionRecord: {
  id, accountType, accountId, accountIdentifier, ipAddress, userAgent,
  loginTime, lastActivityTime, isActive, societyId
}
```

### 1.3 Current Data Flows

**Visitor Workflow:**
```
Watchman logs visitor (+ photos)
    ↓ (event: visitors:added)
Resident receives notification
    ↓ (approveVisitor())
Admin sees visitor in Visitors page
    ↓ (watchman checks in)
Tracked in resident's visitor logs
    ↓ (data appears in visitor overview stats)
Admin views rejection counts, approval rates
```

**Issue Workflow:**
```
Resident submits issue
    ↓ (event: issues:added, type='resident-report')
Admin receives in Issues page
    ↓ (assignIssue(), updateIssueStatus())
Resident sees status updates
    ↓ (event: issues:updated)
Tracked in monthly overview stats
```

**Financial Workflow:**
```
Admin creates bill
    ↓ (addBill())
Resident views bill
    ↓ (recordPayment())
Admin sees collection data
    ↓ (tracked in dashboard stats)
```

**Watchman Duty Workflow:**
```
Admin creates shift
    ↓ (addShift())
Watchman clocks in
    ↓ (shift status: checked-in)
Watchman logs incident
    ↓ (addIncident())
Admin sees performance metrics
    ↓ (visitors logged count, attendance %)
```

### 1.4 Current Limitations

| Issue | Impact | Severity |
|-------|--------|----------|
| No persistent storage | Data lost on browser clear | CRITICAL |
| No multi-tenant isolation | Cannot differentiate societies | CRITICAL |
| No concurrent user handling | Single user per browser only | CRITICAL |
| No authorization layer | Anyone can access anything | CRITICAL |
| No audit trail | No compliance, no accountability | HIGH |
| No transaction support | Data inconsistency possible | HIGH |
| No real-time sync | Updates only via localStorage | HIGH |
| No pagination/filtering | Memory issues at scale | MEDIUM |
| No caching | Slow dashboard loads | MEDIUM |
| No backup/disaster recovery | Data loss risk | HIGH |

---

## PART 2: MULTI-TENANT ARCHITECTURE DESIGN

### 2.1 Tenancy Model: ROW-LEVEL (Recommended)

**Why Row-Level?**
- Cost-effective (single database)
- Easy to manage (one schema)
- Good for 10-20 societies
- Scaling: Can handle 50+ societies before needing schema-per-tenant
- Backup/restore: Single point

**How It Works:**
```sql
-- Every table includes society_id for filtering
CREATE TABLE visitors (
  id UUID PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES societies(id),
  name VARCHAR NOT NULL,
  -- ... other columns
  CONSTRAINT visitors_fk FOREIGN KEY (society_id) REFERENCES societies(id)
);

-- Society admin queries only their data:
SELECT * FROM visitors WHERE society_id = $1;

-- Cross-society leakage prevented by middleware
```

### 2.2 Database Schema (PostgreSQL)

```sql
-- Tenant Foundation
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  subscription_tier VARCHAR(50) DEFAULT 'standard', -- free|standard|premium
  address VARCHAR(500),
  city VARCHAR(100),
  properties_count INT DEFAULT 0,
  residents_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES superadmin_accounts(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Super Admin (1 per system)
CREATE TABLE superadmin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_password_change TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Society Admin (Multi per society, but max customAdminPosition)
CREATE TABLE society_admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_by UUID REFERENCES superadmin_accounts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_password_change TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  custom_admin_position INT,
  CONSTRAINT unique_society_admin UNIQUE(society_id, username)
);

-- Residents
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  unit_id UUID REFERENCES units(id),
  family_size INT,
  emergency_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_password_change TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  password_reset_token VARCHAR(255),
  password_reset_expiry TIMESTAMP,
  CONSTRAINT unique_resident_email UNIQUE(society_id, email)
);

-- Units/Properties
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  floor_number INT,
  building_name VARCHAR(100),
  resident_id UUID REFERENCES residents(id),
  occupancy_status VARCHAR(50) DEFAULT 'vacant', -- occupied|vacant|for-sale|for-rent
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_unit UNIQUE(society_id, unit_number)
);

-- Watchmen
CREATE TABLE watchmen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  employee_id VARCHAR(100),
  assigned_areas VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active', -- active|inactive|on-leave
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shifts
CREATE TABLE watchman_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled|checked-in|checked-out|completed
  checked_in_time TIMESTAMP,
  checked_out_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visitors
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  watchman_id UUID REFERENCES watchmen(id),
  purpose TEXT,
  arrival_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending|approved|denied|checked-in|checked-out
  approved_by UUID REFERENCES residents(id),
  approval_time TIMESTAMP,
  checked_in_by UUID REFERENCES watchmen(id),
  checked_in_time TIMESTAMP,
  checked_out_time TIMESTAMP,
  vehicle_number VARCHAR(50),
  vehicle_type VARCHAR(50),
  id_proof_photo_url VARCHAR(500),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Issues (Consolidated)
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- admin-work-order|resident-report|watchman-incident|help-request
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  unit_id UUID REFERENCES units(id),
  created_by_id UUID NOT NULL,
  created_by_type VARCHAR(50) NOT NULL, -- resident|admin|watchman
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'created', -- created|started|in-progress|completed|on-hold|resolved
  priority VARCHAR(50) DEFAULT 'medium', -- low|medium|high|critical|urgent
  assigned_to UUID,
  assigned_at TIMESTAMP,
  completion_percentage INT DEFAULT 0,
  visibility VARCHAR(50) DEFAULT 'affected-unit', -- creator-only|affected-unit|all-residents
  estimated_completion_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Issue Updates (Audit Trail)
CREATE TABLE issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  updated_by_id UUID NOT NULL,
  updated_by_type VARCHAR(50) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents (Watchman Reports)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES watchman_shifts(id) ON DELETE CASCADE,
  watchman_id UUID NOT NULL REFERENCES watchmen(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  severity VARCHAR(50) NOT NULL, -- low|medium|high|critical
  reported_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'reported', -- reported|acknowledged|resolved
  issue_id UUID REFERENCES issues(id), -- Link to issue if escalated
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  billing_month DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending|paid|overdue|partial
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  late_fee DECIMAL(10, 2) DEFAULT 0,
  is_disputed BOOLEAN DEFAULT false,
  breakdown JSONB, -- {maintenance: 5000, water: 1000, ...}
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_monthly_bill UNIQUE(society_id, resident_id, billing_month)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- cash|check|bank-transfer|card|upi
  recorded_by UUID REFERENCES society_admin_accounts(id),
  payment_date TIMESTAMP NOT NULL,
  reference_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed', -- completed|pending|failed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by_id UUID NOT NULL REFERENCES society_admin_accounts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  priority VARCHAR(50) DEFAULT 'low', -- low|medium|high
  visibility VARCHAR(50) DEFAULT 'all', -- residents|watchmen|admin|all
  is_pinned BOOLEAN DEFAULT false
);

-- Announcement Read Tracking
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  reader_id UUID NOT NULL,
  reader_type VARCHAR(50) NOT NULL, -- resident|admin|watchman
  read_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logs (Audit Trail)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL, -- superadmin|admin|resident|watchman
  account_id UUID NOT NULL,
  account_identifier VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  action VARCHAR(100) NOT NULL, -- login|logout|create|update|delete|approve|deny
  action_on VARCHAR(100), -- what entity (visitor|bill|issue|etc)
  action_on_id UUID,
  details JSONB,
  status VARCHAR(50) DEFAULT 'success', -- success|failed
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_activity_society (society_id),
  INDEX idx_activity_account (account_id),
  INDEX idx_activity_action (action)
);

-- Session Records (Active Sessions)
CREATE TABLE session_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL,
  account_id UUID NOT NULL,
  account_identifier VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_time TIMESTAMP DEFAULT NOW(),
  last_activity_time TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  INDEX idx_session_active (is_active)
);

-- Blocked Visitors
CREATE TABLE blocked_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### 2.3 Indexes for Performance

```sql
-- Most queried: Society + Status
CREATE INDEX idx_visitors_society_status ON visitors(society_id, status);
CREATE INDEX idx_issues_society_status ON issues(society_id, status);
CREATE INDEX idx_bills_society_status ON bills(society_id, status);
CREATE INDEX idx_residents_society_active ON residents(society_id, is_active);
CREATE INDEX idx_shifts_society_date ON watchman_shifts(society_id, shift_date);

-- Time-based queries
CREATE INDEX idx_visitors_created_at ON visitors(society_id, created_at DESC);
CREATE INDEX idx_issues_created_at ON issues(society_id, created_at DESC);
CREATE INDEX idx_payments_created_at ON payments(society_id, created_at DESC);

-- Foreign key optimization
CREATE INDEX idx_bills_resident ON bills(resident_id);
CREATE INDEX idx_visitors_resident ON visitors(resident_id);
CREATE INDEX idx_issues_unit ON issues(unit_id);

-- Audit trail
CREATE INDEX idx_activity_logs_account ON activity_logs(society_id, account_id, created_at DESC);
```

---

## PART 3: API ARCHITECTURE

### 3.1 API Structure

```
Backend Framework: Node.js + Express.js (or Fastify)
Authentication: JWT (society_id in token payload)
Rate Limiting: Per-tenant (prevent one society affecting another)
Caching: Redis (session cache, frequently accessed data)

BASE_URL: https://api.yourdomain.com/api

Routes Pattern:
/api/v1/auth
/api/v1/superadmin
/api/v1/society/{societyId}/*
  └── /visitors
  └── /residents
  └── /units
  └── /watchmen
  └── /shifts
  └── /issues
  └── /bills
  └── /payments
  └── /announcements
  └── /activity-logs
```

### 3.2 Authentication Flow

```typescript
// JWT Payload Structure
{
  userId: "abc-123",
  accountType: "admin" | "resident" | "superadmin" | "watchman",
  societyId: "society-xyz", // NULL for superadmin
  email: "admin@society.com",
  iat: timestamp,
  exp: timestamp + 8 hours
}

// Middleware: Verify society_id in request matches JWT
verifyTenantAccess(req, res, next) {
  const requestedSociety = req.params.societyId;
  const tokenSociety = req.user.societyId;
  
  if (requestedSociety !== tokenSociety) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// SuperAdmin bypass (can see any society)
if (req.user.accountType === 'superadmin') {
  next(); // No restriction
}
```

### 3.3 Sample Endpoints

```
VISITOR MANAGEMENT
POST   /api/v1/society/:societyId/visitors
GET    /api/v1/society/:societyId/visitors
GET    /api/v1/society/:societyId/visitors/:visitorId
PATCH  /api/v1/society/:societyId/visitors/:visitorId/approve
PATCH  /api/v1/society/:societyId/visitors/:visitorId/deny
PATCH  /api/v1/society/:societyId/visitors/:visitorId/check-in
PATCH  /api/v1/society/:societyId/visitors/:visitorId/check-out

ISSUE MANAGEMENT
POST   /api/v1/society/:societyId/issues
GET    /api/v1/society/:societyId/issues?status=open&type=resident-report
PATCH  /api/v1/society/:societyId/issues/:issueId
POST   /api/v1/society/:societyId/issues/:issueId/updates

BILL & PAYMENT
POST   /api/v1/society/:societyId/bills
GET    /api/v1/society/:societyId/bills?resident_id=xyz&status=pending
POST   /api/v1/society/:societyId/payments
GET    /api/v1/society/:societyId/payments/collection-summary

WATCHMAN
POST   /api/v1/society/:societyId/watchmen/:watchmanId/shift/check-in
PATCH  /api/v1/society/:societyId/watchmen/:watchmanId/shift/check-out
GET    /api/v1/society/:societyId/watchmen/:watchmanId/performance

ANNOUNCEMENTS
POST   /api/v1/society/:societyId/announcements
GET    /api/v1/society/:societyId/announcements
PATCH  /api/v1/society/:societyId/announcements/:announcementId/mark-read

STATISTICS & REPORTS
GET    /api/v1/society/:societyId/dashboard/overview (monthly stats)
GET    /api/v1/society/:societyId/dashboard/visitors-overview
GET    /api/v1/society/:societyId/reports/collection-summary
GET    /api/v1/society/:societyId/reports/incident-summary
GET    /api/v1/society/:societyId/reports/watchman-performance
```

### 3.4 Real-Time Updates (WebSocket)

```typescript
// Connection: Authenticated WebSocket
WS: wss://api.yourdomain.com/socket
Auth: JWT in connection payload

// Events (Server → Client)
// Visitor events
visitor:approved → Watchman
visitor:denied → Resident
visitor:checked-in → Resident
visitor:checked-out → Resident

// Issue events
issue:created → Assigned users + Admin
issue:updated → All watchers
issue:completed → Creator + Residents

// Bill & Payment events
bill:due-reminder → Resident
payment:recorded → Resident

// Announcement events
announcement:new → Eligible users (based on visibility)

// Incident events
incident:reported → Admin
incident:escalated → Admin + Affected residents

// Real-time data feeds
activity-log:entry → Admin (for dashboard)
watchman:shift-status → Admin + Residents (who watchman is on duty)
```

---

## PART 4: PERFORMANCE & SCALABILITY

### 4.1 Connection Pooling

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Max connections in pool
  min: 5,  // Min connections kept alive
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4.2 Caching Strategy (Redis)

```javascript
// Session cache (expires after 8 hours)
cache.set(`session:${token}`, user, 'EX', 28800);

// Frequently accessed data (expires after 1 hour)
cache.set(`society:${societyId}:residents`, residents, 'EX', 3600);
cache.set(`society:${societyId}:units`, units, 'EX', 3600);

// Real-time counters (no expiry)
cache.incr(`society:${societyId}:visitors:pending`);
cache.decr(`society:${societyId}:visitors:pending`);

// Cache invalidation on update
cache.del(`society:${societyId}:visitors`);
```

### 4.3 Query Optimization

```sql
-- Batch operations for reporting
SELECT 
  v.status, 
  COUNT(*) as count
FROM visitors v
WHERE v.society_id = $1 
  AND v.created_at >= $2
GROUP BY v.status;

-- Pagination for large datasets
SELECT * FROM visitors 
WHERE society_id = $1 
ORDER BY created_at DESC 
LIMIT $2 OFFSET $3;

-- Monthly bills aggregation
SELECT 
  billing_month,
  COUNT(*) as bill_count,
  SUM(amount) as total_amount,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as collected,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
FROM bills
WHERE society_id = $1 
  AND billing_month BETWEEN $2 AND $3
GROUP BY billing_month;
```

### 4.4 Load Testing Targets

```
Target Concurrent Users: 100-200 across all societies
Max Concurrent Per Society: 20-30

Load Test Scenarios:
1. 10 societies × 10 concurrent users = 100 users (baseline)
2. 20 societies × 10 concurrent users = 200 users (peak)
3. Spike: Single society with 30 concurrent users during collection

Acceptable Performance:
- API response time: <500ms (p95)
- Database query time: <200ms (p95)
- WebSocket message delivery: <100ms
- Real-time notification latency: <500ms
```

---

## PART 5: DEPLOYMENT ARCHITECTURE

### 5.1 Recommended Stack

```
Frontend: Next.js 16 (existing)
Backend: Node.js 20 + Express.js / Fastify
Database: PostgreSQL 14+ (AWS RDS or self-hosted)
Cache: Redis 7+ (AWS ElastiCache or self-hosted)
Real-time: Socket.io or native WebSockets
File Storage: Vercel Blob / AWS S3
Deployment: Docker + Kubernetes or Vercel
CI/CD: GitHub Actions
Monitoring: Datadog / New Relic / Prometheus
Logging: ELK Stack / Datadog
```

### 5.2 Environment Configuration

```
Database: Connection string with pool config
Redis: Connection URL with password
JWT Secret: 64-character random string
File Storage: Bucket name + credentials
Email Service: SendGrid / AWS SES API key
SMS Service: Twilio / Exotel API key
Stripe: API keys for payments (future)
```

---

## PART 6: MIGRATION PLAN (Frontend to Backend)

### Phase 1: Backend Infrastructure (Week 1-2)
- [ ] Set up PostgreSQL database
- [ ] Design schema (as above)
- [ ] Set up Redis cache
- [ ] Create API project (Node.js)

### Phase 2: Core API Endpoints (Week 3-4)
- [ ] Authentication endpoints (login, signup, refresh token)
- [ ] Visitor management endpoints
- [ ] Issue management endpoints
- [ ] Implement JWT middleware

### Phase 3: Data Migration (Week 5)
- [ ] Create migration script: localStorage → PostgreSQL
- [ ] Test data integrity
- [ ] Back up existing data
- [ ] Run migration

### Phase 4: Frontend Updates (Week 6)
- [ ] Replace localStorage calls with API calls
- [ ] Update context/state management to use API
- [ ] Add error handling
- [ ] Test all flows

### Phase 5: Real-Time Features (Week 7)
- [ ] Set up WebSocket server
- [ ] Connect frontend to WebSocket
- [ ] Test real-time notifications

### Phase 6: Testing & Deployment (Week 8)
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

## PART 7: SECURITY CHECKLIST

- [ ] All API endpoints verify society_id from JWT
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting (per IP, per user, per endpoint)
- [ ] CORS configured (frontend domain only)
- [ ] HTTPS enforced (TLS 1.3)
- [ ] Passwords hashed (bcrypt with salt rounds 12)
- [ ] Secrets in environment variables (never in code)
- [ ] Activity logging on all sensitive operations
- [ ] Session timeout (8 hours default)
- [ ] Two-factor auth for SuperAdmin (optional Phase 2)
- [ ] Data encryption at rest (database encryption)
- [ ] GDPR compliance (data retention, deletion)
- [ ] Regular backups (daily, 30-day retention)
- [ ] Disaster recovery plan (RPO 1 hour, RTO 4 hours)

---

## CONCLUSION

This architecture supports 10-20 societies with ~1000 concurrent users, with room to scale to 50+ societies before needing schema-per-tenant approach. The row-level tenancy model is cost-effective, maintainable, and provides excellent isolation when combined with proper JWT validation and SQL filters.

**Next Step:** Approve this architecture, then proceed with Phase 1 setup.
