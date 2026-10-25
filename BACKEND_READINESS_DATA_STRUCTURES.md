# BACKEND READINESS - DATA STRUCTURES & API CONTRACTS

## VISITOR OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Visitor {
  id: string
  name: string
  phone: string
  purpose: string
  vehicle?: { 
    number: string
    color: string 
  }
  people: number
  arrival: string
  departure: string
  loggedAt: string
  loggedBy: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  photo?: string | null  // base64 encoded
}
```

**Required API Endpoints**:
```
POST /api/visitors/log         - Watchman logs new visitor
GET /api/visitors/pending/{residentId}  - Get pending approvals for resident
PUT /api/visitors/{id}/approve - Resident approves visitor
PUT /api/visitors/{id}/reject  - Resident rejects visitor
GET /api/visitors/history/{residentId}  - Get visitor history for resident
GET /api/visitors/stats        - Get aggregated stats for admin (NO PRIVATE DATA)
```

---

## RESIDENT OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Resident {
  id: string
  name: string
  email: string
  phone: string
  unitId: string
  unitNumber: string
  status: 'active' | 'inactive'
  memberSince: string
  role: 'resident'
  
  // Optional - not shown to admin
  savedVisitors: string[]  // array of recurring visitor IDs
  preferences: {
    emailNotifications: boolean
    smsAlerts: boolean
    visitorNotifications: boolean
    paymentReminders: boolean
  }
}
```

**Required API Endpoints**:
```
GET /api/residents/{id}        - Get resident profile
PUT /api/residents/{id}        - Update resident profile
PUT /api/residents/{id}/password - Change password
PUT /api/residents/{id}/preferences - Update notification preferences
GET /api/residents/{residentId}/saved-visitors - Get recurring visitors list
POST /api/residents/{residentId}/saved-visitors - Add recurring visitor
DELETE /api/residents/{residentId}/saved-visitors/{visitorId} - Remove recurring visitor
```

---

## WATCHMAN OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Watchman {
  id: string
  name: string
  phone: string
  email: string
  shift: {
    startTime: string  // "06:00"
    endTime: string    // "14:00"
  }
  status: 'on-duty' | 'off-duty'
  attendance: {
    date: string
    clockIn: string
    clockOut: string
    duration: number  // minutes
  }[]
  photo?: string  // profile photo
  role: 'watchman'
}
```

**Required API Endpoints**:
```
POST /api/watchmen/clock-in    - Clock in for shift
POST /api/watchmen/clock-out   - Clock out from shift
POST /api/watchmen/incident    - Report incident with photo
GET /api/watchmen/{id}/duties  - Get duty history
GET /api/watchmen/on-duty      - Get currently on-duty watchman
```

---

## INCIDENT OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Incident {
  id: string
  watchmanId: string
  category: 'noise' | 'theft' | 'property-damage' | 'lost-found' | 'security' | 'other'
  priority: 'low' | 'medium' | 'high'
  description: string
  location: string
  photos: string[]  // array of base64 encoded images
  reportedAt: string
  status: 'open' | 'investigating' | 'resolved'
  resolution?: string
  resolvedAt?: string
}
```

**Required API Endpoints**:
```
POST /api/incidents            - Create new incident
GET /api/incidents             - Get all incidents (admin only)
GET /api/incidents/open        - Get open incidents
PUT /api/incidents/{id}        - Update incident
PUT /api/incidents/{id}/resolve - Resolve incident
```

---

## ANNOUNCEMENT OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Announcement {
  id: string
  title: string
  content: string
  createdBy: string  // admin ID
  createdAt: string
  targetAudience: 'all' | 'residents' | 'watchmen'
  status: 'published' | 'draft'
  expiresAt?: string
}
```

**Required API Endpoints**:
```
POST /api/announcements        - Create announcement
GET /api/announcements         - Get relevant announcements
PUT /api/announcements/{id}    - Edit announcement
DELETE /api/announcements/{id} - Delete announcement
```

---

## COMPLAINT OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Complaint {
  id: string
  residentId: string
  title: string
  category: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  adminNotes?: string
}
```

**Required API Endpoints**:
```
POST /api/complaints           - Create complaint
GET /api/complaints/{residentId} - Get resident's complaints
PUT /api/complaints/{id}       - Update complaint status
```

---

## BILL OBJECT STRUCTURE

Current frontend representation:
```typescript
interface Bill {
  id: string
  residentId: string
  unitId: string
  amount: number
  currency: 'INR'
  dueDate: string
  paidDate?: string
  status: 'pending' | 'paid' | 'overdue'
  description: string
  month: string  // "March 2024"
}
```

**Required API Endpoints**:
```
GET /api/bills/{residentId}    - Get resident's bills
PUT /api/bills/{id}/pay        - Mark bill as paid
GET /api/bills/outstanding     - Get all overdue bills (admin)
```

