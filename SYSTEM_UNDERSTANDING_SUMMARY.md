# SYSTEM UNDERSTANDING - Executive Summary

## Current System State vs. Multi-Tenant Target

### CURRENT: Frontend-Only with localStorage
```
User (Society Admin)
    ↓ (browser)
Next.js App
    ↓
React Components (3 dashboards)
    ↓
localStorage
    ↓
EventEmitter (fake real-time)
```

**Problems:**
- Data lost on browser clear
- Single user per browser
- No multi-tenant capability
- No authorization
- No audit trail
- No scalability

---

### TARGET: Secure Multi-Tenant Backend

```
User (Society A Admin)    User (Society B Admin)    SuperAdmin
    ↓                            ↓                         ↓
    └──────────────────────────────────────────────────┬─────
                                                       ↓
                                        API Gateway + Auth Middleware
                                        (verify JWT + society_id)
                                                       ↓
                        ┌──────────────────────────────────────────┐
                        │      Node.js Backend (Stateless)         │
                        │  Load Balanced (multiple instances)       │
                        ├──────────────────────────────────────────┤
                        │  • Visitor Management API                 │
                        │  • Issue Management API                   │
                        │  • Financial Management API               │
                        │  • Watchman Management API                │
                        │  • Authentication API                     │
                        │  • Real-time WebSocket Server             │
                        └──────────────────────────────────────────┘
                                       ↓ (queried via society_id filter)
                        ┌──────────────────────────────────────────┐
                        │    PostgreSQL Database (Row-Level)       │
                        │  Every table has society_id column       │
                        ├──────────────────────────────────────────┤
                        │ societies | visitors | issues | bills |  │
                        │ residents | units | watchmen | payments  │
                        │ announcements | activity_logs | sessions │
                        └──────────────────────────────────────────┘
                                       ↓ (cache frequently accessed)
                        ┌──────────────────────────────────────────┐
                        │      Redis Cache (Session + Data)        │
                        │  Expires: 1-8 hours based on type        │
                        └──────────────────────────────────────────┘
```

---

## Multi-Tenant Isolation Model

```
SOCIETY A                          SOCIETY B
┌─────────────────────┐           ┌─────────────────────┐
│ Admin: Raj          │           │ Admin: Priya        │
│ Residents: 80       │           │ Residents: 95       │
│ Units: 80           │           │ Units: 95           │
│ Watchmen: 8         │           │ Watchmen: 10        │
└─────────────────────┘           └─────────────────────┘
         ↓                                  ↓
    JWT Token:                         JWT Token:
    {userId, societyId: A,         {userId, societyId: B,
     accountType: admin}             accountType: admin}
         ↓                                  ↓
    Query: SELECT * FROM visitors    Query: SELECT * FROM visitors
    WHERE society_id = A             WHERE society_id = B
         ↓                                  ↓
    Returns 250 visitors for A       Returns 280 visitors for B
         ↓                                  ↓
    A's admin sees only A data       B's admin sees only B data
    ✓ Isolation enforced             ✓ Isolation enforced
```

**How Isolation Works:**

1. **JWT Verification:** Every request must have valid JWT with societyId
2. **Middleware Check:** Verify requested societyId == JWT societyId
3. **SQL Filtering:** All queries include `WHERE society_id = $1`
4. **No Cross-Tenant Joins:** Reports generated only within one society

---

## Data Model: Before vs. After

### BEFORE (Current - localStorage)
```javascript
// All data is mixed in browser memory
{
  visitors: [visitor1, visitor2, ...],  // No society_id
  issues: [issue1, issue2, ...],        // Unscoped
  residents: [res1, res2, ...],         // Unknown which society
  
  // NO ISOLATION
  // If two browsers open same app, data overwrites
  // No way to have Society A + Society B data together
}
```

### AFTER (Proposed - PostgreSQL)
```javascript
// VISITORS TABLE
┌─────────────────────────────────────────┐
│ id | society_id | name | status | ...   │
├─────────────────────────────────────────┤
│ v1 | society-A  | John | approved │     │ ← Society A data
│ v2 | society-A  | Jane | pending  │     │ ← Society A data
│ v3 | society-B  | Amit | approved │     │ ← Society B data
│ v4 | society-B  | Priya| denied   │     │ ← Society B data
└─────────────────────────────────────────┘

// Query for Society A admin:
SELECT * FROM visitors WHERE society_id = 'society-A'
// Returns: v1, v2 (not v3, v4)

// Same table, complete isolation ✓
```

---

## Performance Metrics at Scale

### Target Load: 1000 People across 10-20 Societies

```
DATABASE OPERATIONS PER MINUTE:
├── Visitor Operations: 10-20 logs/min
├── Issue Updates: 10-15 updates/min
├── Bill Queries: 5-10 queries/min
├── Payment Processing: 2-5 per min
└── Announcements: 1-3 per min
Total: ~40-50 database operations/min (average)

PEAK LOAD (Evening collection time):
├── Payment Submissions: 30-50 per minute
├── Dashboard Refreshes: 50-100 queries
├── Real-time Updates: 100+ WebSocket messages
Total: ~200-300 database operations/min (peak)

CACHING REDUCES DATABASE LOAD BY 70%:
├── Cached queries: Session data, unit lists, resident lists
├── Cache hit rate: 80%+ for dashboard loads
├── Real database queries: ~60 per minute (peak)
```

