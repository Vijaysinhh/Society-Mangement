# Production Architecture - Enterprise Multi-Tenant Real-Time System

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)
3. [Real-Time Communication](#real-time-communication)
4. [Caching Strategy](#caching-strategy)
5. [API Design Patterns](#api-design-patterns)
6. [Security Architecture](#security-architecture)
7. [Database Design](#database-design)
8. [Deployment & Scaling](#deployment--scaling)

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Resident   │  │    Admin     │  │  Watchman    │               │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                       │
│         └─────────────────┼──────────────────┘                       │
│                           │                                          │
├───────────────────────────┼──────────────────────────────────────────┤
│                    Next.js Server Layer                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Real-Time Manager (WebSocket + Server-Sent Events)         │   │
│  │  - Critical alerts (emergency) → WebSocket                  │   │
│  │  - Updates (bills, visitors) → Polling                      │   │
│  │  - Multi-society broadcast handling                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Routes (RESTful)                                        │   │
│  │  ├─ /api/properties                (GET, POST)              │   │
│  │  ├─ /api/bills                     (GET, POST, PATCH)       │   │
│  │  ├─ /api/complaints                (GET, POST, PATCH)       │   │
│  │  ├─ /api/visitors                  (GET, POST, PATCH)       │   │
│  │  ├─ /api/amenities                 (GET, POST)              │   │
│  │  ├─ /api/parcels                   (GET, POST, PATCH)       │   │
│  │  ├─ /api/watchmen                  (GET, POST, PATCH)       │   │
│  │  ├─ /api/messages                  (GET, POST)              │   │
│  │  └─ /api/auth                      (POST)                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                            │   │
│  │  ├─ Authentication (JWT verification)                       │   │
│  │  ├─ Authorization (society_id validation)                   │   │
│  │  ├─ Rate Limiting (per-user, per-society)                   │   │
│  │  ├─ Request Validation (Zod schemas)                        │   │
│  │  └─ Error Handling & Logging                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  In-Memory Cache Layer                                       │   │
│  │  ├─ society:{id} → Society data (1 min TTL)                │   │
│  │  ├─ properties:{society_id} → Properties list               │   │
│  │  ├─ bills:{society_id} → Bills cache                        │   │
│  │  ├─ amenities:{society_id} → Amenities list                 │   │
│  │  └─ blacklist:{society_id} → Blacklist data                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
├───────────────────────────────────────────────────────────────────┤
│                     Database Layer (Supabase)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database with Row-Level Security (RLS)          │  │
│  │  ├─ Public Schema:                                          │  │
│  │  │  ├─ societies                 (shared reference)          │  │
│  │  │  ├─ residents                 (with society_id)           │  │
│  │  │  ├─ properties                (with society_id)           │  │
│  │  │  ├─ maintenance_bills          (with society_id)          │  │
│  │  │  ├─ bill_payments              (with society_id)          │  │
│  │  │  ├─ complaints                 (with society_id)          │  │
│  │  │  ├─ visitor_logs               (with society_id)          │  │
│  │  │  ├─ amenities                  (with society_id)          │  │
│  │  │  ├─ amenity_bookings           (with society_id)          │  │
│  │  │  ├─ parcels                    (with society_id)          │  │
│  │  │  ├─ duty_schedules             (with society_id)          │  │
│  │  │  ├─ emergency_alerts           (with society_id)          │  │
│  │  │  ├─ messages                   (with society_id)          │  │
│  │  │  └─ financial_data             (with society_id)          │  │
│  │  └─ RLS Policies on all tables ensure:                      │  │
│  │     - Residents see only their society data                  │  │
│  │     - Admins see all data in their society                   │  │
│  │     - Watchmen see all visitors in their society             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└───────────────────────────────────────────────────────────────────┤

External Services:
├─ Payment Gateway (Stripe/Razorpay)
├─ SMS/Email Service (Twilio/SendGrid)
├─ File Storage (Vercel Blob for attachments)
└─ Monitoring (Sentry for error tracking)
```

---

## Multi-Tenant Data Isolation

### 1. Database-Level Isolation (RLS - Row-Level Security)

Every table has a `society_id` column that determines ownership:

```sql
-- Example: Maintenance Bills Table
CREATE TABLE maintenance_bills (
  id UUID PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES societies(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  amount DECIMAL(10, 2),
  status VARCHAR(20),
  created_at TIMESTAMP
);

-- RLS Policy: Residents see only their society's bills
CREATE POLICY "residents_view_own_society_bills" ON maintenance_bills
  FOR SELECT
  USING (
    society_id IN (
      SELECT society_id FROM residents WHERE auth.uid() = residents.auth_user_id
    )
  );

-- RLS Policy: Admins see only their society's bills
CREATE POLICY "admins_view_society_bills" ON maintenance_bills
  FOR SELECT
  USING (
    society_id IN (
      SELECT society_id FROM society_admins WHERE auth.uid() = society_admins.auth_user_id
    )
  );
```

### 2. Application-Level Isolation (Defense in Depth)

Every API route validates `society_id`:

```typescript
// /api/bills/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const societyId = searchParams.get('society_id')
  const user = await getAuthUser(request) // From JWT

  // Validation 1: User must belong to this society
  const userSociety = await db.query(
    'SELECT society_id FROM residents WHERE id = $1',
    [user.id]
  )

  if (userSociety.society_id !== societyId) {
    return Response.json(
      { error: 'Unauthorized access to society' },
      { status: 403 }
    )
  }

  // Validation 2: Fetch only this society's bills
  const bills = await db.query(
    'SELECT * FROM maintenance_bills WHERE society_id = $1 AND resident_id = $2',
    [societyId, user.id]
  )

  return Response.json(bills)
}
```

### 3. Practical Multi-Tenant Example

```typescript
// How data flows for 3 different societies

// Society A: Bhavna Apartments
// ├─ Admin: admin@bhavna.com
// ├─ Residents: resident1, resident2, resident3
// └─ Properties: Unit 101, 102, 103

// Society B: Maple Gardens
// ├─ Admin: admin@maple.com
// ├─ Residents: resident4, resident5
// └─ Properties: Unit 201, 202

// Society C: Pearl Plaza
// ├─ Admin: admin@pearl.com
// ├─ Residents: resident6, resident7, resident8
// └─ Properties: Unit 301, 302, 303

// When resident1 logs in and requests bills:
GET /api/bills?society_id=bhavna-apartments-id

// Backend verification:
// 1. JWT decoded → user.id = resident1_id
// 2. Query: SELECT society_id FROM residents WHERE id = resident1_id
//    → Returns: bhavna-apartments-id
// 3. Check: requested society_id === resident's society_id ✓
// 4. Query: SELECT * FROM maintenance_bills 
//    WHERE society_id = bhavna-apartments-id AND resident_id = resident1_id
// 5. Return: Only resident1's bills from Bhavna Apartments

// Database RLS also enforces:
// - resident1 cannot see bills from Maple Gardens (society_id mismatch)
// - resident1 cannot see other residents' bills (resident_id mismatch)
// - Even if API has bug, database prevents data leak
```

---

## Real-Time Communication

### 1. Critical Updates → WebSocket (Instant)

Emergency alerts, critical notifications that need immediate delivery:

```typescript
// /api/websocket/route.ts
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3001 })
const societyConnections = new Map() // society_id → Set of WebSocket connections

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  const societyId = extractSocietyFromAuth(request.headers)
  
  if (!societyConnections.has(societyId)) {
    societyConnections.set(societyId, new Set())
  }
  societyConnections.get(societyId).add(ws)

  ws.on('close', () => {
    societyConnections.get(societyId).delete(ws)
  })
})

// Broadcast critical alert to entire society
export function broadcastEmergencyAlert(societyId: string, alert: EmergencyAlert) {
  const connections = societyConnections.get(societyId) || new Set()
  const message = JSON.stringify({
    type: 'EMERGENCY_ALERT',
    severity: alert.severity,
    description: alert.description,
    timestamp: new Date().toISOString()
  })

  connections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message)
    }
  })
}

