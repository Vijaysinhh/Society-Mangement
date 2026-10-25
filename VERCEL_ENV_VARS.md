# Production Environment Variables for Vercel

## How to Add to Vercel

1. Go to your Vercel Project Dashboard
2. Click **Settings** (top navigation)
3. Go to **Environment Variables** (left sidebar)
4. Add each variable below as a new environment variable
5. Make sure to set them for **Production** environment
6. After adding, redeploy your application

---

## Production Supabase Variables

Add these exact variables to Vercel:

### Variable 1
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://yktwhrjqqhlpmwrnmzly.supabase.co`
- **Environments**: Production ✓

### Variable 2
- **Name**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Value**: `sb_publishable_WM_7xUCBfq1NVxgY-3hq_A_H4h8VMAR`
- **Environments**: Production ✓

---

## Important Notes

1. **These are PUBLIC variables** (NEXT_PUBLIC_ prefix)
   - Safe to be in frontend code
   - They are NOT secrets
   - Anyone can see them in your compiled app

2. **Do NOT share**:
   - Service role keys (keep secret)
   - Database passwords
   - Admin tokens

3. **After adding variables**:
   - Variables take effect on new deployments
   - Existing deployments keep old values
   - You must redeploy or push to git to activate
   - `git push` → Vercel auto-deploys with new env vars

---

## Verification

After adding env vars and redeploying:

1. Visit your Vercel production URL
2. Open browser DevTools Console
3. Type: `process.env.NEXT_PUBLIC_SUPABASE_URL`
4. Should show: `https://yktwhrjqqhlpmwrnmzly.supabase.co`

---

## Two-Database Architecture

```
LOCAL DEVELOPMENT
  ↓
.env.local with Dev Supabase
  ↓
  ├─ NEXT_PUBLIC_SUPABASE_URL=oxrykmbmsrjotmjljwjw
  └─ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_lj2...

PRODUCTION (Vercel)
  ↓
Vercel Environment Variables with Prod Supabase
  ↓
  ├─ NEXT_PUBLIC_SUPABASE_URL=yktwhrjqqhlpmwrnmzly
  └─ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_WM_...
```

Same code, different databases based on environment.
