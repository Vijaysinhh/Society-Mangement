# Seeding Demo Data into Supabase

This guide explains how to populate your Supabase database with realistic demo data for showcasing to customers.

## What Gets Created

The seed script creates one complete demo society with:

### 1. One Demo Society
- **Name**: Sunrise Heights Society
- **Location**: Mumbai, Maharashtra, India
- **Total Units**: 120

### 2. Real Auth Accounts (Created in Supabase Auth)

**SuperAdmin Account:**
- Email: `superadmin@demo.com`
- Password: `Demo@123456`
- Access: All societies globally

**Society Admin Account:**
- Email: `admin@demo.com`
- Password: `Admin@123456`
- Access: Sunrise Heights Society only

**3 Resident Accounts:**
- Rajesh Kumar (A-101, Flat)
  - Email: `resident1@demo.com`
  - Password: `Resident@123`
- Priya Sharma (B-202, Flat)
  - Email: `resident2@demo.com`
  - Password: `Resident@123`
- Amit Patel (C-501, Villa)
  - Email: `resident3@demo.com`
  - Password: `Resident@123`

**2 Watchman Accounts:**
- Ramesh Singh
  - Email: `watchman1@demo.com`
  - Password: `Watchman@123`
- Vikram Nair
  - Email: `watchman2@demo.com`
  - Password: `Watchman@123`

### 3. Real Database Data

For each account created:
- ✅ Database records linked to Supabase Auth users
- ✅ Properties for each resident
- ✅ Maintenance bills for each property
- ✅ Demo complaints showing system features
- ✅ Demo amenities (Community Hall, Swimming Pool, Gym)
- ✅ Financial data showing society financial health

## Prerequisites

Before running the seed script:

1. **Supabase project must have tables created**
   - Run migrations or create tables manually based on schema in `lib/types.ts`

2. **Environment variables must be set**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Node.js and dependencies installed**
   ```bash
   npm install
   # or
   pnpm install
   ```

## Running the Seed Script

### Option 1: Using npx ts-node (Recommended)

```bash
npx ts-node scripts/seed-demo-data.ts
```

### Option 2: Using tsx

```bash
npx tsx scripts/seed-demo-data.ts
```

### Option 3: Build and run as JavaScript

```bash
# Build TypeScript to JavaScript
npm run build

# Run the compiled script
node dist/scripts/seed-demo-data.js
```

## What Happens

1. Creates Sunrise Heights Society in `societies` table
2. Creates SuperAdmin auth account in Supabase Auth
3. Creates Society Admin auth account + database record
4. Creates 3 Resident auth accounts + database records + properties
5. Creates 2 Watchman auth accounts + database records
6. Populates bills, complaints, amenities, and financial data

The script validates each step and prints progress to console.

## After Seeding

Once the script completes:

1. **Test Login Pages**
   - Go to `/superadmin/login` and try superadmin@demo.com / Demo@123456
   - Go to `/admin/login` and try admin@demo.com / Admin@123456
   - Go to `/resident/login` and try resident1@demo.com / Resident@123
   - Go to `/watchman/login` and try watchman1@demo.com / Watchman@123

2. **Verify Each Dashboard**
   - SuperAdmin dashboard shows the one society
   - Admin dashboard shows Sunrise Heights with all data
   - Resident dashboards show their specific properties and bills
   - Watchman dashboard shows visitor and parcel logs

3. **Test Data Flows**
   - Admin creates bills → Residents see bills on dashboard
   - Residents submit complaints → Admin sees in complaint tab
   - Watchmen log visitors → Residents get approval requests
   - Everything is real data in real database!

## Resetting Demo Data

To clear and reseed:

1. **Delete existing records** (if needed):
   ```sql
   -- Delete from most dependent tables first
   DELETE FROM bill_payments WHERE bill_id IN (SELECT id FROM maintenance_bills WHERE society_id = 'society-id');
   DELETE FROM maintenance_bills WHERE society_id = 'society-id';
   DELETE FROM properties WHERE society_id = 'society-id';
   DELETE FROM complaints WHERE society_id = 'society-id';
   -- ... continue for other tables
   ```

2. **Delete auth accounts** via Supabase Dashboard:
   - Go to Authentication > Users
   - Delete the demo user accounts

3. **Re-run the seed script**:
   ```bash
   npx ts-node scripts/seed-demo-data.ts
   ```

## Troubleshooting

### Error: "Table does not exist"
- Ensure all database tables are created first
- Check that table names match exactly (case-sensitive)

### Error: "User already exists"
- The auth account exists but data wasn't created
- Delete the auth account and re-run seed

### Error: "Missing environment variables"
```bash
# Make sure these are set:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Script runs but nothing appears in database
- Check Supabase dashboard to see if data was actually created
- Look at auth > users to see if auth accounts were made
- Check browser console for any network errors

## Next Steps

Once seeding works:

1. **Update login pages** to accept these demo credentials
2. **Verify all dashboards load** with the real demo data
3. **Test actual data flows** (not mock data anymore - REAL data!)
4. **Show to customers** - they'll see real working system

## Database Schema

If you need to create tables first, the schema based on `lib/types.ts`:

```sql
-- Core tables
CREATE TABLE societies (...)
CREATE TABLE society_admins (...)
CREATE TABLE residents (...)
CREATE TABLE watchmen (...)

-- Properties and Bills
CREATE TABLE properties (...)
CREATE TABLE maintenance_bills (...)
CREATE TABLE bill_payments (...)

-- Complaints
CREATE TABLE complaints (...)
CREATE TABLE complaint_responses (...)

-- Visitors
CREATE TABLE visitor_logs (...)
CREATE TABLE visitor_approvals (...)
CREATE TABLE visitor_blacklist (...)

-- Amenities
CREATE TABLE amenities (...)
CREATE TABLE amenity_bookings (...)

-- Parcels
CREATE TABLE parcels (...)

-- Watchman
CREATE TABLE duty_schedules (...)
CREATE TABLE duty_logs (...)

-- Other
CREATE TABLE messages (...)
CREATE TABLE financial_data (...)
CREATE TABLE emergency_alerts (...)
```

See `PRODUCTION_ARCHITECTURE.md` for full schema definitions.