// Watchman triggers emergency
export async function POST(request: Request) {
  const alert = await request.json()
  await db.table('emergency_alerts').insert(alert)

  // Broadcast instantly via WebSocket
  broadcastEmergencyAlert(alert.society_id, alert)

  return Response.json({ success: true })
}
```

### 2. Non-Critical Updates → Polling (Every 5-30 seconds)

Bills, complaints, visitor approvals - don't need instant delivery:

```typescript
// Frontend hook for polling
export function useBillsPolling(societyId: string, interval = 15000) {
  const [bills, setBills] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const pollBills = async () => {
      const response = await fetch(
        `/api/bills?society_id=${societyId}&since=${lastUpdate}`
      )
      const newBills = await response.json()

      if (newBills.length > 0) {
        setBills(prev => [...prev, ...newBills])
        setLastUpdate(new Date().toISOString())
      }
    }

    const timer = setInterval(pollBills, interval)
    return () => clearInterval(timer)
  }, [societyId])

  return bills
}

// Usage in component
export function BillsPage() {
  const bills = useBillsPolling(societyId, 20000) // Poll every 20 seconds
  
  return (
    <div>
      {bills.map(bill => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </div>
  )
}
```

### 3. Real-Time Synchronization Pattern

```typescript
// Step-by-step: Bill payment → Instant sync across all connected users

// 1. Resident pays bill on their dashboard
POST /api/bills/pay
{
  "bill_id": "bill-123",
  "amount": 5000,
  "payment_method": "upi"
}

// 2. Backend processes payment
// ├─ Verify: resident owns this bill
// ├─ Create: bill_payment record (status: pending)
// ├─ Emit: Payment event to WebSocket (for critical monitoring)
// └─ Database auto-updated

// 3. Admin confirms payment on admin dashboard
PATCH /api/bills/confirm
{
  "bill_payment_id": "payment-123",
  "confirmed": true
}

// 4. Backend updates
// ├─ Update: bill_payment (status: confirmed)
// ├─ Update: maintenance_bill (status: paid)
// ├─ Clear: Cache for this society's bills
// ├─ Emit: "BILL_PAID" event via WebSocket
// └─ Emit: Polling endpoint gets fresh data

// 5. All connected clients get update
// ├─ WebSocket: Admin dashboard shows "Payment Confirmed ✓"
// ├─ Polling: Resident sees "Paid" status on next poll (max 30 sec delay)
// ├─ Cache: Next API call gets fresh data
// └─ Other admins: See updated bill status

// Result: Multi-society system stays perfectly synchronized
```

---

## Caching Strategy

### 1. In-Memory Cache with TTL

```typescript
// /lib/cache.ts
class CacheManager {
  private cache = new Map()
  
  set(key: string, value: any, ttlSeconds = 60) {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  invalidate(pattern: string) {
    // Invalidate all keys matching pattern
    // e.g., invalidate('bills:*') clears all bill caches
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheManager = new CacheManager()
```

### 2. Cache Key Strategy

```typescript
// Cache keys organized by entity and society
const CACHE_KEYS = {
  SOCIETY: (id: string) => `society:${id}`, // 5 min TTL
  PROPERTIES: (societyId: string) => `properties:${societyId}`, // 10 min
  BILLS: (societyId: string) => `bills:${societyId}`, // 5 min
  AMENITIES: (societyId: string) => `amenities:${societyId}`, // 30 min (stable)
  BLACKLIST: (societyId: string) => `blacklist:${societyId}`, // 10 min
  DUTY_SCHEDULE: (societyId: string) => `schedule:${societyId}`, // 1 day
}

// Usage in API
export async function getAmenities(societyId: string) {
  const cacheKey = CACHE_KEYS.AMENITIES(societyId)
  
  // Check cache first
  const cached = cacheManager.get(cacheKey)
  if (cached) return cached

  // Cache miss → Query database
  const amenities = await db.query(
    'SELECT * FROM amenities WHERE society_id = $1',
    [societyId]
  )

  // Store in cache for 30 minutes
  cacheManager.set(cacheKey, amenities, 1800)
  return amenities
}
```

### 3. Cache Invalidation on Write

```typescript
// When data changes, invalidate related caches
export async function confirmBillPayment(billPaymentId: string) {
  // Update database
  await db.query(
    'UPDATE bill_payments SET status = $1 WHERE id = $2',
    ['confirmed', billPaymentId]
  )

  // Get affected society
  const societyId = await db.query(
    'SELECT society_id FROM maintenance_bills mb 
     JOIN bill_payments bp ON mb.id = bp.bill_id 
     WHERE bp.id = $1',
    [billPaymentId]
  )

  // Invalidate all related caches
  cacheManager.invalidate(`bills:${societyId}`)
  cacheManager.invalidate(`financial_data:${societyId}`)

  // Next request will fetch fresh data
}
```

---

## API Design Patterns

### 1. Consistent Error Handling

```typescript
// /lib/apiErrors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message)
  }
}

export function handleApiError(error: any) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.errorCode,
          message: error.message
        }
      },
      { status: error.statusCode }
    )
  }

  // Log unknown errors
  console.error('[API_ERROR]', error)
  
  return Response.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  )
}
```

### 2. Request Validation with Zod

```typescript
// /lib/schemas.ts
import { z } from 'zod'

