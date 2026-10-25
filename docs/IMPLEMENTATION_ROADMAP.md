# Implementation Roadmap - Next Steps

## CURRENT STATE SUMMARY

✅ **What's Done:**
- Authentication system (JWT, no expiry)
- Middleware for route protection
- Dynamic society routing
- 26 API endpoints (stub files exist)
- 3 Dashboard UIs (partially complete)
- Multi-tenant architecture design

❌ **What's Missing:**
- Database tables not created
- API logic not implemented
- Visitor photo upload system
- Payment integration
- Notifications system
- Complete UI dashboards

---

## PHASE 1: DATABASE FOUNDATION (WEEK 1-2)

### Step 1.1: Create Supabase Tables
**Time: 3-4 hours**

Tasks:
1. Write migration SQL for all 10+ tables
2. Set up primary keys and foreign keys
3. Add indexes on frequently queried columns
4. Create enums for status fields

Files to create:
- `migrations/001_create_core_tables.sql`
- `migrations/002_create_indexes.sql`

Table priority order:
1. superadmins → societies
2. society_admins → properties → residents
3. watchmen → visitors
4. bills → complaints

### Step 1.2: Set Up Row-Level Security (RLS)
**Time: 2-3 hours**

Add RLS policies:
```sql
-- Residents can only see their own data
CREATE POLICY resident_isolation ON residents
  USING (id = auth.uid());

-- Residents can only see visitors for their property
CREATE POLICY resident_visitors ON visitors
  USING (
    resident_id = auth.uid() 
    OR property_id IN (SELECT property_id FROM residents WHERE id = auth.uid())
  );

-- Similar for other tables
```

### Step 1.3: Seed Test Data
**Time: 1-2 hours**

Create:
- 3 test societies
- 1 superadmin
- 3 society admins (one per society)
- 10 properties per society
- 20 residents per society
- 3 watchmen per society
- Sample bills and visitors

---

## PHASE 2: API ENDPOINT IMPLEMENTATION (WEEK 2-3)

### Step 2.1: Implement Authentication Endpoints
**Time: 4-5 hours**

Fix these endpoints:
- ✅ POST /api/auth/login - Update to use db
- ✅ POST /api/auth/logout - Implement properly
- Need: Error handling, rate limiting

### Step 2.2: Implement User Management Endpoints
**Time: 5-6 hours**

Implement:
- POST /api/residents - Create with validation
- GET /api/residents - List with society filter
- PUT /api/residents/{id} - Update
- DELETE /api/residents/{id} - Soft delete
- Similar for watchmen, admins, properties

Rules:
- Every query includes society_id filter
- Validate user role before operations
- Add pagination (limit 50, offset)

### Step 2.3: Implement Visitor Management
**Time: 3-4 hours**

Implement:
- POST /api/visitors - Create visitor entry
- GET /api/visitors - List visitors
- PUT /api/visitors/{id} - Approve/reject/checkin/checkout
- DELETE /api/visitors/{id} - (admin only)

### Step 2.4: Implement Billing APIs
**Time: 3-4 hours**

Implement:
- GET /api/bills - List with filters
- POST /api/bills - Create bill (admin only)
- PUT /api/bills/{id} - Update status
- POST /api/bills/pay - Record payment
- GET /api/financial - Generate reports

### Step 2.5: Implement Complaints API
**Time: 2-3 hours**

Implement:
- POST /api/complaints - Create complaint
- GET /api/complaints - List
- PUT /api/complaints/{id} - Update status
- Notification to society admin

---

## PHASE 3: FRONTEND DASHBOARDS (WEEK 3-4)

### Step 3.1: Superadmin Dashboard
**Time: 4-5 hours**

Features:
- ✅ Create society (partially done)
- View all societies
- View society admins
- Edit society settings
- View system statistics
- Create superadmin accounts

### Step 3.2: Society Admin Dashboard
**Time: 6-8 hours**

Features:
- Create properties
- Create residents (send signup link)
- Create watchmen (assign credentials)
- View residents list
- View watchmen list
- View visitor logs
- View complaints
- View billing status
- Generate reports

### Step 3.3: Resident Dashboard
**Time: 4-6 hours**

Features:
- ✅ View property info
- ✅ View apartment details
- Invite visitors (upload photo + details)
- Approve/reject visitor photos
- View guest history
- View bills
- Pay bills
- View complaints/maintenance requests
- Emergency contacts
- Logout

### Step 3.4: Watchman Dashboard
**Time: 3-4 hours**

