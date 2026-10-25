# PHASE 4 ADVANCED FEATURES - IMPLEMENTATION PLAN

## 4 Features to Build:

### 1. FINANCIAL DASHBOARD
**Purpose:** Residents can track bills, payments, and financial history

**Key Components:**
- Monthly bill amount display
- Payment history table (last 12 months)
- Outstanding dues with due date warnings
- Payment method on file
- Online payment integration button
- Bill breakdown (maintenance, utilities, taxes)
- Download invoice button
- Payment receipt archive

**Data Needed:**
- Bill records (monthly)
- Payment records with dates and amounts
- Invoice PDFs
- Payment methods

**API Endpoints:**
- GET /bills - list all bills
- GET /bills/{billId} - bill details with breakdown
- POST /payments - make payment
- GET /payments - payment history
- GET /invoices/{invoiceId} - download invoice

**Mock Data Locations:**
- Currently: No financial data exists in resident dashboard
- Needs: New "Financials" tab under resident dashboard

---

### 2. MAINTENANCE INSIGHTS
**Purpose:** Track maintenance requests and understand building maintenance patterns

**Key Components:**
- Maintenance request history (submitted, in-progress, completed)
- Cost tracking for each maintenance item
- Parts used and replacement dates
- Preventive maintenance recommendations
- Maintenance calendar/timeline
- Recurring issues detection
- Export maintenance report
- Warranty tracking

**Data Needed:**
- Maintenance requests with status
- Costs and labor hours
- Parts and materials used
- Contractor details
- Date completed
- Photos before/after

**API Endpoints:**
- GET /maintenance - list all requests
- POST /maintenance - create request
- PATCH /maintenance/{id} - update status
- GET /maintenance/analytics - insights and patterns
- GET /maintenance/costs - cost breakdown

**Mock Data Locations:**
- Currently: ComplaintsReporting has some maintenance data
- Needs: Separate "Maintenance" tab with enhanced tracking

---

### 3. DELEGATION TO FAMILY MEMBERS
**Purpose:** Allow multiple residents in a unit to approve visitors independently

**Key Components:**
- Add/invite family members to unit
- Set permission levels (can approve visitors, can view financials, etc)
- Approval history showing who approved what
- Delegate specific visitors to family members
- Emergency contact management
- Remove delegated access
- Activity log showing all actions by all members

**Data Needed:**
- Family members linked to unit
- Permission levels per member
- Approval actions with who approved
- Member activity log

**API Endpoints:**
- POST /family-members - add family member
- GET /family-members - list all members
- PATCH /family-members/{id} - update permissions
- DELETE /family-members/{id} - remove member
- GET /permissions - check what current user can do
- GET /activity-log - all actions by all members

**UI Components:**
- Family Members list with manage buttons
- Invite family member form
- Permission selector (checkboxes for capabilities)
- Activity audit showing "John approved visitor" vs "Sarah approved"

---

### 4. IN-APP MESSAGING
**Purpose:** Direct communication between residents, watchman, and admin within the platform

**Key Components:**
- Chat/conversation list
- Direct messages with watchman
- Group chat with all residents (opt-in)
- Admin announcements (one-way to residents)
- Message notifications
- Unread badge count
- Search messages
- Pin important messages
- Block users (for group chats)
- Message history archive

**Data Needed:**
- Message records with sender, recipient, timestamp
- Conversation threads
- User online status
- Read receipts
- Attachments (photos, documents)

**API Endpoints:**
- GET /messages - get messages for current user
- POST /messages - send message
- PATCH /messages/{id}/read - mark as read
- GET /conversations - list all conversations
- POST /conversations - start conversation
- GET /conversations/{id}/messages - get thread

**UI Components:**
- Message list with unread badges
- Message thread view (like WhatsApp)
- Message input with emoji and attachment support
- Online status indicator
- Notification for new messages
- Search bar for messages
- Conversation header with user info

---

## UI LAYOUT FOR RESIDENT DASHBOARD

Add 4 new tabs to existing resident dashboard page:

```
Resident Dashboard Tabs:
├── Home (already exists)
├── Visitors (already exists)
├── Complaints (already exists)
├── Payments (already exists)
├── Profile (already exists)
├── [NEW] Financials ← Financial Dashboard
├── [NEW] Maintenance ← Maintenance Insights
├── [NEW] Family ← Delegation to Family Members
└── [NEW] Messages ← In-App Messaging
```

---

## IMPLEMENTATION SEQUENCE

**Week 1: Financial Dashboard**
- Create new "Financials" tab component
- Add bill list table
- Add payment history
- Add invoice download button
- Add payment button (placeholder until backend ready)

**Week 2: Maintenance Insights**
- Create "Maintenance" tab component
- Add maintenance history list
- Add cost breakdown charts
- Add recurring issues detection
- Add maintenance calendar

**Week 3: Delegation to Family Members**
- Create "Family" tab component
- Add invite form
- Add family members list
- Add permission selector
- Add activity audit log

**Week 4: In-App Messaging**
- Create "Messages" tab component
- Add conversation list
- Add message thread view
- Add message input
- Add notification indicators

---

## MOCK DATA FOR TESTING

### Financial Data
```typescript
bills = [
  { id: 1, month: 'March 2024', amount: 6000, dueDate: '31-Mar', status: 'overdue', breakdown: { maintenance: 4000, water: 1500, electricity: 500 } },
  { id: 2, month: 'February 2024', amount: 5500, dueDate: '29-Feb', status: 'paid', paidDate: '28-Feb' },
  // ... 10 more months
]

payments = [
  { id: 1, month: 'February 2024', amount: 5500, paidDate: '28-Feb', method: 'Bank Transfer', receipt: 'url...' },
  // ... more payments
]
```

### Maintenance Data
```typescript
maintenance = [
  { id: 1, title: 'AC Filter Replacement', type: 'service', status: 'completed', date: '26-Mar', cost: 800, contractor: 'Cool Air Services' },
  { id: 2, title: 'Water Leak - Kitchen Sink', type: 'repair', status: 'in-progress', date: '25-Mar', cost: 1200, contractor: 'Plumber Pro' },
  // ... more maintenance requests
]
```

### Family Members Data
```typescript
familyMembers = [
  { id: 1, name: 'Rajesh Kumar', relation: 'Self', permissions: ['approve_visitors', 'view_financials', 'contact_watchman'] },
  { id: 2, name: 'Priya Kumar', relation: 'Spouse', permissions: ['approve_visitors'] },
  { id: 3, name: 'Amit Kumar', relation: 'Son', permissions: ['approve_visitors'] }
]
```

### Messages Data
```typescript
conversations = [
  { id: 1, type: 'direct', participant: { name: 'Rajesh (Watchman)', role: 'watchman' }, lastMessage: 'Visitor arrived', unread: 2 },
  { id: 2, type: 'group', name: 'Building A - Residents', participants: 12, unread: 0 },
  { id: 3, type: 'admin', participant: { name: 'Admin - Society Manager', role: 'admin' }, lastMessage: 'Maintenance alert' }
]

messages = [
  { id: 1, conversationId: 1, sender: 'Rajesh', message: 'Visitor arrived', timestamp: '10:30 AM', read: true },
  // ... more messages
]
```

---

## DECISION POINT

**Before building Phase 4, decide:**

1. Build UI-only (mock data) now → then add backend later?
2. Build with backend integration immediately?
3. Build features one-by-one or all 4 in parallel?

Which approach do you prefer?
