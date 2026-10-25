# Society Management System - Complete Overview

## System Architecture & Interconnectivity

This document provides a comprehensive overview of all dashboards, features, and how they interconnect.

---

## 1. DASHBOARDS IN THE SYSTEM

### A. RESIDENT DASHBOARD (`/resident-dashboard`)
**Purpose:** Main interface for apartment residents to manage their living experience

**Tabs & Features:**
1. **Home**
   - Quick summary cards (Amount Due, Last Payment, Next Payment)
   - Quick action buttons
   - Recent announcements
   
2. **Visitors**
   - Request visitor passes
   - View visitor approval status
   - Track visitor history
   
3. **Issues** (Unified Issues Tracker)
   - Report maintenance problems
   - Track complaint status
   - View issue history
   - Status workflow: New → Assigned → In Progress → Resolved
   
4. **Financial** (Personal Bills)
   - View personal bills and payment history
   - Year-over-year comparison (2024 vs 2023)
   - Amount Due, Payment Status, Next Due Date
   - Expandable bill details with cost breakdown
   
5. **Society** (Society Financial Dashboard)
   - View entire society financial health
   - Total Collections (current year vs past year)
   - Total Outstanding for society
   - Collection rate percentage
   - Monthly collection trends
   - Expense breakdown by category
   - Separate from personal bills
   
6. **Community**
   - **Amenities Tab:** Browse bookable spaces (created by admin)
   - **Community Board Tab:** Post messages, like, reply with residents
   - **My Bookings Tab:** Track all booking requests with status
   
7. **Emergency**
   - Emergency contacts
   - Emergency alert system

---

### B. SOCIETY ADMIN DASHBOARD (`/society-admin`)
**Purpose:** Building management - control all operational aspects

**Tabs & Features:**
1. **Overview**
   - Dashboard metrics and statistics
   - Key performance indicators
   
2. **Units**
   - Manage resident units/flats
   - Unit assignment
   - Resident information
   
3. **Visitors**
   - View visitor requests from residents
   - Approve/Reject visitor passes
   - Visitor statistics
   
4. **Watchmen**
   - Manage security staff
   - Shift schedules
   - Duties assignment
   
5. **Announcements**
   - Create announcements for residents
   - Send notices to community
   - Schedule announcements
   
6. **Maintenance**
   - Manage maintenance requests from residents
   - Track maintenance costs
   - Assign maintenance tasks
   
7. **Amenities** (NEW)
   - **Create bookable spaces** with:
     - Name, description, cost, capacity, availability
   - **Manage booking requests:**
     - View pending approval requests
     - Approve/Reject bookings
     - Track payment status
     - Mark payment received from QR code
   - **View confirmed bookings**
   - **Handle cancellations and refunds**
   
8. **Financials**
   - Society income and expenses
   - Collection reports
   - Financial analytics
   
9. **Reports**
   - Generate various reports
   - Analytics and insights
   
10. **Settings**
    - Configure society parameters
    - General settings

---

### C. SUPERADMIN DASHBOARD (`/superadmin-dashboard`)
**Purpose:** Platform-level administration (manages multiple societies)

**Features:**
- Manage multiple societies
- User management across societies
- Platform-wide analytics
- System configuration

---

### D. WATCHMAN DASHBOARD (`/watchman-dashboard`)
**Purpose:** Security staff interface

**Features:**
- View assigned shifts
- Log security incidents
- Manage visitor check-ins
- Report daily activities

---

## 2. KEY DATA FLOWS & INTERCONNECTIVITY

### A. VISITOR MANAGEMENT FLOW
```
Resident Dashboard (Visitors Tab)
  ↓ Resident submits visitor request
  ↓
Society Admin Dashboard (Visitors Tab)
  ↓ Admin approves/rejects
  ↓
Resident Dashboard (notification)
```

### B. MAINTENANCE REQUEST FLOW
```
Resident Dashboard (Issues Tab)
  ↓ Resident reports issue as "Request Maintenance"
  ↓
Society Admin Dashboard (Maintenance Tab)
  ↓ Admin assigns technician, tracks progress
  ↓
Resident Dashboard (Issues status updates)
```

### C. AMENITY BOOKING FLOW
```
Resident Dashboard (Community > Amenities)
  ↓ Resident browses admin-created spaces
  ↓ Resident requests to book (selects date/time)
  ↓ Status: "Pending Approval"
  ↓
Society Admin Dashboard (Amenities Tab)
  ↓ Admin sees booking request
  ↓ Admin approves → Status: "Awaiting Payment"
  ↓
Resident Dashboard (Community > My Bookings)
  ↓ Resident sees approval + booking details
  ↓ Resident pays via QR code (external payment)
  ↓
Society Admin Dashboard (Amenities)
  ↓ Admin confirms payment received
  ↓ Changes status to "Paid/Confirmed"
  ↓
Resident Dashboard (Community > My Bookings)
  ↓ Booking shows as "Confirmed"
  ↓ Resident can still cancel for refund
```

### D. FINANCIAL INFORMATION FLOW

