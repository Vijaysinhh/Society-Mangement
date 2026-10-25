# Supabase Database Setup Guide

## Overview
This guide walks you through setting up the Supabase database for the multi-tenant society management system.

## Prerequisites
- Supabase Project: https://app.supabase.com/project/oxrykmbmsrjotmjljwjw
- Project URL: `https://oxrykmbmsrjotmjljwjw.supabase.co`
- Credentials already configured in `.env.local`

## Step 1: Create Database Tables

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/oxrykmbmsrjotmjljwjw/sql/new
   - Click "New Query"

2. **Copy and Paste SQL Schema:**
   - Open file: `lib/supabase-schema.sql`
   - Copy ALL content
   - Paste into the SQL editor in Supabase

3. **Execute the Schema:**
   - Click the blue "RUN" button
   - Wait for confirmation message
   - You should see: "Query executed successfully"

4. **Verify Tables Created:**
   - Go to the "Tables" section in Supabase
   - You should see these tables:
     - societies
     - society_admins
     - properties
     - residents
     - watchmen
     - invitation_links

## Step 2: Database is Ready!

Once the SQL schema is executed, the database is ready to use. The application will now:

- **Create societies** in the `societies` table (not just localStorage)
- **Store admin credentials** in the `society_admins` table
- **Authenticate admins** by querying the database
- **Persist all data** across page refreshes

## Step 3: Test the Complete Flow

1. **Start the dev server** (if not already running):
   ```bash
   pnpm dev
   ```

2. **Create a New Society:**
   - Visit: http://localhost:3000/superadmin-dashboard
   - Click "Societies" → "Create Society"
   - Fill in all fields including admin credentials
   - Example:
     - Society Name: "TestCity"
     - Admin Username: "testadmin"
     - Admin Password: "Test@12345"
   - Submit

3. **Login with New Admin Credentials:**
   - Visit: http://localhost:3000/testcity/societyadmin/login
   - Enter credentials created in step 2
   - You should successfully login and see the admin dashboard

## Expected Database Behavior

### Table: societies
- Stores: Name, Address, City, Properties (villas, bungalows, flats), Contact info
- Referenced by: admins, residents, watchmen, properties, invitations

### Table: society_admins
- Stores: Admin username, password, email, phone, society reference
- Unique constraint: society_id + username (one admin name per society)

### Table: residents
- Stores: Phone number (username), password, email, property reference
- Unique constraint: society_id + phone

### Table: watchmen
- Stores: Phone number (username), password, assigned area, shift times
- Unique constraint: society_id + phone

## Security Notes

⚠️ **Important:** Passwords are currently stored in plain text for demo purposes.
- For production, implement bcrypt password hashing
- See: `utils/supabase/services.ts` - search for "TODO: Hash password"

## Troubleshooting

**Q: "Society not found" error when trying to login?**
- Ensure the society slug matches (lowercase, hyphens only)
- Check if society was actually saved to database (view in Supabase dashboard)

**Q: "Invalid username or password" error?**
- Verify admin credentials in the society_admins table (Supabase dashboard)
- Check that the database query is executing correctly
- See console logs for debugging

**Q: Tables don't exist?**
- Make sure you ran the full SQL schema
- All statements must complete successfully
- Refresh the Supabase dashboard to see new tables

## Next Steps

1. ✅ Database is now real with Supabase
2. ⬜ Implement password hashing with bcrypt
3. ⬜ Add Row Level Security (RLS) policies
4. ⬜ Implement resident signup flow
5. ⬜ Implement watchman dashboard features

## Files Referenced

- Database Schema: `lib/supabase-schema.sql`
- Supabase Services: `utils/supabase/services.ts`
- Admin Login Page: `app/[societyName]/societyadmin/login/page.tsx`
- Create Society Form: `app/superadmin-dashboard/components/CreateSocietyForm.tsx`
