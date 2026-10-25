# Quick Start: Real Supabase Data & Demo Accounts

This guide gets you from zero to a working demo system with real Supabase accounts in 15 minutes.

## What You'll Have After This

✅ Real Supabase database with one complete demo society
✅ Real auth accounts for superadmin, admin, 3 residents, 2 watchmen
✅ Real demo data (properties, bills, complaints, amenities, parcels)
✅ Login pages that authenticate against real Supabase
✅ All four dashboards working with real data
✅ Ready to show to customers

## Prerequisites

You already have:
- Supabase project created
- Environment variables set (NEXT_PUBLIC_SUPABASE_URL, etc.)
- Database tables created
- Node.js installed
- pnpm or npm

## Step 1: Seed Demo Data (2 minutes)

Run the seeding script to create real accounts and data:

```bash
# Option 1: Using ts-node
npx ts-node scripts/seed-demo-data.ts

# Option 2: Using tsx
npx tsx scripts/seed-demo-data.ts
```

**What happens:**
- Creates Sunrise Heights Society in database
- Creates 1 superadmin account in Supabase Auth
- Creates 1 society admin account + database record
- Creates 3 resident accounts + properties
- Creates 2 watchman accounts
- Populates bills, complaints, amenities, financial data

**Output should show:**
```
========================================
DATABASE SEEDING COMPLETED SUCCESSFULLY
========================================

DEMO ACCOUNT CREDENTIALS:

SUPERADMIN:
  Email: superadmin@demo.com
  Password: Demo@123456

SOCIETY ADMIN:
  Email: admin@demo.com
  Password: Admin@123456
  Society: Sunrise Heights

RESIDENTS:
  Rajesh Kumar
    Email: resident1@demo.com
    Password: Resident@123
    Unit: A-101
  [... more residents ...]

WATCHMEN:
  Ramesh Singh
    Email: watchman1@demo.com
    Password: Watchman@123
  [... more watchmen ...]
```

## Step 2: Test SuperAdmin Login (2 minutes)

1. Start dev server:
```bash
npm run dev
# or
pnpm dev
```

2. Go to: http://localhost:3000/superadmin/login

3. Click "Demo Account" button to auto-fill credentials

4. Should redirect to `/superadmin-dashboard`

5. Verify you see:
   - Sunrise Heights Society listed
   - All data from your database

## Step 3: Test Admin Login (3 minutes)

1. Navigate to: http://localhost:3000/[societyName]/societyadmin/login

   Replace `[societyName]` with the society slug. For demo it's likely `/sunrise-heights/societyadmin/login`

2. Use:
   - Email: `admin@demo.com`
   - Password: `Admin@123456`

3. Should see Society Admin Dashboard with:
   - All residents (Rajesh, Priya, Amit)
   - All properties (A-101, B-202, C-501)
   - All bills
   - Complaints, visitors, parcels, etc.

## Step 4: Test Resident Login (2 minutes)

1. Navigate to: http://localhost:3000/[societyName]/resident/login

2. Use any resident:
   - Email: `resident1@demo.com`
   - Password: `Resident@123`

3. Should see Resident Dashboard with:
   - Their property (A-101)
   - Their bills
   - Their complaints
   - Their visitor requests
   - Financial data

## Step 5: Test Watchman Login (2 minutes)

1. Navigate to: http://localhost:3000/[societyName]/watchman/login

2. Use:
   - Email: `watchman1@demo.com`
   - Password: `Watchman@123`

3. Should see Watchman Dashboard with:
   - Visitor logs
   - Parcels
   - Duty schedule
   - Emergency alerts

## Step 6: Verify All Dashboards (2 minutes)

Test complete data flow:

1. **Admin Dashboard:**
   - View all residents
   - Click on a resident to see their bills
   - View financial summary
   - See pending complaints

2. **Resident Dashboard:**
   - See their bills
   - Verify bill matches admin dashboard
   - See amenities available
   - See complaints they submitted

3. **Admin Creates Bill:**
   - Go to Bills tab in admin
   - Create new bill for resident
   - Reload resident dashboard
   - New bill should appear (real-time sync!)

## Demo Account Credentials Quick Reference