Features:
- View approved visitors
- Check in visitor
- Check out visitor
- Report suspicious activity
- View blacklist
- Add to blacklist
- Start/end shift
- View duty history
- Logout

---

## PHASE 4: FEATURES & INTEGRATION (WEEK 4-5)

### Step 4.1: Visitor Photo Upload
**Time: 3-4 hours**

Implement:
- Upload photo to Vercel Blob
- Store blob URL in database
- Display photo in approval UI
- Delete photo on checkout

### Step 4.2: Payment Integration
**Time: 4-5 hours**

Integrate with Stripe:
- Create payment intent
- Handle card entry
- Confirm payment
- Store payment record
- Send receipt

### Step 4.3: Notifications
**Time: 3-4 hours**

Add:
- Email notifications (bill due, visitor arrival, etc)
- In-app notifications (toast + notification center)
- SMS notifications (optional)
- Notification preferences per user

### Step 4.4: Reporting & Analytics
**Time: 2-3 hours**

Add:
- Bill payment report
- Visitor frequency report
- Complaint resolution report
- Security incidents report
- Export to CSV

---

## PHASE 5: TESTING & DEPLOYMENT (WEEK 5-6)

### Step 5.1: Unit Tests
**Time: 4-5 hours**

Test:
- Auth token creation/validation
- User role validation
- Society isolation
- API error handling

### Step 5.2: Integration Tests
**Time: 4-5 hours**

Test:
- Complete user flows
- Cross-role interactions
- Data isolation
- Payment flow

### Step 5.3: Security Review
**Time: 2-3 hours**

Review:
- No SQL injection
- No XSS vulnerabilities
- Proper authentication
- Rate limiting
- CORS setup

### Step 5.4: Deployment
**Time: 2 hours**

- Deploy to Vercel
- Set production environment variables
- Set up error tracking (Sentry)
- Monitor performance
- Plan incident response

---

## ESTIMATED TIMELINE

| Phase | Duration | Total |
|-------|----------|-------|
| Phase 1: Database | 6-9 hours | Week 1 |
| Phase 2: APIs | 18-22 hours | Weeks 2-3 |
| Phase 3: Dashboards | 17-23 hours | Weeks 3-4 |
| Phase 4: Features | 12-16 hours | Week 4-5 |
| Phase 5: Testing | 12-15 hours | Week 5-6 |
| **TOTAL** | **65-85 hours** | **~6 weeks** (with 2 devs working 8hrs/day) |

---

## CRITICAL PRIORITY ORDER

If short on time, do in this order:

1. ✅ Phase 1: Database (MUST have)
2. ✅ Phase 2.1: Auth endpoints (MUST have)
3. ✅ Phase 2.2: User management (MUST have)
4. ✅ Phase 3.1: Superadmin dashboard (MVP)
5. ✅ Phase 3.2: Society admin dashboard (MVP)
6. ✅ Phase 3.3: Resident dashboard (MVP)
7. ✅ Phase 3.4: Watchman dashboard (MVP)
8. ⚠️ Phase 2.3: Visitor management (Important)
9. ⚠️ Phase 4.1: Visitor photo upload (Nice to have)
10. ⚠️ Phase 2.4: Billing (Phase 2)
11. ⚠️ Phase 4.2: Payment integration (Phase 2)
12. ⚠️ Phase 4.3: Notifications (Phase 2)

---

## QUICK START COMMANDS

```bash
# Phase 1: Set up database
cd /vercel/share/v0-project
npm run db:migrate

# Phase 2: Seed test data
npm run db:seed

# Phase 3: Start development
npm run dev

# Phase 5: Tests
npm run test

# Deploy
npm run deploy
```

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| DB schema changes needed mid-project | Use migrations, test in staging first |
| Token security issues | Regular security audit, rotate secrets |
| Cross-society data leak | RLS policies + app-level filtering |
| No session revocation | Add revocation logic in Phase 2 |
| Photo storage costs | Set blob retention policy, monitor usage |
| Payment integration complex | Use Stripe test mode, start simple |
| Performance issues at scale | Add caching, optimize queries early |

---

## SUCCESS CRITERIA

✅ MVP is complete when:
- All 3 dashboards load without errors
- Authentication works for all roles
- Society isolation verified (resident A can't see society B)
- Visitor checkin/checkout works
- Bills display and can be paid
- No XSS, SQL injection, or auth bypass vulnerabilities
- <2 second page load time
- Mobile responsive