export const createBillSchema = z.object({
  society_id: z.string().uuid(),
  resident_id: z.string().uuid(),
  amount: z.number().positive(),
  bill_type: z.enum(['monthly', 'quarterly', 'annual']),
  due_date: z.string().datetime()
})

export const confirmPaymentSchema = z.object({
  bill_payment_id: z.string().uuid(),
  confirmed: z.boolean()
})

// Usage in API
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate against schema
    const validated = createBillSchema.parse(body)
    
    // Process validated data
    const bill = await createBill(validated)
    
    return Response.json({ success: true, data: bill })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', details: error.errors }
        },
        { status: 400 }
      )
    }
    
    return handleApiError(error)
  }
}
```

### 3. Pagination for Large Datasets

```typescript
// API endpoint with pagination
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const societyId = searchParams.get('society_id')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const offset = (page - 1) * limit

  // Get total count
  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM complaints WHERE society_id = $1',
    [societyId]
  )
  const total = countResult[0].total

  // Get paginated data
  const complaints = await db.query(
    'SELECT * FROM complaints WHERE society_id = $1 LIMIT $2 OFFSET $3',
    [societyId, limit, offset]
  )

  return Response.json({
    success: true,
    data: complaints,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}
```

---

## Security Architecture

### 1. Authentication (JWT)

```typescript
// /lib/auth.ts
import jwt from 'jsonwebtoken'

export function createToken(userId: string, societyId: string, role: string) {
  return jwt.sign(
    {
      sub: userId,
      societyId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    },
    process.env.JWT_SECRET!
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Authentication token is invalid')
  }
}

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'NO_AUTH', 'Missing authentication token')
  }

  const token = authHeader.slice(7)
  return verifyToken(token)
}
```

### 2. Authorization Middleware

```typescript
// /middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.slice(7)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const decoded = verifyToken(token)
    
    // Add user info to request for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.sub)
    requestHeaders.set('x-society-id', decoded.societyId)
    requestHeaders.set('x-user-role', decoded.role)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ['/api/:path*']
}
```

### 3. Role-Based Access Control (RBAC)

```typescript
// /lib/rbac.ts
const PERMISSIONS = {
  RESIDENT: {
    'bills:view': true,
    'bills:pay': true,
    'complaints:create': true,
    'complaints:view_own': true,
    'visitors:request': true,
    'visitors:approve': true,
    'amenities:book': true,
    'messages:send': true
  },
  ADMIN: {
    'residents:manage': true,
    'bills:create': true,
    'bills:confirm': true,
    'complaints:respond': true,
    'amenities:create': true,
    'amenities:approve_bookings': true,
    'watchmen:manage': true,
    'reports:view': true
  },
  WATCHMAN: {
    'visitors:log': true,
    'parcels:log': true,
    'emergency:trigger': true,
    'duty:checkin_out': true
  }
}

