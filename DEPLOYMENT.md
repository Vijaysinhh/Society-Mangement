# Production Deployment Guide

## System Requirements

### Server
- Node.js 18+ (recommended: 20 LTS)
- 2GB RAM minimum (4GB+ recommended)
- PostgreSQL 14+
- Redis (optional, for future scaling)

### Services to Setup
- Supabase (or self-hosted PostgreSQL with auth)
- Vercel (or any Node.js hosting)
- Sentry (error tracking)
- Twilio/SendGrid (SMS/Email notifications)

## Pre-Deployment Setup

### 1. Database Setup (Supabase)

Create a Supabase project and enable:
- Authentication with email/password
- Row-Level Security (RLS)
- Database backups
- SSL connection

Run migration scripts to create all tables with RLS policies.

### 2. Environment Variables

Create `.env.production`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=generate-with: openssl rand -base64 32
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Services
SENTRY_DSN=https://key@sentry.io/project
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
SENDGRID_API_KEY=your-api-key

# Feature Flags
NODE_ENV=production
LOG_LEVEL=info
```

### 3. Vercel Deployment

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (add all variables)

# Deploy
vercel deploy --prod
```

### 4. Database Security

Enable Row-Level Security on all tables:

```sql
-- Example for maintenance_bills table
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;

-- Residents see only their society's bills
CREATE POLICY "residents_view_own_society" ON maintenance_bills
  FOR SELECT
  USING (
    society_id IN (
      SELECT society_id FROM residents 
      WHERE auth.uid() = auth_user_id
    )
  );

-- Admins see their society's bills
CREATE POLICY "admins_view_society" ON maintenance_bills
  FOR SELECT
  USING (
    society_id IN (
      SELECT society_id FROM society_admins 
      WHERE auth.uid() = auth_user_id
    )
  );
```

## Performance Optimization

### CDN & Caching
- Enable Vercel Edge Caching
- Set Cache-Control headers for static assets
- Use CloudFlare for DDoS protection

### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_bills_society_resident ON maintenance_bills(society_id, resident_id);
CREATE INDEX idx_bills_society_status ON maintenance_bills(society_id, status);
CREATE INDEX idx_visitors_society_date ON visitor_logs(society_id, check_in_time);
CREATE INDEX idx_complaints_society_created ON complaints(society_id, created_at);
```

### API Response Optimization
- Enable gzip compression (automatic in Vercel)
- Implement pagination for large datasets
- Cache expensive queries in Redis (future)

## Monitoring & Alerting

### Error Tracking (Sentry)

```typescript
// Configure in app
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% sampling
});
```

### Logs
- Forward logs to CloudWatch or Datadog
- Set alerts for:
  - Error rate >5%
  - API response time >1s
  - Database connection errors
  - Authentication failures

### Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Cache hit rate
- Database query performance
- WebSocket connections

## Backup Strategy

### Automated Backups
- Supabase: 7-day point-in-time recovery (included)
- Vercel: Code versioning via Git

### Manual Backups
```bash
# Export database monthly
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-*.sql s3://your-backup-bucket/

# Test restoration periodically
pg_restore backup-20240101.sql > /dev/null
```

## Scaling Considerations

### Horizontal Scaling
When scaling beyond 5-50 societies:

1. **Add Load Balancer**
   - Route traffic across multiple Vercel instances
   - Use sticky sessions for WebSocket

2. **Separate WebSocket Server**
   ```bash
   # Deploy dedicated WebSocket server
   npm run build
   npm run start:websocket
   ```

3. **Add Redis Cache Layer**
   ```typescript
   // Replace in-memory cache
   import Redis from 'ioredis'
   const redis = new Redis(process.env.REDIS_URL)
   ```

4. **Database Read Replicas**
   ```typescript
   // Route read queries to replica
   const readDb = createClient(process.env.SUPABASE_REPLICA_URL)
   ```

### Vertical Scaling
- Increase database: more CPU/memory on PostgreSQL
- Increase server: upgrade Vercel plan
- Increase caching: more Redis memory

## Security Hardening

### HTTPS/TLS
- Vercel provides automatic SSL certificates
- Enforce HTTPS redirect

### Rate Limiting
```typescript
// Implement per-user rate limiting
const rateLimiter = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRequests = rateLimiter.get(userId) || []
  const recentRequests = userRequests.filter(t => now - t < 60000)
  
  if (recentRequests.length >= 100) {
    return false
  }
  
  recentRequests.push(now)
  rateLimiter.set(userId, recentRequests)
  return true
}
```

### Input Validation
- Validate all inputs with Zod
- Sanitize database queries
- Prevent SQL injection (use parameterized queries)

### API Security
- CORS headers configured
- API keys rotated regularly
- JWT tokens signed with strong secret
- No sensitive data in logs

## Disaster Recovery

### Scenario: Database Corruption
1. Restore from latest backup
2. Verify data integrity
3. Run migrations if needed
4. Test before going live

### Scenario: API Compromised
1. Rotate JWT_SECRET immediately
2. Invalidate all active tokens
3. Audit logs for unauthorized access
4. Deploy security patch

### Scenario: Service Outage
1. Check status page
2. Failover to backup region if available
3. Communicate with users
4. Post-mortem analysis

## Maintenance Schedule

### Daily
- Monitor error rates and performance
- Review critical logs

### Weekly
- Security audit of access logs
- Database maintenance checks
- Performance analysis

### Monthly
- Test backup restoration
- Security patch updates
- Performance optimization review

### Quarterly
- Full security audit
- Load testing
- Disaster recovery drill

## Support & Escalation

### Bug Reports
- Report via Sentry or email
- Include: steps to reproduce, environment, logs

### Performance Issues
- Check database performance
- Analyze slow queries
- Review WebSocket connections

### Security Issues
- DO NOT publicly disclose
- Report to: security@yourdomain.com
- Patch within 48 hours if critical

## Success Metrics

Target metrics for production:
- API response time: <500ms (p95)
- Error rate: <0.1%
- Cache hit rate: >80%
- Uptime: >99.9%
- Data integrity: 100% (monthly audit)

## Checklist for Go-Live

- [ ] All environment variables set
- [ ] Database migrated and RLS enabled
- [ ] SSL certificate active
- [ ] Monitoring and alerting configured
- [ ] Error tracking (Sentry) active
- [ ] Backups configured and tested
- [ ] Rate limiting implemented
- [ ] Security headers set
- [ ] Load testing completed
- [ ] Team trained on monitoring
- [ ] Runbook for common issues created
- [ ] Incident response plan in place

**Status: Ready for Production Deployment** ✓