### Response Time Targets

```
API Endpoint Response Times (p95):
├── Authentication (login): 200ms
├── Visitor logging: 300ms
├── Dashboard overview: 400ms
├── Issue submission: 350ms
├── Bill payment: 450ms
└── Real-time WebSocket delivery: <100ms

Database Query Times (p95):
├── Simple queries (by society_id): 20-50ms
├── Aggregated reports: 100-200ms
├── Complex joins: 200-300ms
```

---

## Key Architectural Decisions

### 1. Row-Level Tenancy (vs. Schema or Database)
```
✓ CHOSE: Row-Level (all tenants in same table)
  ├── Cost: 1 database server
  ├── Complexity: Moderate (filter on society_id)
  ├── Scalability: Up to 50+ societies
  ├── Maintenance: Simple backups & updates

✗ Alternative: Schema-per-tenant
  ├── Cost: 1 schema per tenant (OK at 50+ societies)
  ├── Complexity: High (schema management)
  ├── Scalability: Up to 100+ societies
  
✗ Alternative: Database-per-tenant
  ├── Cost: 1 database per tenant (very expensive)
  ├── Complexity: Very high (database replication)
  ├── Scalability: Unlimited (overkill for 10-20)
```

### 2. JWT Authentication (vs. Session-based)
```
✓ CHOSE: JWT
  ├── Stateless: No server-side session storage
  ├── Scalable: Works with load balancing
  ├── Secure: society_id in token (cannot fake)
  ├── Real-time: Compatible with WebSocket
  
✗ Alternative: Session-based
  ├── Requires: Central session store (Redis)
  ├── Complex: Session sync across servers
  ├── Slower: Extra session lookup on each request
```

### 3. PostgreSQL Row-Level Security (Optional Enhancement)
```
At scale (50+ societies), can use PostgreSQL RLS:

CREATE POLICY society_isolation ON visitors
  USING (society_id = current_setting('app.current_society_id'));

Benefits:
├── Database-level enforcement
├── Cannot bypass isolation even with SQL injection
├── Audit trail of all data access

For now (10-20 societies): Application-level filtering is sufficient
```

---

## Migration Strategy: Current → Backend

### Phase Breakdown

```
PHASE 1: Setup (Week 1-2)
├── PostgreSQL database creation
├── Schema migration
├── Redis cache setup
└── API project scaffolding

PHASE 2: Core APIs (Week 3-4)
├── Authentication endpoints
├── Visitor API
├── Issue API
├── Bill & Payment API
└── Middleware & rate limiting

PHASE 3: Data Migration (Week 5)
├── localStorage → database script
├── Data validation
├── Backup & rollback plan
└── Execute migration

PHASE 4: Frontend Updates (Week 6)
├── Replace localStorage with API calls
├── Update state management
├── Error handling
└── Comprehensive testing

PHASE 5: Real-Time (Week 7)
├── WebSocket server setup
├── Event broadcasting
├── Real-time notification delivery
└── Testing & optimization

PHASE 6: Launch (Week 8)
├── Load testing (200 concurrent users)
├── Security audit
├── Monitoring setup
├── Production deployment
```

---

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data migration failure | Complete data loss | Backup current data, dry-run test, rollback plan |
| Performance degradation | Users experience slow app | Load testing, caching strategy, database tuning |
| Cross-tenant data leak | Security breach | JWT validation middleware, SQL filters, audit logging |
| Database connection pool exhaustion | App crash | Monitor connection count, set aggressive timeouts |
| Cache invalidation issues | Stale data served | Event-driven cache invalidation, short TTL |
| Concurrent payment processing | Double billing | Database transactions, optimistic locking |
| Real-time message loss | Missing notifications | Message queuing (RabbitMQ/Redis Streams), retry logic |

---

## Success Criteria

Once backend is deployed:

- ✓ Data persists across browser sessions
- ✓ Multiple societies can coexist in same database
- ✓ Each user sees only their society's data
- ✓ System supports 100-200 concurrent users
- ✓ Dashboard loads in <500ms
- ✓ Real-time notifications deliver in <1 second
- ✓ Audit trail tracks all user actions
- ✓ Automated backups run daily
- ✓ System survives single-server failure (redundancy)
- ✓ Load can scale horizontally (add more servers)

---

## Questions Answered Before Implementation

**Q: Why not use Firebase?**
A: Firebase doesn't support row-level tenancy well. Would need schema-per-tenant (expensive). PostgreSQL gives us better control and cost.

**Q: Why JWT over cookies?**
A: JWT works with both web and mobile. Stateless scaling. Can include society_id as claim (prevents tampering).

**Q: Can I use MongoDB instead?**
A: Possible, but PostgreSQL is better for this:
  - Strong ACID transactions (financial operations)
  - Better aggregation queries (reporting)
  - Native JSON support (JSONB)
  - Excellent row-level filtering

**Q: When should we move to Schema-per-Tenant?**
A: When you reach 30+ societies. For now, row-level is optimal.

**Q: How do we handle backups?**
A: Daily automated backups to S3, point-in-time recovery enabled, 30-day retention.

**Q: Multi-region deployment needed?**
A: Not for MVP. Single region is sufficient for 10-20 societies. Add later if expanding globally.

