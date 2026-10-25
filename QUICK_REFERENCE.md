# Quick Reference Guide - System Synchronization

## 🎯 The Problem vs Solution

### ❌ BEFORE (Current State)
```
Frontend                          Backend                    Database
│                                │                         │
├─ Mock bills hardcoded           │                         │
├─ Mock complaints hardcoded       │                         │
├─ Mock visitors hardcoded         │                         │
└─ When data changes → UI updates, but:
   - No API calls
   - No database updates
   - Other dashboards don't see changes
   - No persistence
   - Reset on page reload

Result: Everything broken and out of sync ❌
```

### ✅ AFTER (Target State)
```
Frontend                      API                      Database
│                           │                        │
├─ Fetches data via hooks    │                        │
│                             ├─ Validates auth       │
│ useMyBills()  →  GET /api/bills      → Query table │
│ Display in UI              ├─ Checks permission    │
│                             ├─ Validates input      │
│ User updates   →  PUT /api/bills      → Update DB  │
│ UI shows new data ←────────── Returns updated data │
│                             └─ Sends JSON response  │
│                                                     │
│◄────────────────────────────────────────────────────│
  All dashboards stay synced

Result: Everything works and stays in sync ✅
```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                 THREE LAYERS                            │
└─────────────────────────────────────────────────────────┘

LAYER 1: FRONTEND (React Components)
┌────────────────────────────────────────┐
│ Resident Dashboard                     │
│ ├─ Shows: Bills, Complaints, Visitors │
│ └─ Fetches data via hooks              │
├────────────────────────────────────────┤
│ Admin Dashboard                        │
│ ├─ Shows: Properties, Residents, Bills│
│ └─ Fetches data via hooks              │
├────────────────────────────────────────┤
│ Watchman Dashboard                     │
│ ├─ Shows: Today's Visitors             │
│ └─ Fetches data via hooks              │
└────────────────────────────────────────┘
         ↓ API Calls (Fetch)
┌────────────────────────────────────────┐
LAYER 2: API (Next.js Route Handlers)
├─ /api/properties                       │
├─ /api/maintenance-bills                │
├─ /api/complaints                       │
├─ /api/visitor-logs                     │
├─ /api/announcements                    │
└─ All with: Auth ✓ Validation ✓ DB Query
└────────────────────────────────────────┘
         ↓ Database Query
┌────────────────────────────────────────┐
LAYER 3: DATABASE (Supabase PostgreSQL)
├─ societies                             │
├─ residents, admins, watchmen           │
├─ properties                            │
├─ maintenance_bills                     │
├─ complaints                            │
├─ visitor_logs                          │
└─ announcements                         │
└────────────────────────────────────────┘
```

---

## 📊 Implementation Status

### ✅ Already Built
```
✅ Societies CRUD
✅ Users (Residents, Admins, Watchmen) CRUD  
✅ Authentication (login for all user types)
✅ Database layer (lib/db.ts)
✅ Validation layer (lib/validation.ts)
✅ API response utils
```

### ❌ TO BUILD (Priority Order)

**WEEK 1: Foundation**
```
1. Extend types: Property, Bill, Complaint, Visitor, Announcement
2. Extend validation: validators for new types
3. Extend DB layer: methods for new entities
4. Create /api/properties endpoint
5. Create /api/maintenance-bills endpoint
6. Create /api/complaints endpoint
7. Create /api/visitor-logs endpoint
```

**WEEK 2: Integration**
```
8. Create frontend hooks (useApi, useBills, etc.)
9. Update Resident Dashboard to use real API
10. Update Admin Dashboard to use real API
11. Update Watchman Dashboard to use real API
12. Test all flows end-to-end
```

---

## 🔑 Files to Create/Modify

### EXTEND (Add to existing files)
```
lib/types.ts
  + Property interface
  + MaintenanceBill interface
  + Complaint interface
  + VisitorLog interface
  + Announcement interface

lib/validation.ts
  + validatePropertyInput()
  + validateBillInput()
  + validateComplaintInput()
  + validateVisitorLogInput()

