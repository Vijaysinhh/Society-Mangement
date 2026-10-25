# Society Admin Account Architecture - Brainstorming Discussion

## Your Proposed Model

**SuperAdmin Creates Society Admin Account (Not Personal)**
- SuperAdmin creates a general/organizational account for Society Admin Dashboard
- This is **NOT** tied to any individual person
- SuperAdmin decides WHO can be society admin and shares login credentials
- Up to 4 admin accounts per society
- Each admin also creates a SEPARATE resident account if they live in that society

---

## Architecture Breakdown

### Account Structure:

```
SuperAdmin Account (Personal - System Owner)
    ↓
Society Organization Record
    ├─ SocietyAdminDashboard Account #1 (Organizational - Shared)
    │   └─ Credentials shared with Person A
    │   └─ Credentials can be shared with Person B, C, D (rotation)
    │
    ├─ SocietyAdminDashboard Account #2 (Organizational - Shared)
    ├─ SocietyAdminDashboard Account #3 (Organizational - Shared)
    ├─ SocietyAdminDashboard Account #4 (Organizational - Shared)
    │
    └─ Resident Accounts (Personal)
        ├─ Person A Resident Account (if they live there)
        ├─ Person B Resident Account (if they live there)
        └─ ... other residents
```

### Key Differences from Previous Model:

| Previous | New Model |
|----------|-----------|
| Admin = Personal Account | Admin = Organizational Account |
| Person leaves = Admin account stuck | Person leaves = Reassign credentials to next person |
| Admin can't easily switch roles | Admin switches to resident account when needed |
| Dual login for admin-residents | Separate logins but clear purpose |
| Role transfer = Create new account | Role transfer = Share credentials with new person |

---

## Advantages of This Model

1. **Transferability**: When admin quits, just give credentials to next person
2. **Accountability**: Role is tied to position/society, not person
3. **Simplicity**: 4 admin accounts = 4 separate login pairs, clear separation
4. **Separation of Concerns**: Admin account for management, resident account for personal needs
5. **Audit Trail**: Can track which person used admin account by timestamps/actions
6. **Easy Onboarding**: SuperAdmin just creates 4 accounts, gives credentials to 4 people
7. **Easy Offboarding**: When person leaves, credentials stay with organization, give to replacement

---

## Implementation Requirements

### 1. SuperAdmin Dashboard Needs:
- Society Management (Create societies)
- Admin Account Creation (Create up to 4 admin accounts per society)
- Admin Credential Management (View/reset credentials, manage who has access)
- Admin Activity Logs (See which admin account did what action)

### 2. Society Admin Login:
- Username/Password (NOT email based, to avoid personal identification)
- Format: `SOCIETY_AdminAccount_1`, `SOCIETY_AdminAccount_2`, etc.
- Example: `GreenPark_Admin_1`, `GreenPark_Admin_2`

### 3. Resident Login (Separate):
- Personal email-based login
- Each resident still has their own account

### 4. Dashboard Navigation:
- Admin logs in → See Society Admin Dashboard
- Resident logs in → See Resident Dashboard
- If person is both, they need SEPARATE logins (not dual view like before)

### 5. Data Storage Structure:
```typescript
// SuperAdmin account (personal)
SuperAdminAccount {
  id: string
  email: string
  password: string
}

// Society organization
Society {
  id: string
  name: string
  createdBy: SuperAdminId
  createdAt: timestamp
}

// Society admin accounts (4 max, organizational)
SocietyAdminAccount {
  id: string
  societyId: string
  username: string // e.g., "GreenPark_Admin_1"
  password: string
  createdAt: timestamp
  lastUsedBy: string // Person name or identifier
  lastUsedAt: timestamp
  status: 'active' | 'inactive'
}

// Resident account (personal)
ResidentAccount {
  id: string
  email: string
  password: string
  societyId: string
  unitId: string
  familyName: string
}
```

---

## Onboarding Flow (SuperAdmin Perspective)

1. SuperAdmin creates new Society: "Green Park Society"
2. SuperAdmin creates 4 SocietyAdminAccounts:
   - `GreenPark_Admin_1`
   - `GreenPark_Admin_2`
   - `GreenPark_Admin_3`
   - `GreenPark_Admin_4`
3. SuperAdmin assigns people to accounts (through activity log):
   - Assign Person A to `GreenPark_Admin_1` (Secretary)
   - Assign Person B to `GreenPark_Admin_2` (Treasurer)
   - Assign Person C to `GreenPark_Admin_3` (Maintenance)
   - Assign Person D to `GreenPark_Admin_4` (President)
4. SuperAdmin sends credentials to each person
5. Person A (if resident) also creates separate resident account with her email
6. When Person A quits, reassign `GreenPark_Admin_1` to Person E

---

## Offboarding Flow

When Person A (secretary) quits:
1. SuperAdmin marks `GreenPark_Admin_1` as "needs reassignment"
2. SuperAdmin resets password: generates new random password
3. SuperAdmin assigns new person (Person E) to `GreenPark_Admin_1`
4. SuperAdmin sends new credentials to Person E
5. Activity log shows: "GreenPark_Admin_1 reassigned from Person A to Person E on [date]"
6. Person A's resident account (if exists) remains intact

---

## Questions to Answer

1. Should admin credentials be rotated (changed) periodically? Or only when person changes?
2. Should we track WHO logged in to admin account (manual entry by admin before login)?
3. Should admin account be limited to ONE person per time period?
4. What if person wants to stop being admin but continue as resident? (Keep both accounts active)
5. Should admin account have restricted IP or time-based access?

---

## What Gets Simplified

- No more "dual account struggle" for admin-residents
- Clear separation: Admin role = organizational, Resident role = personal
- Easy role rotation without recreating anything
- Clear audit trail of who used what admin account
- SuperAdmin can manage everything from one place

## What Gets More Complex

- Managing 4 separate credentials per society
- Need credential management dashboard (reset, rotate, revoke)
- Need to track "who is using which admin account" manually
- Two logins if person is admin AND resident

---

**Does this architecture make sense? Should we implement it?**