export function checkPermission(userRole: string, permission: string): boolean {
  return PERMISSIONS[userRole]?.[permission] || false
}

// Usage in API
export async function POST(request: Request) {
  const userRole = request.headers.get('x-user-role')
  
  if (!checkPermission(userRole, 'bills:create')) {
    throw new ApiError(403, 'FORBIDDEN', 'You lack permission to create bills')
  }

  // Continue with operation
}
```

---

## Database Design

### 1. Multi-Tenant Table Structure

```sql
-- Base table with society_id
CREATE TABLE maintenance_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id),
  resident_id UUID NOT NULL REFERENCES residents(id),
  amount DECIMAL(10, 2) NOT NULL,
  bill_type VARCHAR(20) NOT NULL CHECK (bill_type IN ('monthly', 'quarterly', 'annual')),
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Indexes for common queries
  FOREIGN KEY (society_id) REFERENCES societies(id),
  INDEX idx_society_id (society_id),
  INDEX idx_resident_id (resident_id),
  INDEX idx_status (status)
);

-- Row-Level Security policy
CREATE POLICY "society_isolation" ON maintenance_bills
  USING (
    society_id IN (
      SELECT id FROM societies 
      WHERE id = current_setting('app.current_society_id')::uuid
    )
  );
```

### 2. Efficient Querying with Indexes

```sql
-- Bills by society and resident (common query)
CREATE INDEX idx_bills_society_resident 
  ON maintenance_bills(society_id, resident_id);

