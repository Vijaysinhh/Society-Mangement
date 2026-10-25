# Quick Start - Database Integration

## 🚀 3 Easy Steps to Get Running

### STEP 1: Run Migrations (10 minutes)

#### Dev Database
```
1. Go to https://app.supabase.com
2. Click on Dev Project: "oxrykmbmsrjotmjljwjw"
3. Go to SQL Editor (left sidebar)
4. Click "New query"
5. Open this file: migrations/001_create_base_schema.sql
6. Copy ALL the SQL
7. Paste into the SQL Editor
8. Click Run (green button)
9. Wait for "executed successfully"
10. You'll see all 10 tables created
```

#### Prod Database
```
1. Go to https://app.supabase.com
2. Click on Prod Project: "yktwhrjqqhlpmwrnmzly"
3. Go to SQL Editor (left sidebar)
4. Click "New query"
5. Open this file: migrations/001_create_base_schema.sql
6. Copy ALL the SQL
7. Paste into the SQL Editor
8. Click Run (green button)
9. Wait for "executed successfully"
10. Both databases now have identical schemas ✓
```

**Time: ~10 minutes**
**You need: Supabase account access**

---

### STEP 2: Add Production Environment Variables (5 minutes)

```
1. Go to Vercel Dashboard
2. Click your project name
3. Go to Settings (top navigation)
4. Click "Environment Variables" (left sidebar)
5. Click "Add New"
   
   First Variable:
   • Name: NEXT_PUBLIC_SUPABASE_URL
   • Value: https://yktwhrjqqhlpmwrnmzly.supabase.co
   • Select Environment: Production ✓
   • Click Save

6. Click "Add New" again
   
   Second Variable:
   • Name: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   • Value: sb_publishable_WM_7xUCBfq1NVxgY-3hq_A_H4h8VMAR
   • Select Environment: Production ✓
   • Click Save

7. Now redeploy:
   • Either: git push to trigger deploy
   • Or: Click "Publish" button in v0
```

**Time: ~5 minutes**
**You need: Vercel account access**

---

### STEP 3: Test Locally (5 minutes)

```bash
# Terminal
pnpm dev
```

Then:
```
1. Open http://localhost:3000
2. Open browser DevTools (F12)
3. Go to Console tab
4. You should see NO red errors
5. App is connected to Dev Supabase ✓
```

**Time: ~5 minutes**
**You need: Nothing - just run command**

---

## ✓ All Set!

After these 3 steps:
- ✓ Dev database is ready
- ✓ Prod database is ready
- ✓ Environment variables configured
- ✓ App connects to Dev locally
- ✓ App will connect to Prod after publish

---

## What Files Were Created

```
✓ .env.local - Dev database credentials
✓ utils/supabase/server.ts - Server client
✓ utils/supabase/client.ts - Browser client
✓ utils/supabase/middleware.ts - Session manager
✓ migrations/001_create_base_schema.sql - Database schema
```

---

## Database Schema (10 Tables)

```
societies          → Multiple communities
users              → All user roles
properties         → Flats/units
residents          → People living there
watchmen           → Security staff
visitors           → Visitor logs
parcels            → Package tracking
issues             → Complaint tracker
blacklist          → Banned visitors
invitation_links   → Signup links
```

---

## Next: Connect Frontend to Backend

After Step 3, I'll help you:

1. Create authentication endpoints
2. Build API routes for CRUD operations
3. Connect components to database
4. Implement Row-Level Security
5. Deploy to production

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Can't find Dev project" | Make sure you're on supabase.com, select right project |
| "SQL has syntax error" | Copy exact file from migrations/, don't edit |
| "Env vars not working" | Redeploy in Vercel (git push or Publish button) |
| "App still shows errors" | Clear browser cache (Ctrl+Shift+Delete) |
| "Tables not showing" | Refresh Supabase dashboard, click project again |

---

## Commands to Know

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Check for TypeScript errors
pnpm typecheck

# Run linter
pnpm lint
```

---

## Important Notes

1. **Dev & Prod must have IDENTICAL schemas**
   - Same SQL migration runs on both
   - Only data will be different

2. **Do NOT share**
   - Service role keys (keep secret)
   - Database passwords
   - Real user data

3. **Always test in Dev first**
   - Break things safely
   - Then deploy to Prod

4. **Redeploy after env var changes**
   - New environment variables need fresh deployment
   - git push or click Publish in v0

---

## Checklist

- [ ] Step 1: Migrations run on Dev DB (check Supabase dashboard for tables)
- [ ] Step 2: Migrations run on Prod DB (check Supabase dashboard for tables)
- [ ] Step 3: Env vars added to Vercel (check Settings → Environment Variables)
- [ ] Step 4: Prod redeployed (git push or Publish button)
- [ ] Step 5: Local dev runs without errors (pnpm dev → http://localhost:3000)

---

## You're Done with Step 1! 🎉

**Next: Tell me when Steps 1-3 are complete and I'll help with authentication APIs**

Estimated time to full integration after this:
- Migrations: 10 min
- Env vars: 5 min
- Test: 5 min
- Auth APIs: 2-3 hours
- CRUD APIs: 3-4 hours
- Frontend integration: 2-3 hours
- Deployment: 30 min

**Total: ~13 hours for complete working system**