lib/db.ts
  + createProperty(), getProperties(), etc.
  + createBill(), getBills(), etc.
  + createComplaint(), getComplaints(), etc.
  + createVisitorLog(), getVisitorLogs(), etc.
```

### CREATE (New files)
```
app/api/properties/route.ts
app/api/maintenance-bills/route.ts
app/api/complaints/route.ts
app/api/visitor-logs/route.ts

hooks/useApi.ts
hooks/useBills.ts
hooks/useComplaints.ts
hooks/useVisitors.ts
```

### UPDATE (Modify existing dashboards)
```
app/resident-dashboard/page.tsx
  - Remove: mock data
  + Add: useMyBills(), useMyComplaints(), useMyVisitors()

app/society-admin/page.tsx
  - Remove: mock data
  + Add: useProperties(), useBills(), useComplaints()

app/watchman-dashboard/page.tsx
  - Remove: mock data
  + Add: useVisitors()
```

---

## 📋 API Endpoints Reference

### Authentication (✅ Done)
```
POST /api/auth/admin-login
POST /api/auth/resident-login
POST /api/auth/watchman-login
```

### TO BUILD: Properties (❌)
```
POST   /api/properties              Create property
GET    /api/properties              List all for society
PUT    /api/properties/{id}         Update property
```

### TO BUILD: Bills (❌)
```
POST   /api/maintenance-bills       Create bill
GET    /api/maintenance-bills       List bills
PUT    /api/maintenance-bills/{id}  Update bill (payment)
```

### TO BUILD: Complaints (❌)
```
POST   /api/complaints              Create complaint
GET    /api/complaints              List complaints
PUT    /api/complaints/{id}         Update status
```

### TO BUILD: Visitors (❌)
```
POST   /api/visitor-logs            Request visitor entry
GET    /api/visitor-logs            List visitor logs
PUT    /api/visitor-logs/{id}       Approve/Reject/Checkin/Checkout
```

---

## 🔐 Authorization Rules

### Access Control Matrix

```
┌──────────────┬──────────────────┬───────────────────────────────┐
│ User Type    │ Can Access       │ Cannot Access                 │
├──────────────┼──────────────────┼───────────────────────────────┤
│ RESIDENT     │ Own bills        │ Other residents' bills        │
│              │ Own complaints   │ Other residents' data         │
│              │ Own visitors     │ Admin functions               │
│              │ Announcements    │ Watchman data                 │
├──────────────┼──────────────────┼───────────────────────────────┤
│ SOCIETY ADMIN│ All residents    │ Other societies' data         │
│              │ All bills        │ SuperAdmin functions          │
│              │ All properties   │ System-wide data              │
│              │ All complaints   │                               │
│              │ All visitors     │                               │
│              │ Create announce  │                               │
├──────────────┼──────────────────┼───────────────────────────────┤
│ WATCHMAN     │ View residents   │ Cannot modify anything        │
│              │ View bills       │ Cannot create complaints      │
│              │ View properties  │ Cannot delete anything        │
│              │ View visitors    │ Read-only access              │
│              │ Create visitor   │                               │
│              │ Check-in/out     │                               │
└──────────────┴──────────────────┴───────────────────────────────┘
```

### Implementation Pattern
```typescript
// Every API route MUST check:
const userType = request.headers.get('x-user-type')
const userId = request.headers.get('x-user-id')
const societyId = request.headers.get('x-society-id')

// Then verify permissions:
if (!userId || !societyId) return 401 Unauthorized
if (userType === 'resident' && residentId !== userId) return 403 Forbidden
if (userType === 'admin' && adminSocietyId !== societyId) return 403 Forbidden
```

---

## 🔄 Data Flow Templates

### CREATE Flow
```
User → Form → Submit
    ↓
POST /api/resource
├─ Validate auth ✓
├─ Validate authorization ✓
├─ Validate input ✓
└─ INSERT into database
    ↓
Return success + created object
    ↓
Frontend updates UI
```

### READ Flow
```
Component mounts
    ↓
useResource() called
    ↓
GET /api/resource?filter=value
├─ Validate auth ✓
├─ Check authorization ✓
└─ SELECT from database
    ↓
Return array of items
    ↓
Frontend setState
    ↓