```
SuperAdmin:
  superadmin@demo.com / Demo@123456

Admin (Sunrise Heights):
  admin@demo.com / Admin@123456

Residents:
  resident1@demo.com / Resident@123
  resident2@demo.com / Resident@123
  resident3@demo.com / Resident@123

Watchmen:
  watchman1@demo.com / Watchman@123
  watchman2@demo.com / Watchman@123
```

## Troubleshooting

### "Table does not exist" error when seeding

**Problem:** Database tables not created

**Solution:**
1. Go to Supabase dashboard
2. Create tables based on schema in `lib/types.ts`
3. Re-run seed script

### "User already exists" when seeding

**Problem:** Auth accounts exist but data failed

**Solution:**
1. Delete users via Supabase dashboard > Authentication > Users
2. Re-run seed script

### Login page shows empty fields

**Problem:** Demo accounts not seeded

**Solution:**
```bash
# Verify seed completed:
npx ts-node scripts/seed-demo-data.ts

# Then try login again
```

### Dashboards show no data

**Problem:** Data not synced with login

**Solution:**
1. Check localStorage has session:
   - Open DevTools > Application > LocalStorage
   - Look for `auth_session` key
   - Should have user, session, role, societyId

2. Check if you're on correct dashboard:
   - Admin should be at `/society-admin` or `/[societyName]/societyadmin`
   - Resident should be at `/resident-dashboard`
   - Watchman should be at `/watchman-dashboard`

### "Invalid email or password"

**Problem:** Wrong credentials

**Solution:**
- Use exact credentials above
- Check email is spelled correctly
- Verify you ran the seed script successfully

## Next Steps: Demo to Customers

Now you can:

1. **Show complete workflows:**
   - Admin creates bill → Resident sees it → Admin confirms payment
   - Resident requests visitor → Watchman logs them → Resident approves
   - Resident submits complaint → Admin responds → Status updates

2. **Highlight key features:**
   - Real-time synchronization (all dashboards stay updated)
   - Role-based access (each user sees only their data)
   - Complete audit trail
   - Multi-tenant isolation (one society's data separate from others)

3. **Showcase scalability:**
   - Add more societies later (just create different admins/residents)
   - All data stays isolated
   - System handles multiple societies independently

## Production Next Steps

Once customer demo is approved:

1. **Create production database:**
   - Set up new Supabase project for production
   - Migrate schema
   - Keep demo data in separate project

2. **Onboard first customers:**
   - Run seed script with their data
   - Create their admin accounts
   - Add their residents

3. **Monitor and optimize:**
   - Track performance metrics
   - Monitor API usage
   - Add caching as needed

## Architecture Overview

```
┌─ Real Supabase Database ────┐
│  ├─ societies              │
│  ├─ residents              │
│  ├─ properties             │
│  ├─ bills                  │
│  ├─ complaints             │
│  ├─ visitors               │
│  ├─ amenities              │
│  └─ ... (all other tables) │
└───────────────────────────┘
         ↓
┌─ Supabase Auth ─────────────┐
│  Real user accounts         │
│  Real sessions              │
│  Real JWT tokens            │
└───────────────────────────┘
         ↓
┌─ Next.js App ──────────────┐
│  Login pages (auth)         │
│  Dashboards (fetch data)    │
│  Polling (real-time sync)   │
│  WebSocket (emergency)      │
└───────────────────────────┘
```

## Resetting Demo Data

To start fresh:

### Option 1: Delete specific society

```sql
-- In Supabase SQL Editor
DELETE FROM bill_payments WHERE bill_id IN (
  SELECT id FROM maintenance_bills WHERE society_id = 'YOUR_SOCIETY_ID'
);
DELETE FROM maintenance_bills WHERE society_id = 'YOUR_SOCIETY_ID';
DELETE FROM properties WHERE society_id = 'YOUR_SOCIETY_ID';
-- ... continue for other tables
DELETE FROM societies WHERE id = 'YOUR_SOCIETY_ID';
```

### Option 2: Full reset

1. Go to Supabase Dashboard
2. Database > SQL Editor
3. Drop all tables
4. Re-run migrations to recreate empty tables
5. Run seed script again

## Questions?

If demo accounts aren't working:

1. Check seed script completed successfully
2. Verify environment variables are set
3. Check Supabase dashboard > Users tab
4. Look at browser console for errors (F12 > Console)
5. Check Network tab (F12 > Network) for failed API calls

You're ready! Start the dev server and test the demo accounts. Everything is real Supabase data now!
