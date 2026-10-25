# Financial System Architecture - APPROVED & FOCUSED

## Vision
Build a comprehensive financial management system on a dedicated **Finances page** with property-linked income/expenses and admin-managed amenity bookings.

## Core Requirements (CONFIRMED)

### 1. Property Linking
- ALL income/expense records MUST be linked to a property
- No society-wide generic transactions
- Financial data stays on Finances page only (not integrated into Properties page)

### 2. Amenity System
Admin creates and manages amenities:
- **Amenity Details**: Name, Timing (hours), Price
- **CRUD Operations**: Create, Read, Update, Delete amenities
- **Scheduling**: Calendar view showing who booked when
- **No defaults** - Admin creates everything from scratch

Resident booking flow:
1. Residents browse and book amenities on their dashboard
2. Admin reviews and approves bookings on Finances page
3. Payment collected after approval
4. Calendar updated in real-time

### 3. Page Structure
- **Single Finances Page** for all financial operations
- Residents see NO financial data in their dashboard
- Admin has complete financial control and visibility
- All reports, bookings, income/expense on one page

### 4. Transaction Types (NO Recurring)
- **Income Recording**: Property-linked (Maintenance/Amenity/Other)
- **Expense Recording**: Property-linked (Maintenance/Utility/Staff/Other)
- **No recurring setups**, no templates, no approvals for expenses
- Simple one-time transaction recording

### 5. Data Handling
- **Phase 1: Frontend ONLY** - Build beautiful UI/UX
- **Phase 2: Backend** - Connect to database once UI is approved
- No LocalStorage worries in Phase 1
- Mock data for testing UI

## Frontend Implementation Roadmap

### Phase 1A: Page Setup (1 hour)
1. Rename Payment page → Finances page
2. Create page layout matching DashboardMobile pattern
3. Sticky header with title, search, filters
4. Tab navigation (Overview/Amenities/Income/Expenses/Bookings)
5. Test layout without data

### Phase 1B: Amenity Management (2 hours)
1. Amenity list view with Edit/Delete buttons
2. Add Amenity modal form:
   - Name input
   - Timing (hour format, e.g., 8AM-10PM)
   - Price input
   - Status toggle
3. Amenity cards showing details with action buttons
4. Mock amenity data for testing

### Phase 1C: Amenity Booking Calendar (2 hours)
1. Calendar view of amenity bookings
2. Show booked slots by property
3. Approval toggle (pending → approved)
4. Payment status indicator
5. Delete/cancel booking option
6. Mock booking data for testing

### Phase 1D: Income/Expense Recording (2 hours)
1. Income recording form:
   - Property selector dropdown
   - Income type (Maintenance/Amenity/Other)
   - Amount input
   - Date picker
   - Description
   - Payment method (Cash/Cheque/UPI/Bank Transfer)
2. Expense recording form:
   - Property selector dropdown
   - Expense type (Maintenance/Utility/Staff/Other)
   - Amount input
   - Date picker
   - Vendor name
   - Bill reference
3. Transaction list view with filters

### Phase 1E: Financial Dashboard (1.5 hours)
1. Overview cards:
   - Total Income (this month)
   - Total Expenses (this month)
   - Net Balance
   - Outstanding balances by property
2. Charts:
   - Income vs Expenses trend
   - Income by type
   - Expenses by property
3. Recent transactions list
4. Property-wise financial summary table

### Phase 1F: Amenity Booking Management (1 hour)
1. Pending bookings list (needs approval)
2. Approved bookings list
3. Quick approval/reject buttons
4. Bulk payment collection toggle
5. Booking status indicators

**Total Phase 1 Time: ~9.5 hours for complete frontend UI**

## Data Models (For Mock Data)

