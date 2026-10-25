# Supabase Integration Setup Guide

## Environment Overview

This project uses **2 Supabase databases** as planned:

- **DEV Database**: For local development and testing
- **PROD Database**: For production users and real data

## Dev Environment Setup

### 1. Local Development (Already Configured)

Your `.env.local` is already set up with Dev credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://oxrykmbmsrjotmjljwjw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_lj2dSJeqRyp6bL3mk7SWWA_TySf4SjK
```

### 2. Running Migrations on Dev Database

To create the database schema:

1. Open Supabase Dashboard: https://app.supabase.com/
2. Login and select your **Dev project**
3. Go to **SQL Editor**
4. Create new query and paste the contents of `migrations/001_create_base_schema.sql`
5. Click **Run** to execute the migration

Or use the Supabase CLI:
```bash
supabase db push --db-url "postgresql://postgres:[password]@oxrykmbmsrjotmjljwjw.supabase.co:5432/postgres"
```

### 3. Testing Dev Database Locally

Start dev server:
```bash
pnpm dev
```

The app will now connect to your Dev Supabase project.

---

## Production Environment Setup

### 1. Add Vercel Environment Variables

When deploying to production (Vercel):

1. Go to Vercel Project Settings → Environment Variables
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://yktwhrjqqhlpmwrnmzly.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_WM_7xUCBfq1NVxgY-3hq_A_H4h8VMAR
```

### 2. Running Migrations on Prod Database

Follow the same steps as Dev:

1. Open Supabase Dashboard: https://app.supabase.com/
2. Login and select your **Prod project**
3. Go to **SQL Editor**
4. Create new query and paste the contents of `migrations/001_create_base_schema.sql`
5. Click **Run** to execute the migration

**Important**: The schema MUST be identical on both Dev and Prod databases.

### 3. Deploying to Production

Once migrations are run on Prod:

1. Push to GitHub
2. Click **Publish** in v0
3. Vercel auto-deploys
4. Production loads Prod Supabase credentials
5. Your app connects to Production database

---

## File Structure

```
/vercel/share/v0-project/
├── .env.local (Dev credentials)
├── utils/supabase/
│   ├── server.ts (Server-side client)
│   ├── client.ts (Browser client)
│   └── middleware.ts (Session refresh)
└── migrations/
    └── 001_create_base_schema.sql (Database schema)
```

---

## Using Supabase in Your Code

### Server-Side (RSC, API Routes)

```typescript
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function MyComponent() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('society_id', societyId)
  
  return <div>{/* render data */}</div>
}
```

### Client-Side (React Components)

```typescript
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [residents, setResidents] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const fetchResidents = async () => {
      const { data } = await supabase
        .from('residents')
        .select('*')
        .eq('society_id', societyId)
      
      setResidents(data || [])
    }
    
    fetchResidents()
  }, [])
  
  return <div>{/* render residents */}</div>
}
```

---

## Database Schema Overview

### Tables:
- **societies** - Multiple societies/communities
- **users** - Super admin, society admin, residents, watchmen
- **properties** - Flats/units in each society
- **residents** - People living in properties
- **watchmen** - Security staff
- **visitors** - Visitor logs with check-in/out
- **parcels** - Package/parcel management
- **issues** - Complaints and issues tracker
- **blacklist** - Banned visitors
- **invitation_links** - Signup links for residents/watchmen

### Key Features:
- Multi-tenant support (each society isolated)
- Row-level security ready (will implement next)
- Timestamps on all tables
- Foreign key constraints
- Performance indexes

---

## Next Steps

1. ✅ Install packages
2. ✅ Create Supabase clients
3. ✅ Configure environment variables
4. ✅ Create database schema
5. ⏭️ **Run migrations on both databases**
6. ⏭️ Implement Row-Level Security (RLS)
7. ⏭️ Create API endpoints
8. ⏭️ Connect frontend to database
9. ⏭️ Test authentication flows
10. ⏭️ Deploy to production

---

## Troubleshooting

### "Database connection failed"
- Check `.env.local` has correct Supabase URL and key
- Verify Supabase project is active

### "Migration syntax error"
- Copy exact SQL from `migrations/001_create_base_schema.sql`
- Check for typos in table names

### "ENV vars not working in Vercel"
- After adding env vars to Vercel Settings
- You MUST redeploy for changes to take effect
- `git push` or click Deploy in Vercel

### "Different schemas on Dev vs Prod"
- Always run the same migration file on both
- Keep migrations consistent between databases