**Society Level (Admin Creates):**
```
Society Admin Dashboard (Financials Tab)
  ↓ Admin generates billing/collection data
  ↓ Tracks total collected, outstanding, expenses
  ↓
Resident Dashboard (Society Tab)
  ↓ Residents see aggregate society financial health
  ↓ (Completely separate from personal bills)
```

**Individual Level (Auto-Generated):**
```
Society Admin Dashboard (Financials)
  ↓ System generates monthly bills per resident
  ↓
Resident Dashboard (Financial Tab)
  ↓ Resident sees their personal bills
  ↓ Year-over-year comparison (2024 vs 2023)
  ↓ Payment history
```

### E. ANNOUNCEMENTS FLOW
```
Society Admin Dashboard (Announcements Tab)
  ↓ Admin creates announcement
  ↓
Resident Dashboard (Home Tab)
  ↓ Residents see announcement in summary
```

### F. COMMUNITY BOARD FLOW
```
Resident Dashboard (Community > Board Tab)
  ↓ Residents post messages, like, reply
  ↓ (Real-time community interaction)
```

---

## 3. DATA RELATIONSHIPS & DEPENDENCIES

### Amenities Module
- **Admin Creates:** Spaces (name, cost, availability)
- **Resident Requests:** Booking (date, time)
- **Admin Approves:** Request
- **Resident Pays:** Via QR (external)
- **Admin Confirms:** Payment → Booking confirmed
- **System Syncs:** Admin changes reflected immediately in resident view

### Financial Module
- **Two Separate Views:**
  1. Personal Financial (Resident Tab): Individual bills, personal payments
  2. Society Financial (Society Tab): Aggregate data, total collection, expenses
- **No mixing:** Personal bills ≠ Society overview
- **Year Comparison:** Each resident can see their 2024 vs 2023 trends
- **Society Trends:** Residents see society-wide collection trends

### Issues Module
- **Resident Reports:** Issue/complaint/maintenance request
- **Admin Manages:** Assignment, tracking, resolution
- **Status Updates:** Real-time sync between admin and resident view

### Visitor Module
- **Resident Requests:** Visitor pass
- **Admin Approves:** Access
- **Watchman Enforces:** Check-in/check-out
- **System Tracks:** Visitor history

---

## 4. FEATURE SUMMARY BY ROLE

### RESIDENT CAN:
- Request visitor passes
- Report issues and maintenance problems
- View personal bills and payment history
- See society financial health
- Book community amenities
- View booking status (pending/approved/paid/confirmed)
- Post on community board
- Track year-over-year financial comparison
- Access emergency contacts

### SOCIETY ADMIN CAN:
- Manage visitor approvals
- Track maintenance requests
- Create bookable amenities with cost
- Approve/reject booking requests
- Confirm payment received from residents
- Generate announcements
- Create unit assignments
- Track society financials
- Generate reports

### WATCHMAN CAN:
- View shift schedules
- Log security incidents
- Manage visitor check-ins
- Report daily activities

### SUPERADMIN CAN:
- Manage multiple societies
- User management
- Platform-wide analytics

---

## 5. INTERCONNECTED SYSTEMS

### Payment Processing (NOT IMPLEMENTED YET)
- Resident pays via society QR code (external system)
- Admin marks payment received in Amenities/Financials
- System updates resident view automatically

### Notification System (BUILT IN)
- Amenity booking approval → Resident notified
- Issue status change → Resident notified
- Visitor approval → Resident notified

### Approval Workflows
- Visitor Request → Admin Approval
- Maintenance Request → Admin Assignment
- Amenity Booking → Admin Approval → Payment Confirmation

---

## 6. CURRENT SYSTEM STATUS

✓ **COMPLETED:**
- All dashboards created
- Visitor management system
- Issue tracking (unified)
- Personal financial management with year comparison
- Society financial dashboard (separate view)
- Community board with amenity booking
- Announcements system
- Admin amenities management

🔄 **PARTIALLY COMPLETE:**
- Payment integration (manual confirmation for now)
- Notification system (basic alerts)

❌ **NOT YET IMPLEMENTED:**
- Real database integration (currently using mock data)
- User authentication system
- Email notifications
- Real payment gateway integration
- SMS alerts

---

## 7. DESIGN APPROACH

- **Resident Dashboard:** Focus on simplicity and essentials (what residents need to do)
- **Admin Dashboard:** Comprehensive management and control
- **Mobile Responsive:** All dashboards optimized for mobile devices
- **Consistent UX:** Similar patterns across dashboards
- **Data Segregation:** Personal data separate from aggregate data
- **Clear Workflows:** Multi-step processes have clear status indicators

---

## 8. FUTURE ENHANCEMENTS

1. Database integration for persistent data
2. User authentication and role-based access
3. Real payment gateway (Stripe, UPI, etc.)
4. Email and SMS notifications
5. Advanced analytics and reporting
6. Mobile app version
7. Chatbot support
8. Integration with accounting software
9. Document storage and sharing
10. Compliance reporting

---

