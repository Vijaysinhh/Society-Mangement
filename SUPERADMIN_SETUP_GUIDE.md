# Superadmin Setup Guide

## Account Created

**Email:** vijaysinhjadhav23@gmail.com  
**Password:** Vijaysinh@23

## Steps to Connect Everything

### 1. Create Superadmin Account in Database

The superadmin account needs to be created in your Supabase instance. Run this SQL in Supabase console:

```sql
-- First, run the migrations to create tables
-- Go to supabase/migrations/003_create_superadmins.sql and copy the SQL

-- OR manually create the account:
INSERT INTO superadmins (email, password_hash, name, role, status)
VALUES (
  'vijaysinhjadhav23@gmail.com',
  -- Password hash for "Vijaysinh@23" (you'll get this from bcrypt)
  -- Use: npx bcrypt-cli hash "Vijaysinh@23"
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  'Vijay Sinh Jadhav',
  'superadmin',
  'active'
);
```

### 2. Get BCrypt Hash for Password

Run this command to get the hashed password:

```bash
npx bcrypt-cli hash "Vijaysinh@23"
```

Copy the output and use it in the SQL INSERT above.

### 3. Run Database Migrations

In your Supabase project, run all migrations in order:
- `supabase/migrations/001_create_base_tables.sql` - Creates all 12 tables
- `supabase/migrations/002_create_rls_policies.sql` - Adds security policies
- `supabase/migrations/003_create_superadmins.sql` - Creates superadmins table

### 4. Start the Application

```bash
npm run dev
# or
pnpm dev
```

### 5. Login to Superadmin Portal

1. Go to http://localhost:3000/superadmin-login
2. Enter email: `vijaysinhjadhav23@gmail.com`
3. Enter password: `Vijaysinh@23`
4. Click "Sign In"

### 6. Create Your First Society

On the superadmin dashboard:
1. Click "Create Society"
2. Fill in society name, address, type, etc.
3. Specify number of properties (villas/bungalows/flats)
4. Submit

This will:
- Create the society in the database
- Auto-generate custom URLs for:
  - Society Admin login: `/[societyName]/societyadmin/login`
  - Resident login: `/[societyName]/resident/login`
  - Watchman login: `/[societyName]/watchman/login`
- Create initial society admin with credentials

## API Endpoints Connected

✅ **GET /api/societies** - Fetch all societies  
✅ **POST /api/societies** - Create new society  
✅ **GET /api/residents** - Fetch residents by society  
✅ **POST /api/residents** - Create resident  
✅ **GET /api/watchmen** - Fetch watchmen by society  
✅ **POST /api/watchmen** - Create watchman  
✅ **GET /api/society-admins** - Fetch admins by society  
✅ **POST /api/society-admins** - Create admin  

## Frontend Components Connected

✅ **Superadmin Login** - Real API authentication  
✅ **Superadmin Dashboard** - Fetches real data from APIs  
✅ **Society Creation** - Creates in real database  

## Next Steps

1. Connect resident dashboard to APIs
2. Connect watchman dashboard to APIs
3. Connect society admin dashboard to APIs
4. Add push notifications
5. Deploy to production

## Troubleshooting

**"Database not configured"**
- Make sure SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY are set

**"Superadmin not found"**
- Run the SQL INSERT to create the account first

**"Invalid password"**
- Make sure you're using the correct bcrypt hash in the database

**Societies not showing**
- Check that you're logged in (token in localStorage)
- Check network tab to see if API call succeeded
