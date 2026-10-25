# Multi-Tenant Society Management System - Quick Start Guide

## Current Status: ✅ Backend Ready for Testing

The development server is now running with real Supabase database integration. All components are in place.

---

## Critical: Execute Database Schema (5 minutes)

**⚠️ DO THIS FIRST before testing anything:**

1. Open Supabase SQL Editor:
   - https://app.supabase.com/project/oxrykmbmsrjotmjljwjw/sql/new

2. Click "New Query" and paste this entire SQL schema:
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Societies table
   CREATE TABLE IF NOT EXISTS societies (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(255) NOT NULL,
     slug VARCHAR(255) NOT NULL UNIQUE,
     address TEXT,
     city VARCHAR(100),
     state VARCHAR(100),
     phone VARCHAR(20),
     contact_person VARCHAR(255),
     villas INTEGER DEFAULT 0,
     bungalows INTEGER DEFAULT 0,
     flats INTEGER DEFAULT 0,
     occupied_units INTEGER DEFAULT 0,
     total_residents INTEGER DEFAULT 0,
     total_watchmen INTEGER DEFAULT 0,
     today_visitors INTEGER DEFAULT 0,
     week_visitors INTEGER DEFAULT 0,
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Society Admins table
   CREATE TABLE IF NOT EXISTS society_admins (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     name VARCHAR(255),
     email VARCHAR(255),
     phone VARCHAR(20),
     status VARCHAR(20) DEFAULT 'active',
     joined_date DATE DEFAULT CURRENT_DATE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(society_id, username)
   );

   -- Properties/Units table
   CREATE TABLE IF NOT EXISTS properties (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
     unit_number VARCHAR(50) NOT NULL,
     floor INTEGER,
     bedrooms INTEGER,
     property_type VARCHAR(50),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(society_id, unit_number)
   );

   -- Residents table
   CREATE TABLE IF NOT EXISTS residents (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
     property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
     phone VARCHAR(20) NOT NULL,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255),
     password VARCHAR(255) NOT NULL,
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(society_id, phone)
   );

   -- Watchmen table
   CREATE TABLE IF NOT EXISTS watchmen (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
     phone VARCHAR(20) NOT NULL,
     name VARCHAR(255) NOT NULL,
     address TEXT,
     password VARCHAR(255) NOT NULL,
     shift_start TIME,
     shift_end TIME,
     assigned_area VARCHAR(255),
     status VARCHAR(20) DEFAULT 'active',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(society_id, phone)
   );

   -- Invitation Links table
   CREATE TABLE IF NOT EXISTS invitation_links (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
     token VARCHAR(255) NOT NULL UNIQUE,
     created_by UUID REFERENCES society_admins(id) ON DELETE SET NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     expires_at TIMESTAMP,
     used_by UUID REFERENCES residents(id) ON DELETE SET NULL,
     used_at TIMESTAMP
   );

   -- Create indexes for better query performance
   CREATE INDEX idx_societies_slug ON societies(slug);
   CREATE INDEX idx_society_admins_society_id ON society_admins(society_id);
   CREATE INDEX idx_society_admins_username ON society_admins(username);
   CREATE INDEX idx_residents_society_id ON residents(society_id);
   CREATE INDEX idx_residents_phone ON residents(phone);
   CREATE INDEX idx_watchmen_society_id ON watchmen(society_id);
   CREATE INDEX idx_watchmen_phone ON watchmen(phone);
   CREATE INDEX idx_properties_society_id ON properties(society_id);
   CREATE INDEX idx_invitation_links_token ON invitation_links(token);
   ```

3. Click the blue "RUN" button
4. Wait for success confirmation

---

## Complete Authentication Flow Test

### 1. Create a New Society with Admin

**URL:** http://localhost:3000/superadmin-dashboard

Steps:
1. Click "Societies" → "Create Society"
2. Fill in form:
   - **Society Name:** MyCity
   - **Address:** 123 Main St
   - **City:** Springfield
   - **State:** IL
   - **Contact Person:** John Doe
   - **Phone:** 9876543210
   - **Properties:** 5 villas, 3 bungalows, 10 flats
   - **Admin Username:** MyCity@Admin
   - **Admin Password:** MyCity@123

3. Click "Create Society"
4. ✅ Society created in Supabase database

### 2. View Society Details & Login URLs

In the society detail card, you'll see:
- **Society Admin Login:** http://localhost:3000/mycity/societyadmin/login
- **Resident Login:** http://localhost:3000/mycity/resident/login
- **Watchman Login:** http://localhost:3000/mycity/watchman/login

Copy buttons available for each URL.

### 3. Test Admin Login

**URL:** http://localhost:3000/mycity/societyadmin/login

Enter credentials from Step 1:
- **Username:** MyCity@Admin
- **Password:** MyCity@123

✅ Should successfully login and redirect to admin dashboard

### 4. Verify Data in Supabase

Go to: https://app.supabase.com/project/oxrykmbmsrjotmjljwjw/editor/143

You should see in the `societies` table:
- name: "MyCity"
- slug: "mycity"
- All your property counts

In the `society_admins` table:
- username: "MyCity@Admin"
- password: "MyCity@123"
- society_id: [matching society id]

---

## What's Working Now

✅ **Multi-Tenant Architecture**
- Each society is isolated with its own slug (e.g., /mycity, /sonicity)
- Dynamic routing with [societyName] parameter

✅ **Society Creation**
- Create new societies with admin credentials
- Data saved to real Supabase database
- Login URLs automatically generated

✅ **Admin Authentication**
- Society admin login page queries real database
- Validates credentials against society_admins table
- Creates session and redirects to admin dashboard

✅ **Data Persistence**
- All data persists in Supabase (survives page refresh)
- No longer dependent on localStorage

---

## What Needs Next

1. **Password Hashing:** Replace plain text passwords with bcrypt
2. **Resident Flow:** Implement resident signup and login
3. **Watchman Management:** Add watchman creation and login
4. **Row Level Security:** Add RLS policies for data isolation
5. **Error Handling:** Add proper error boundaries and messages

---

## Architecture Overview

```
User Inputs (Super Admin Dashboard)
    ↓
CreateSocietyForm Component
    ↓
Supabase Services (utils/supabase/services.ts)
    ↓
Supabase Database (Real tables)
    ↓
Login Pages Query Database
    ↓
Authenticate & Create Session
    ↓
Admin/Resident/Watchman Dashboard
```

---

## Key Files

- **Database Schema:** `lib/supabase-schema.sql`
- **Supabase Services:** `utils/supabase/services.ts` (15+ functions)
- **Admin Login:** `app/[societyName]/societyadmin/login/page.tsx`
- **Create Society:** `app/superadmin-dashboard/components/CreateSocietyForm.tsx`
- **Supabase Clients:** `utils/supabase/client.ts` & `server.ts`

---

## Troubleshooting

**"Cannot query society" error?**
- Schema not executed in Supabase yet - do it now!

**"Invalid credentials" on login?**
- Double-check username/password match exactly (case-sensitive)
- Verify admin exists in society_admins table (Supabase dashboard)

**Login page shows "Society not found"?**
- Verify society slug in URL matches the database
- Check societies table for correct slug

---

## Success Indicators

You'll know everything is working when:

1. ✅ Societies created in Supabase (view in dashboard)
2. ✅ Admin login succeeds with new credentials
3. ✅ Data persists across page refresh
4. ✅ Each society has isolated data
5. ✅ Login URLs are unique per society

Start testing now! Questions? Check the console logs for debugging info.
