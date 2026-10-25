# Database Setup Instructions

## Step 1: Get Your Supabase Credentials
You already have these from your free Supabase account:
- `SUPABASE_URL` → `process.env.SUPABASE_URL_4`
- `SUPABASE_PUBLISHABLE_KEY` → `process.env.SUPABASE_PUBLISHABLE_KEY_4`
- `SUPABASE_SECRET_KEY` → `process.env.SUPABASE_SECRET_KEY_4`

## Step 2: Run Database Migrations in Supabase Console

1. Go to your Supabase Dashboard
2. Select your project
3. Go to **SQL Editor** tab
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/001_create_base_tables.sql`
6. Click **Run**
7. Repeat for `supabase/migrations/002_create_rls_policies.sql`

## Step 3: Verify Tables Created

Run this query in SQL Editor to verify:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:
- societies
- users
- superadmins
- units
- residents
- watchmen
- visitors
- property_payments
- maintenance_requests
- announcements
- messages
- activity_logs

## Step 4: Create Initial Superadmin (One-time setup)

Run this query to create your first superadmin:
```sql
INSERT INTO superadmins (email, password_hash, full_name) VALUES 
(
  'superadmin@example.com',
  'bcrypt_hash_here',  -- Generate with: echo -n 'password' | bcrypt
  'Super Admin'
);
```

Or use the `/api/setup/create-superadmin` endpoint once the backend is configured.

## Step 5: Backend Configuration

Update your `.env.local`:
```
SUPABASE_URL=your_url_from_supabase
SUPABASE_PUBLISHABLE_KEY=your_key_from_supabase
SUPABASE_SECRET_KEY=your_secret_from_supabase
JWT_SECRET=your_jwt_secret_key
```

## What's Now Ready

✅ 12 Database Tables with full schema
✅ Row-Level Security (RLS) Policies for multi-tenancy
✅ Indexes for performance optimization
✅ Foreign key relationships
✅ Constraints and validations

## Next Steps

1. Build backend API endpoints
2. Update frontend to use real backend data
3. Test authentication flow end-to-end