---

## ADMIN STATISTICS (PRIVACY PROTECTED)

What admin can see - NO resident names, NO visitor details, NO unit information:

```typescript
interface AggregatedStats {
  totalVisitors: number
  approvedVisitors: number
  rejectedVisitors: number
  pendingVisitors: number
  percentageApproved: number
  percentageRejected: number
  averageDailyVisitors: number
  
  visitorsByPurpose: {
    delivery: number
    guest: number
    service: number
    other: number
  }
  
  visitorsByHour: {
    hour: number
    count: number
  }[]
  
  incidents: {
    total: number
    byCategory: {
      noise: number
      theft: number
      propertyDamage: number
      lostFound: number
      security: number
      other: number
    }
  }
}
```

**Required API Endpoints**:
```
GET /api/admin/stats           - Get aggregated statistics (ZERO private data)
```

---

## AUTHENTICATION FLOW

Frontend currently has NO authentication. Backend needs:

```typescript
interface LoginRequest {
  email: string
  password: string
  role: 'resident' | 'watchman' | 'admin'
}

interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: 'resident' | 'watchman' | 'admin'
  }
  expiresIn: number
}

interface AuthHeaders {
  Authorization: `Bearer ${token}`
}
```

**Required API Endpoints**:
```
POST /api/auth/login           - User login
POST /api/auth/register        - New resident registration
POST /api/auth/refresh         - Refresh token
POST /api/auth/logout          - Logout
POST /api/auth/password-reset  - Request password reset
```

---

## FILE UPLOAD (PHOTOS)

Frontend sends base64 encoded photos. Backend needs to handle:

```
POST /api/uploads/photo        - Upload photo
Response: {
  url: string  // URL to stored photo
  fileId: string
}
```

Photos should be stored in Vercel Blob storage, not database.

---

## REAL-TIME EVENTS (For Future)

Once backend is ready, these events should trigger real-time notifications:

```
EVENTS FROM WATCHMAN → RESIDENT:
- visitor:arrived (new visitor logged, pending approval)

EVENTS FROM RESIDENT → WATCHMAN:
- visitor:approved
- visitor:rejected

EVENTS FROM ADMIN → EVERYONE:
- announcement:published
- emergency:alert

EVENTS FROM WATCHMAN → ADMIN:
- incident:reported (high priority incidents)
```

---

## CURRENT MOCK DATA SOURCES

### Resident Dashboard
- All visitor data stored in React useState
- Mock data in VisitorApprovals.tsx mockVisitors array
- Photos are generated SVG avatars (base64 data URLs)

### Watchman Dashboard
- Visitor log stored in React useState
- Incidents stored in React useState
- Duty log stored in React useState

### Society Admin Dashboard
- Stats calculated from mock data
- No resident privacy data shown (compliant!)

---

## DATABASE SCHEMA OVERVIEW (PostgreSQL/Supabase)

Tables needed:
```
1. users (id, email, password_hash, name, phone, role, created_at)
2. residents (id, user_id, unit_id, status, preferences_json, created_at)
3. watchmen (id, user_id, phone, email, shift_start, shift_end, status)
4. units (id, number, building, resident_id, created_at)
5. visitors (id, name, phone, purpose, vehicle_number, vehicle_color, people_count, photo_url, watchman_id, resident_id, status, created_at, approved_at, rejected_at)
6. incidents (id, watchman_id, category, priority, description, photo_urls, status, created_at, resolved_at)
7. announcements (id, admin_id, title, content, target_audience, published_at, expires_at)
8. complaints (id, resident_id, title, category, priority, status, created_at, resolved_at)
9. bills (id, resident_id, unit_id, amount, due_date, paid_date, status)
10. notifications (id, user_id, type, title, message, read_at, created_at)
11. saved_visitors (id, resident_id, visitor_name, visitor_phone, frequency)
12. blacklist (id, resident_id, visitor_phone, reason, created_at)
```

---

## CRITICAL SECURITY REQUIREMENTS

1. **Authentication**: Every API request must include valid JWT token
2. **Authorization**: 
   - Residents can only see their own visitors/bills/complaints
   - Watchmen can only see their own incidents/duties
   - Admins see only aggregated stats (no private data)
3. **Validation**: All inputs must be validated on backend
4. **Rate Limiting**: Prevent spam/abuse
5. **Photo Storage**: Photos stored in separate file storage, not database
6. **Password Hashing**: Use bcrypt, never store plain text passwords
7. **CORS**: Restrict to your domain only

---

## TESTING READY

Frontend is ready for backend integration when you have:
1. ✓ All API endpoints implemented
2. ✓ Authentication working
3. ✓ Photo upload/storage working
4. ✓ Real-time sync implemented (Supabase Realtime or WebSocket)
5. ✓ Authorization middleware implemented

Then integrate by replacing mock data with API calls.
