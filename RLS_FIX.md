# Fix: Unable to Create Society - RLS Policy Issue

## Problem
The SQL schema creates tables with Row Level Security (RLS) enabled by default. Without proper policies, all write operations are blocked.

## Solution

Run this SQL in Supabase SQL Editor:

```sql
-- Disable RLS on all tables (for development/testing)
ALTER TABLE societies DISABLE ROW LEVEL SECURITY;
ALTER TABLE society_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE residents DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchmen DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_links DISABLE ROW LEVEL SECURITY;
```

### Steps:
1. Go to https://app.supabase.com/project/oxrykmbmsrjotmjljwjw/sql/new
2. Create a new SQL query
3. Copy the SQL above
4. Click **RUN**
5. Verify the output shows `rowsecurity=f` (false) for all tables

## Testing
After disabling RLS, try creating a society again in the dashboard. It should now work.

## For Production
In production, you should enable RLS and create specific policies:
- Allow authenticated users to read societies
- Allow super admins to insert/update/delete societies
- Allow society admins to manage their own data
- Allow residents/watchmen to read relevant data

See `lib/supabase-schema.sql` for the complete schema.
