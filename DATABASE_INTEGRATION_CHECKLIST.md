# Database Integration Checklist

## Phase 1: Supabase Setup (COMPLETE ✓)

- [x] Install @supabase/supabase-js and @supabase/ssr
- [x] Create server client (`utils/supabase/server.ts`)
- [x] Create browser client (`utils/supabase/client.ts`)
- [x] Create middleware (`utils/supabase/middleware.ts`)
- [x] Add Dev credentials to `.env.local`
- [x] Create database schema migration file
- [x] Documentation complete
- [x] Build verification passed

## Phase 2: Run Migrations (YOU - DO THIS FIRST)

### Dev Database
- [ ] Open https://app.supabase.com
- [ ] Select Dev Project (oxrykmbmsrjotmjljwjw)
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy content from `migrations/001_create_base_schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Verify: All tables created successfully
- [ ] Check tables in Table Editor (left sidebar)

### Prod Database
- [ ] Open https://app.supabase.com
- [ ] Select Prod Project (yktwhrjqqhlpmwrnmzly)
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy content from `migrations/001_create_base_schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Verify: All tables created successfully

## Phase 3: Vercel Production Setup (YOU - DO AFTER MIGRATIONS)

- [ ] Go to Vercel Dashboard
- [ ] Open Project Settings
- [ ] Click Environment Variables
- [ ] Add Variable 1:
  - Name: `NEXT_PUBLIC_SUPABASE_URL`
  - Value: `https://yktwhrjqqhlpmwrnmzly.supabase.co`
  - Environment: Production
  - Click Add
- [ ] Add Variable 2:
  - Name: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Value: `sb_publishable_WM_7xUCBfq1NVxgY-3hq_A_H4h8VMAR`
  - Environment: Production
  - Click Add
- [ ] Redeploy production (git push or Publish button in v0)

## Phase 4: Test Dev Connection (I'LL HELP)

- [ ] Run `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Check browser console for errors
- [ ] Verify app loads without Supabase errors

## Phase 5: Implement Authentication APIs (NEXT)

- [ ] Create Super Admin login endpoint
  - POST /api/auth/superadmin/login
  - Verify email/password
  - Return JWT token

- [ ] Create Society Admin login endpoint
  - POST /api/auth/society-admin/login
  - Verify username/password
  - Return JWT token

- [ ] Create Resident signup endpoint
  - POST /api/auth/resident/signup
  - Verify invitation token (24h expiry)
  - Create user + resident record
  - Return JWT token

- [ ] Create Watchman signup endpoint
  - POST /api/auth/watchman/signup
  - Verify invitation token (24h expiry)
  - Create user + watchman record
  - Return JWT token

## Phase 6: Implement Core CRUD Operations

### Super Admin APIs
- [ ] POST /api/societies - Create society
- [ ] GET /api/societies - List all societies
- [ ] POST /api/society-admins - Create society admin

### Society Admin APIs
- [ ] POST /api/properties - Add property
- [ ] GET /api/properties - List properties
- [ ] POST /api/residents/invite-link - Generate resident link
- [ ] GET /api/residents - List residents
- [ ] DELETE /api/residents/:id - Revoke resident
- [ ] POST /api/watchmen/invite-link - Generate watchman link
- [ ] GET /api/watchmen - List watchmen
- [ ] DELETE /api/watchmen/:id - Remove watchman

### Resident/Watchman APIs
- [ ] GET /api/visitors - List visitors (watchman)
- [ ] POST /api/visitors - Log visitor (watchman)
- [ ] GET /api/parcels - List parcels
- [ ] POST /api/issues - Report issue
- [ ] GET /api/property - Get own property info (resident)

## Phase 7: Connect Frontend to Backend

- [ ] Update Auth pages to use API
- [ ] Update Properties page to fetch from DB
- [ ] Update Residents management to use DB
- [ ] Update Watchmen management to use DB
- [ ] Update Add Property form to save to DB

## Phase 8: Security (Row-Level Security)

- [ ] Implement RLS policies on all tables
- [ ] Super admin sees all data
- [ ] Society admin sees only their society
- [ ] Residents see only their property
- [ ] Watchmen see only their society

## Phase 9: Testing & Deployment

- [ ] Test all authentication flows in Dev
- [ ] Test all CRUD operations in Dev
- [ ] Verify data in Supabase Dev dashboard
- [ ] Deploy to production (git push)
- [ ] Test Prod database connection
- [ ] Verify Prod Supabase has data

## Current Status

✅ **Phase 1**: Complete - All setup files created
⏳ **Phase 2**: Waiting for you - Run migrations
⏳ **Phase 3**: Waiting for you - Add env vars to Vercel
⏳ **Phase 4**: Ready - Will test after your setup
⏳ **Phases 5-9**: Ready to implement

---

## Important Notes

1. **Migrations are CRITICAL**
   - Must run EXACTLY the same SQL on both databases
   - Dev and Prod must have identical schemas
   - Mistakes here break everything

2. **Environment Variables**
   - Dev uses `.env.local` (different URL)
   - Prod uses Vercel Settings (different URL)
   - MUST redeploy after adding to Vercel

3. **Testing Locally**
   - Dev database is test-safe
   - Can delete all data and restart
   - Perfect for development

4. **Production Data**
   - Prod database is live
   - Real user data
   - Backup regularly
   - Be careful with migrations

---

## Need Help?

1. **Supabase doesn't connect**: Check `.env.local`
2. **Migration fails**: Copy-paste exact SQL, check for typos
3. **Prod env vars not working**: Add to Vercel Settings and redeploy
4. **Can't see tables**: Refresh Supabase dashboard, check project selector
5. **Build failing**: Check error message in terminal

---

## Timeline Estimate

- Phase 2 (Migrations): 10 minutes
- Phase 3 (Vercel Setup): 5 minutes  
- Phase 4 (Test Dev): 5 minutes
- Phase 5 (Auth APIs): 2-3 hours
- Phase 6 (CRUD APIs): 3-4 hours
- Phase 7 (Connect Frontend): 2-3 hours
- Phase 8 (RLS): 1-2 hours
- Phase 9 (Testing & Deploy): 1 hour

**Total: ~13-18 hours for full integration**

You can do phases in parallel once Phase 2 is complete.

---

## Next Action

**→ Complete Phase 2: Run migrations on both databases**

Once done, come back and I'll help with the rest!