```typescript
// Amenity
interface Amenity {
  id: string
  name: string  // "Community Hall", "Gym", "Pool"
  timing: string  // "8AM - 10PM" or "24/7"
  price: number  // ₹500, ₹1000, etc.
  status: 'active' | 'inactive'
  createdAt: string
}

// Amenity Booking
interface AmenityBooking {
  id: string
  amenityId: string
  propertyId: string  // Which property booked
  propertyUnit: string  // "A-101" for display
  bookingDate: string  // Date of booking
  timeSlot: string  // "2PM - 4PM"
  amount: number
  status: 'pending' | 'approved' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid'
  approvedBy?: string
  bookedAt: string
}

// Income Record
interface IncomeRecord {
  id: string
  propertyId: string
  propertyUnit: string  // "A-101"
  incomeType: 'maintenance' | 'amenity' | 'other'
  amount: number
  date: string
  description: string
  paymentMethod: 'cash' | 'cheque' | 'upi' | 'bank-transfer'
  createdAt: string
}

// Expense Record
interface ExpenseRecord {
  id: string
  propertyId: string
  propertyUnit: string  // "A-101"
  expenseType: 'maintenance' | 'utility' | 'staff' | 'other'
  amount: number
  date: string
  description: string
  vendor?: string
  billReference?: string
  createdAt: string
}
```

## Finances Page Layout

```
┌──────────────────────────────────────────────┐
│ Finances              [Search] [Filter]      │  Sticky Header
└──────────────────────────────────────────────┘

SCROLLABLE CONTENT
┌──────────────────────────────────────────────┐
│ [Overview] [Amenities] [Income] [Expenses]   │  Tabs
│ [Bookings] [Reports]                         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ OVERVIEW TAB                                  │
│ ┌──────┬──────┬──────┬──────┐               │
│ │Total │Total │ Net  │Out-  │ Stats Cards  │
│ │Income│Exp   │Profit│stand │               │
│ └──────┴──────┴──────┴──────┘               │
│                                              │
│ [Income vs Expense Chart]                    │
│ [Recent Transactions]                        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ AMENITIES TAB                                │
│ [+ Add Amenity Button]                       │
│                                              │
│ [Amenity Card 1] [Amenity Card 2]           │
│ Name, Timing, Price                         │
│ [Edit] [Delete]                             │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ BOOKINGS TAB                                 │
│ [Calendar View of Bookings]                  │
│                                              │
│ Amenity: [Selector]                         │
│ Month/Year: [Date Picker]                    │
│                                              │
│ [Calendar Grid with booked slots]            │
│ Click to approve/reject/collect payment     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ INCOME TAB                                   │
│ [+ Record Income Button]                     │
│ [Filter by Property/Type/Date]               │
│                                              │
│ [Income Records List]                        │
│ [Property] [Type] [Amount] [Date] [Method]   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ EXPENSES TAB                                 │
│ [+ Record Expense Button]                    │
│ [Filter by Property/Type/Date]               │
│                                              │
│ [Expense Records List]                       │
│ [Property] [Type] [Amount] [Date] [Vendor]   │
└──────────────────────────────────────────────┘
```

## UI Components Needed

1. **Amenity Management**
   - Amenity card component
   - Add/Edit amenity modal form
   - Amenity list with actions

2. **Booking Management**
   - Calendar component
   - Booking card component
   - Approval toggle
   - Quick payment collection button

3. **Transaction Management**
   - Income/Expense form modal
   - Transaction list component
   - Filters (Property, Type, Date range)

4. **Financial Dashboard**
   - Stats cards (Income, Expenses, Balance, Outstanding)
   - Charts (Income vs Expense, by type, by property)
   - Transaction history list

5. **Reports Section**
   - Financial summary table (by property)
   - Export/Print options

## Design System

Following established patterns:
- Use DashboardMobile layout as reference
- Consistent spacing (`space-y-6` between sections)
- Full-width sticky header with search
- Tab navigation
- Card-based layouts
- Purple as primary color
- Icons for visual clarity

## Next Steps

1. ✅ Brainstorm & Architecture (DONE)
2. → **Build Finances page layout** (with tabs)
3. → **Build Amenity CRUD** (Create/Read/Update/Delete)
4. → **Build Booking calendar** (with approvals)
5. → **Build Income/Expense recording**
6. → **Build Financial dashboard**
7. → **Test with mock data**
8. → **Transition to backend (Phase 2)**

Ready to start development?
