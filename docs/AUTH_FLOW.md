# Authentication & Authorization System

## Overview
Unified JWT-based authentication system that protects all dashboards and prevents cross-society access.

## Key Features
- **JWT Tokens**: No expiry (persistent sessions until logout)
- **Society Context**: `societyId` embedded in token to prevent cross-society access
- **Three User Types**: Resident, Watchman, Admin (Society Admin)
- **Route Protection**: Middleware validates auth and society context
- **Token Storage**: localStorage for client-side, tokens passed in Authorization header for API calls

## Auth Flow

### 1. Login Flow
```
User → /[societyName]/[userType]/login (e.g., /mycompound/resident/login)
  ↓
User enters credentials
  ↓
POST /api/auth/login {email, password, role, societyId}
  ↓
Server validates credentials in appropriate table (residents, watchmen, society_admins)
  ↓
Server creates JWT with payload: {userId, email, role, societyId, iat}
  ↓
Client receives token, stores in localStorage via setAuthToken()
  ↓
Client redirects to /[societyName]/[userType]/dashboard
```

### 2. Access Protected Dashboard
```
Client navigates to /[societyName]/[userType]/dashboard
  ↓
Middleware checks if route requires auth
  ↓
Middleware verifies JWT token and role matches userType
  ↓
Dashboard component uses ProtectedRoute wrapper
  ↓
useAuth() hook reads token from localStorage, decodes it
  ↓
useAuth() validates societyId context matches URL
  ↓
Dashboard renders if all checks pass
```

### 3. Cross-Society Protection
```
Token contains: {userId, email, role, societyId, iat}

When user tries to access /anothercompound/resident/dashboard:
  ↓
Middleware verifies token
  ↓
Client-side useAuth() can validate societyId (server-side done in middleware)
  ↓
Access blocked - user must logout and login to correct society
```

### 4. Logout Flow
```
User clicks Logout
  ↓
Client calls useAuth().logout()
  ↓
localStorage.removeItem('auth_token')
  ↓
POST /api/auth/logout (optional, for server cleanup)
  ↓
Redirect to /[societyName]/[userType]/login
```

## Implementation Guide

### For Login Pages
Use the `useLoginHandler` hook from `@/components/AuthLogin`:

```tsx
'use client'

import { useLoginHandler } from '@/components/AuthLogin'
import { useParams } from 'next/navigation'

export default function ResidentLoginPage() {
  const params = useParams()
  const societyId = params?.societyId as string
  
  const { handleLogin, isLoading, error } = useLoginHandler({
    userType: 'resident',
  })

  const onSubmit = (email: string, password: string) => {
    handleLogin(email, password, societyId)
  }

  return (
    // Your login form that calls onSubmit
  )
}
```

### For Protected Dashboards
Wrap dashboard with `ProtectedRoute` component:

```tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import ResidentDashboard from '@/components/ResidentDashboard'

export default function ResidentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['resident']}>
      <ResidentDashboard />
    </ProtectedRoute>
  )
}
```

### For Logout
Use the `useAuth()` hook:

```tsx
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <button onClick={logout}>
      Logout ({user?.email})
    </button>
  )
}
```

## Files Modified/Created

### New Files
- `/hooks/useAuth.ts` - Client-side auth state management
- `/components/ProtectedRoute.tsx` - Dashboard protection wrapper
- `/components/AuthLogin.tsx` - Login handler helper
- `/app/api/auth/logout/route.ts` - Logout endpoint

### Modified Files
- `/lib/auth.ts` - Removed token expiry (no exp field)
- `/middleware.ts` - Enhanced with JWT validation and society context checking
- `/app/api/auth/login/route.ts` - Returns token in response

## Environment Variables Required
```
JWT_SECRET=your-secret-key-here
NODE_ENV=production|development
```

## Security Considerations
1. **Server-side validation**: Always validate societyId and role on API endpoints
2. **Token in headers**: Pass token in Authorization header for API calls, localStorage for browser state
3. **Cross-origin**: Ensure CORS is properly configured if frontend and backend are different domains
4. **HTTPS only**: In production, always use HTTPS and set secure cookies
5. **Token refresh**: Currently no refresh logic - tokens persist until logout or localStorage is cleared

## Testing the Auth System

### Test Cross-Society Prevention
1. Login as resident to Society A: `/societyA/resident/login`
2. Get token, decode it
3. Try accessing `/societyB/resident/dashboard` with same token
4. Middleware should reject with role/society mismatch

### Test Role-Based Access
1. Login as resident (token has role: 'resident')
2. Try accessing admin dashboard with resident token
3. ProtectedRoute component should block with Access Denied message