-- Blacklist lookups (fast visitor checks)
CREATE INDEX idx_blacklist_society_visitor 
  ON visitor_blacklist(society_id, visitor_name);

-- Messages by conversation
CREATE INDEX idx_messages_conversation 
  ON messages(conversation_id, created_at);

-- Duty logs for reports
CREATE INDEX idx_duty_logs_society_date 
  ON duty_logs(society_id, duty_date);
```

---

## Deployment & Scaling

### 1. Environment Configuration

```env
# .env.production
DATABASE_URL=postgresql://...  # Supabase connection
JWT_SECRET=your-secret-key-here
WEBSOCKET_URL=wss://your-domain.com
REDIS_URL=redis://... # Optional for future scale

# API Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Monitoring
SENTRY_DSN=https://...
```

### 2. Scaling Path (As System Grows)

```
Phase 1 (Current): 5-50 societies
├─ Single Next.js instance
├─ In-memory caching
├─ WebSocket on same server
└─ Supabase handles database

Phase 2 (500+ residents):
├─ Add Redis cache layer
├─ Separate WebSocket server
├─ Database read replicas
└─ CDN for static assets

Phase 3 (50+ societies):
├─ Load balanced Next.js instances
├─ Dedicated WebSocket cluster
├─ PostgreSQL connection pooling
├─ Queue system for async jobs
└─ Message bus for cross-instance events

Phase 4 (Enterprise):
├─ Microservices architecture
├─ Dedicated services per feature
├─ Event-driven architecture
├─ Distributed caching
└─ Multi-region deployment
```

### 3. Monitoring & Alerting

```typescript
// /lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

export function initializeMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0
  })
}

export function captureException(error: Error, context?: any) {
  Sentry.captureException(error, { contexts: { app: context } })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error') {
  Sentry.captureMessage(message, level)
}

// Usage in critical operations
try {
  await processBillPayment(payment)
} catch (error) {
  captureException(error, {
    operation: 'bill_payment',
    societyId,
    residentId
  })
  throw error
}
```

---

## Best Practices Summary

1. **Always validate society_id** in both database RLS and application layer
2. **Use WebSocket only for critical alerts** (emergency) to reduce complexity
3. **Implement polling with smart intervals** (5-30 seconds) for regular updates
4. **Cache aggressively but invalidate precisely** when data changes
5. **Validate all input** with Zod schemas before processing
6. **Log all critical operations** for audit trails
7. **Use indexes on multi-tenant queries** (society_id, created_at)
8. **Plan for horizontal scaling** from day one with proper architecture
9. **Monitor error rates and performance** continuously
10. **Test multi-tenant isolation thoroughly** before deployment

This architecture supports:
- ✅ 5-50 societies concurrently
- ✅ 500-5000 residents actively using system
- ✅ Real-time updates for critical events
- ✅ Reasonable delays (5-30 sec) for non-critical updates
- ✅ Complete data isolation between societies
- ✅ Easy horizontal scaling when needed
