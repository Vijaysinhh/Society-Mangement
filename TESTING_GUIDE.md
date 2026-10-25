# Testing & Deployment Guide

## Pre-Deployment Testing Checklist

### 1. Authentication Flow
- [ ] Resident login works
- [ ] Admin login works
- [ ] Watchman login works
- [ ] JWT token persists across page reload
- [ ] Token expiry handled correctly
- [ ] Logout clears session

### 2. Multi-Tenant Isolation
- [ ] Resident from Society A cannot see Society B data
- [ ] RLS policies block cross-tenant queries in database
- [ ] API validates society_id on all requests
- [ ] Bill data is isolated by society
- [ ] Complaint data is isolated by society
- [ ] Visitor logs are isolated by society

### 3. Bill Payment Flow (Critical)
- [ ] Resident can submit bill payment
- [ ] Payment shows as "pending" until confirmed
- [ ] Admin receives notification of pending payment
- [ ] Admin can confirm payment
- [ ] Bill status updates to "paid" after confirmation
- [ ] Cache invalidates and resident sees update within 30 seconds
- [ ] Both resident and admin see correct status

### 4. Visitor Approval Flow
- [ ] Watchman can log visitor at gate
- [ ] Resident receives notification
- [ ] Resident can approve/reject visitor
- [ ] Rejected visitor can be blacklisted
- [ ] Watchman can check blacklist before allowing entry
- [ ] Blacklist prevents visitor from entering

### 5. Real-Time Updates
- [ ] Emergency alerts broadcast to all residents instantly (WebSocket)
- [ ] Regular updates poll correctly (every 20 seconds)
- [ ] Cache refreshes on data updates
- [ ] No data leakage between societies

### 6. API Error Handling
- [ ] 401 error for missing token
- [ ] 403 error for unauthorized access
- [ ] 404 error for missing resources
- [ ] 400 error for invalid input
- [ ] 500 error with proper logging for server errors
- [ ] Meaningful error messages returned to client

### 7. Caching
- [ ] Fresh data cached after fetching
- [ ] Cache invalidated on writes
- [ ] Cached bills data updates after payment
- [ ] Cached amenities data updates after creation
- [ ] In-memory cache works across multiple requests

### 8. Offline Mode
- [ ] Service worker registers on app load
- [ ] Offline data loads from IndexedDB
- [ ] App shows "offline" indicator when disconnected
- [ ] Data syncs when back online
- [ ] Offline actions queue for retry

## Security Testing

### Data Isolation
```bash
# Test: Resident from one society cannot access another's bills
curl -H "Authorization: Bearer {resident-token-society-a}" \
  http://localhost:3000/api/bills?society_id=society-b-id
# Expected: 403 Forbidden or data filtered to empty
```

### SQL Injection Prevention
```bash
# Test: Validate input doesn't allow SQL injection
curl -X POST http://localhost:3000/api/bills \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"amount": "1; DROP TABLE bills;--"}'
# Expected: 400 Validation Error
```

### Role-Based Access Control
```bash
# Test: Resident cannot create bills
curl -X POST http://localhost:3000/api/bills \
  -H "Authorization: Bearer {resident-token}" \
  -H "Content-Type: application/json" \
  -d {...}
# Expected: 403 Forbidden
```

## Performance Testing

### Load Testing
- Simulate 5-50 concurrent societies
- 500-5000 residents using system simultaneously
- Measure response times for:
  - GET /api/bills (should be <500ms with cache)
  - POST /api/bills/pay (should be <1s)
  - GET /api/visitors (should be <500ms)

### Cache Hit Rate
- Verify cache hits for read operations
- Monitor cache invalidation patterns
- Ensure TTL matches data freshness requirements

## Database Testing

### RLS Policies
```sql
-- Test that RLS prevents unauthorized access
SELECT * FROM maintenance_bills WHERE society_id != current_user_society_id;
-- Expected: 0 rows returned
```

### Indexes
- Verify indexes on society_id columns
- Check query performance for multi-tenant queries
- Monitor slow queries

## Frontend Testing

### Browser Compatibility
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Real-Time Features
- [ ] WebSocket connects and receives emergency alerts
- [ ] Polling updates appear within 20-30 seconds
- [ ] Graceful fallback if WebSocket fails

## Deployment Steps

### 1. Environment Setup
```bash
# Copy .env template
cp .env.example .env.production

# Update with production values:
DATABASE_URL=postgresql://prod-user:pass@prod-host/prod-db
JWT_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Migration
```bash
# Run migrations on production database
npx supabase migration up

# Verify RLS policies are enabled
SELECT schemaname, tablename FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Build & Deploy
```bash
# Build Next.js app
npm run build

# Verify build succeeds
npm run start

# Deploy to Vercel
vercel deploy --prod
```

### 4. Health Checks
```bash
# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","role":"admin"}'

# Test multi-tenant isolation
curl https://your-domain.com/api/bills?society_id=society-1 \
  -H "Authorization: Bearer {token-from-society-2}"
# Should return 403 or empty data

# Test real-time updates
wscat -c wss://your-domain.com/api/websocket?token={token}
```

### 5. Monitoring Setup
- [ ] Sentry for error tracking
- [ ] CloudWatch or similar for logs
- [ ] Datadog/NewRelic for performance monitoring
- [ ] Alert for >5% error rate
- [ ] Alert for response time >1s

### 6. Backup Strategy
- [ ] Daily database backups to S3
- [ ] Test backup restoration monthly
- [ ] Keep 30 days of backups
- [ ] Enable point-in-time recovery

## Post-Deployment Verification

### Day 1
- [ ] Monitor error logs for any issues
- [ ] Verify real-time features working
- [ ] Test critical flows with actual data
- [ ] Check database query performance

### Week 1
- [ ] Monitor cache hit rates
- [ ] Check for any data isolation issues
- [ ] Gather user feedback
- [ ] Performance under actual load

### Ongoing
- [ ] Daily error monitoring
- [ ] Weekly performance review
- [ ] Monthly security audit
- [ ] Quarterly backup restoration test

## Rollback Procedure

If critical issues discovered:

```bash
# Revert to previous version
vercel rollback

# Or manually deploy previous version
git checkout previous-commit-hash
npm run build
vercel deploy --prod
```

Always have a previous working version ready to deploy!