Render UI with data
```

### UPDATE Flow
```
User modifies field → Click Save
    ↓
PUT /api/resource/{id}
├─ Validate auth ✓
├─ Check authorization ✓
├─ Validate new data ✓
└─ UPDATE database
    ↓
Return updated object
    ↓
Frontend updates state
    ↓
UI shows new value
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: No Authorization Checks
```
WRONG: GET /api/bills → Returns ALL bills
RIGHT: GET /api/bills → Check if resident/admin → Return only authorized
```

### ❌ Mistake 2: Frontend Uses Mock Data
```
WRONG: const bills = [{ id: 1, amount: 6000 }, ...]
RIGHT: const { data: bills } = useMyBills(residentId)
```

### ❌ Mistake 3: No Validation
```
WRONG: const bill = body
RIGHT: const bill = validateBillInput(body)
```

### ❌ Mistake 4: UI Doesn't Refresh After Update
```
WRONG: User pays bill → No UI update
RIGHT: User pays bill → refetch() → UI updates
```

### ❌ Mistake 5: No Error Handling
```
WRONG: const data = fetch(url)
RIGHT: try { data = fetch(url) } catch { showError() }
```

---

## ✅ Implementation Checklist

### Phase 1: Types & Validation (Day 1)
- [ ] Add Property, Bill, Complaint, Visitor types to lib/types.ts
- [ ] Add validators to lib/validation.ts
- [ ] Add DB methods to lib/db.ts

### Phase 2: API Routes (Days 2-3)
- [ ] Create /api/properties/route.ts
- [ ] Create /api/maintenance-bills/route.ts
- [ ] Create /api/complaints/route.ts
- [ ] Create /api/visitor-logs/route.ts
- [ ] Test each with Postman

### Phase 3: Frontend Hooks (Day 4)
- [ ] Create hooks/useApi.ts
- [ ] Create hooks/useBills.ts
- [ ] Create hooks/useComplaints.ts
- [ ] Create hooks/useVisitors.ts

### Phase 4: Integration (Days 5-6)
- [ ] Update Resident Dashboard
- [ ] Update Admin Dashboard
- [ ] Update Watchman Dashboard
- [ ] Test end-to-end flows

### Phase 5: Testing & Polish (Days 7-8)
- [ ] Test all CRUD operations
- [ ] Test authorization
- [ ] Test error scenarios
- [ ] Performance optimization

---

## 🎯 Success Criteria

When complete, verify:
- ✅ All dashboards fetch data from API
- ✅ Creating data in one dashboard shows in others
- ✅ Authorization prevents unauthorized access
- ✅ Validation prevents invalid data
- ✅ Errors display nicely
- ✅ No console errors
- ✅ Data persists after page refresh
- ✅ System works with multiple users

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| API returns 403 | Check authorization headers (x-user-id, x-society-id, x-user-type) |
| API returns 400 | Check validation - input data format wrong |
| Frontend shows old data | Add refetch() call after mutation |
| Database returns empty | Check query filters and relationships |
| User can't access data | Verify authorization logic in API |

---

## 🚀 Next Steps

1. Read: **COMPLETE_SYSTEM_DESIGN.md** (30 min)
2. Read: **BACKEND_SYNC_STRATEGY.md** (45 min)
3. Follow: **IMPLEMENTATION_ROADMAP.md** Phase 1 (2 hours)
4. Build: Properties API (3 hours)
5. Test with Postman
6. Build frontend hook
7. Update one dashboard
8. Test end-to-end

**Total: ~1 day to get working MVP**

---

## 📚 Documentation Files Reference

- **COMPLETE_SYSTEM_DESIGN.md** - Executive summary & user journeys
- **BACKEND_SYNC_STRATEGY.md** - Technical architecture & patterns
- **IMPLEMENTATION_ROADMAP.md** - Step-by-step build plan with code
- **DATA_FLOW_DIAGRAMS.md** - Visual examples of all flows
- **SYSTEM_ARCHITECTURE.md** - Original discovery document
- **README_ARCHITECTURE.md** - Documentation index
- **QUICK_REFERENCE.md** - This file

Start with COMPLETE_SYSTEM_DESIGN.md, then follow the roadmap! 🚀
