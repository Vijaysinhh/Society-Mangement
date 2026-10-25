# Resident Management System - Data Architecture & Feature Brainstorm

## System Overview
Three integrated dashboards: **Resident Dashboard**, **Watchman Dashboard**, **Society Admin Dashboard**

---

## 1. RESIDENT DASHBOARD - Data Flows & Features

### 1.1 Data Resident Dashboard PROVIDES (Outputs)
#### To Watchman Dashboard:
- **Visitor Approvals** 
  - Approved visitor name, phone, arrival/departure time, purpose
  - Number of people, vehicle info (license plate, type)
  - Approval timestamp, expiry (same-day or recurring)
  - Auto-notify watchman when visitor is approved

- **Recurring Visitor Whitelist**
  - Regular visitors (maid, yoga trainer, etc.)
  - Frequency (daily, weekly, specific days)
  - Allowed time windows
  - Special notes/instructions

- **Unit Information**
  - Address, floor, unit number
  - Current occupancy status (home/away)
  - Emergency contact

#### To Society Admin Dashboard:
- **Visitor Activity Log** (for analytics/security)
  - Total visitors approved by unit
  - Visitor frequency patterns
  - Approval/rejection history
  - Any flagged or problematic visitors

- **Profile Information** (for admin records)
  - Resident name, contact, family size
  - Lease/ownership details
  - Preferred communication method

- **Complaint/Ticket Data**
  - Issues raised, priority, status
  - Maintenance requests
  - Payment of related fees

- **Payment Information**
  - Bill payment history
  - Outstanding dues
  - Payment methods used

- **Activity Status**
  - When resident is active/online
  - Dashboard login activity

### 1.2 Data Resident Dashboard NEEDS (Inputs)

#### From Watchman Dashboard:
- **Visitor Arrival Notification**
  - Real-time: "Rajesh (Maid) has arrived at gate"
  - Allow quick approve/reject decision
  - Show visitor details: identity verification status, approval request time

- **Visitor Departure Notification**
  - "Rajesh left at 2:30 PM"
  - Actual time vs approved time tracking
  - Alert if visitor overstayed

- **Building/Security Alerts**
  - Unusual activity near their unit (door access, etc.)
  - Security incidents affecting their area
  - Emergency alerts (fire, water issue, etc.)
  - Break-in attempts or suspicious persons

- **Watchman Status**
  - Current watchman on duty
  - Shift timing
  - Contact info for emergencies

- **Community Announcements**
  - Maintenance schedules affecting their unit
  - Water shutdown, power cuts
  - Important society updates

#### From Society Admin Dashboard:
- **Bill Information**
  - Monthly bill breakdown (maintenance, water, electricity)
  - Due date, late fees
  - Payment reminder notifications
  - Receipt/payment confirmation

- **Maintenance & Complaints Status**
  - Status updates on their requests
  - Estimated completion time
  - Assigned staff/contractor info
  - Photo evidence of completion

- **Rules & Regulations**
  - Updated house rules
  - Visitor policy changes
  - Parking rules
  - Noise complaints/warnings

- **Administrative Messages**
  - General announcements
  - Society meetings
  - Event invitations
  - Important notices

- **Historical Data**
  - Past visitor activity (for context)
  - Complaint history
  - Payment history
  - Maintenance records

### 1.3 Features Resident Dashboard Must Provide

#### Core Features:
- Visitor approval/rejection with real-time watchman sync
- Recurring visitor management with whitelist
- Visitor history with search, filter, date range
- Notification preferences (SMS, email, push)
- Payment tracking and bill payment gateway
- Complaint/ticket submission with photo attachments
- Maintenance request with description and photos
- Profile management with family details
- Emergency contacts and preferences
- Document storage (lease, agreements)

---

## 2. WATCHMAN DASHBOARD - Data Flows & Features

### 2.1 Data Watchman Dashboard PROVIDES (Outputs)

#### To Resident Dashboard:
- **Visitor Arrival Notification**
  - Visitor name, time, vehicle number, ID proof verification
  - Photo of visitor
  - Alert status: verified/awaiting approval/rejected

- **Visitor Departure Notification**
  - Actual departure time
  - Duration of visit
  - Any incidents during visit

- **Building Security Status**
  - Unusual activities, suspicious persons
  - Security breaches, attempted unauthorized access
  - Fire/emergency incidents
  - Door/gate access logs

- **Shift Information**
  - Current watchman on duty
  - Shift timing
  - Availability for emergencies

#### To Society Admin Dashboard:
- **Daily Activity Log**
  - All visitors who entered/exited building
  - Time in, time out
  - Unit visited
  - Purpose (approved by resident)
  - Vehicle info (if applicable)
  - ID verification status

- **Security Incidents**
  - Any suspicious activity
  - Theft attempts, break-ins
  - Gate/lock issues
  - Unauthorized access attempts
  - Complaints from residents about security

- **Attendance & Duty Log**
  - Check-in/check-out times
  - Shift completion
  - Approved leave
  - Late arrivals/early departures
  - Incidents during shift

- **Infrastructure Issues**
  - Gate/lock malfunction
  - CCTV camera issues
  - Lighting problems
  - Structural issues observed

- **Resident Issues**
  - Noise complaints
  - Parking violations
  - Garbage disposal issues
  - Any resident concerns raised with watchman

### 2.2 Data Watchman Dashboard NEEDS (Inputs)

#### From Resident Dashboard:
- **Approved Visitor List** (Real-time)
  - Push notification when resident approves visitor
  - Visitor name, phone, unit number
  - Approval time window
  - Expiry (same-day or recurring)
  - Purpose of visit
  - Number of people expected
  - Vehicle info (if applicable)
  - Special instructions from resident

- **Recurring Visitor Whitelist**
  - Auto-approved visitors (maid, yoga trainer, etc.)
  - Schedule (what days/times they come)
  - No need for approval notification
  - But log entry needed

- **Unit Resident Status**
  - Which residents are home/away
  - Occupancy information
  - Expected arrivals/departures

- **Emergency/Blocked Visitors**
  - Blocked visitor list (abusive, threatening, etc.)
  - Alert watchman immediately if tries to enter
  - Police cases or restraining orders

- **Special Instructions**
  - Visitor handling preferences (no access to certain areas)
  - Sensitive packages (deliver directly)
  - Specific identification requirements

#### From Society Admin Dashboard:
- **Staff Duty Roster**
  - Today's shift assignment
  - Shift timing
  - Assigned gate/area
  - Special instructions for day

- **Rules & Procedures**
  - Updated security procedures
  - Gate operation rules
  - Visitor handling guidelines
  - Emergency response procedures

- **Building Information**
  - Unit numbers and resident names
  - New units, vacant units
  - Construction/maintenance work happening
  - Restricted areas

- **Alerts & Announcements**
  - Security alerts (missing person, theft in area)
  - Emergency procedures
  - VIP visits
  - Special events requiring extra security

- **Admin Instructions**
  - Task assignments
  - Additional duties
  - Investigation requests

### 2.3 Features Watchman Dashboard Must Provide

#### Core Features:
- Visitor entry/exit logging with timestamp and photos
- Real-time display of approved visitors and whitelist
- Quick visitor approval/rejection decision interface
- ID verification photo capture and storage
- Vehicle number and type logging
- Shift check-in/check-out with timestamp
- Daily duty report submission
- Incident/issue logging with photos and description
- Emergency alert system to send to admin/residents
- Resident lookup by unit number
- Recurring visitor auto-pass (whitelist)
- Blocked visitor alert system
- Communication system to contact residents (call/message)
- Daily activity summary report
- Leave request and approval workflow

---

## 3. SOCIETY ADMIN DASHBOARD - Data Flows & Features

### 3.1 Data Society Admin Dashboard PROVIDES (Outputs)

#### To Resident Dashboard:
- **Bills & Payment Information**
  - Monthly bills (maintenance, water, utilities)
  - Breakdown of charges
  - Due dates and payment methods
  - Late payment fees
  - Payment confirmation and receipts

- **Maintenance & Service Updates**
  - Status of maintenance requests
  - Assigned staff/contractor information
  - Estimated completion time
  - Photos of work completed
  - Invoice for paid services

- **Announcements & Notices**
  - Maintenance schedules
  - Building closures or restrictions
  - Event invitations
  - Rule changes
  - General updates

- **Community Information**
  - Facility availability (gym, parking, etc.)
  - Staff contact information
  - Emergency procedures
  - Important documents

#### To Watchman Dashboard:
- **Duty Roster & Assignments**
  - Today's shift assignment
  - Shift timing
  - Gate/area assignment
  - Special instructions

- **Building Information**
  - Complete unit resident mapping
  - Occupancy status (occupied/vacant/for-rent)
  - Emergency contact for each unit
  - Any construction/maintenance in progress

- **Security Instructions**
  - Updated security procedures
  - VIP visits or special events
  - Security alerts or investigations
  - Restricted area information

- **Resident Information**
  - Updated resident contact list
  - New residents
  - Departed residents
  - Lease/ownership details

- **Alerts & Instructions**
  - Emergency procedures
  - Weather alerts
  - Urgent maintenance issues
  - Security threats

### 3.2 Data Society Admin Dashboard NEEDS (Inputs)

#### From Resident Dashboard:
- **Visitor Activity Analytics**
  - Total visitors per unit (monthly/yearly)
  - Visitor frequency patterns
  - Approval/rejection rates
  - Any recurring security issues
  - Flagged visitors or suspicious activity

- **Resident Information**
  - Profile data (name, contact, family size)
  - Unit details and lease information
  - Occupancy status
  - Online activity/last login

- **Financial Data**
  - Bill payment history
  - Outstanding dues
  - Payment patterns
  - Late payers
  - Dispute history

- **Complaints & Maintenance Requests**
  - All issues raised by residents
  - Priority and severity
  - Status of resolution
  - Time to resolution
  - Resident satisfaction rating

- **Rule Violations**
  - Complaints about noisy residents
  - Parking violations
  - Unauthorized guests
  - Policy breaches

#### From Watchman Dashboard:
- **Daily Activity Report**
  - All visitors who entered/exited
  - Entry/exit times
  - Vehicle information
  - ID verification status
  - Flags or issues noted

- **Security Incidents**
  - Suspicious activity reported
  - Theft attempts or break-ins
  - Unauthorized access attempts
  - Property damage
  - Emergency situations

- **Attendance & Performance**
  - Watchman check-in/check-out logs
  - Shift completion status
  - Late arrivals or absences
  - Leave requests
  - Performance notes

- **Infrastructure & Maintenance Issues**
  - Reported gate/lock malfunctions
  - CCTV camera issues
  - Lighting problems
  - Security system malfunctions
  - Structural issues

- **Resident Complaints via Watchman**
  - Issues reported directly to watchman
  - Noise complaints
  - Parking violations
  - Maintenance urgencies
  - Safety concerns

### 3.3 Features Society Admin Dashboard Must Provide

#### Core Features:
- Resident management (view, edit, deactivate, add new)
- Unit management and occupancy tracking
- Financial management:
  - Bill generation and distribution
  - Payment tracking and late fees
  - Outstanding dues reports
  - Revenue reports
- Complaint and maintenance management:
  - Assign to contractors/staff
  - Track status and completion
  - Store photos/documentation
  - Generate performance reports
- Watchman/Staff management:
  - Duty roster creation
  - Attendance tracking
  - Performance evaluation
  - Leave management
  - Communication and instructions
- Visitor analytics and security:
  - Real-time visitor activity
  - Visitor frequency by unit
  - Security incident tracking
  - Blocked visitor management
- Communication hub:
  - Send announcements to residents
  - Emergency alerts
  - Bulk notifications
  - Individual messaging
- Reports and analytics:
  - Daily activity summary
  - Monthly/yearly reports
  - Visitor statistics
  - Financial reports
  - Security incidents report
  - Occupancy report
- Document management:
  - Lease agreements
  - Rules and regulations
  - Important notices
- Emergency management:
  - Emergency alert system
  - Evacuation procedures
  - Emergency contacts

---

## 4. DATA ENTITIES & RELATIONSHIPS

### Core Entities:
```
Resident
├── name, contact, email, phone
├── unit_id (FK)
├── family_size, occupancy_status
├── emergency_contact
└── profile_photo, documents

Unit
├── unit_number, floor, building
├── resident_id (FK)
├── occupancy_status (occupied/vacant/sale/rent)
└── created_date

Visitor
├── name, phone, purpose
├── resident_id (FK)
├── watchman_id (FK - who logged)
├── approval_status (pending/approved/rejected)
├── is_recurring (boolean)
└── vehicle_info, id_proof_photo

VisitorApproval
├── visitor_id (FK)
├── resident_id (FK)
├── timestamp
├── approved_time_window
├── expiry_datetime
└── notes

Watchman
├── name, phone, email
├── employee_id
├── shift_info
├── status (active/inactive)
└── contact_info

Shift
├── watchman_id (FK)
├── date, start_time, end_time
├── checkin_time, checkout_time
├── status (pending/completed/missed)
└── notes

ActivityLog
├── watchman_id (FK)
├── visitor_id (FK)
├── resident_id (FK)
├── entry_time, exit_time
├── purpose, vehicle_info
├── id_verified (boolean)
└── photos, notes

SecurityIncident
├── watchman_id (FK)
├── resident_id (FK) - optional if building-wide
├── description, severity (low/medium/high)
├── type (theft, suspicious_activity, etc.)
├── timestamp
├── photos, resolution
└── assigned_to_admin

Bill
├── resident_id (FK)
├── unit_id (FK)
├── month, amount
├── breakdown (maintenance, water, etc.)
├── due_date
├── payment_status (pending/paid/overdue)
└── payment_date

Complaint
├── resident_id (FK)
├── type (maintenance, noise, etc.)
├── description, severity
├── photos, created_date
├── assigned_to (contractor/staff)
├── status, resolved_date
└── satisfaction_rating

Notification
├── recipient_id (FK - resident/watchman/admin)
├── notification_type
├── message, is_read
├── created_date
└── action_link

BlockedVisitor
├── resident_id (FK)
├── visitor_name, phone
├── reason, created_date
└── status (active/inactive)
```

---

## 5. REAL-TIME FEATURES REQUIRED

### Push Notifications:
- Visitor approved by resident → Watchman
- Visitor arrived at gate → Resident
- Visitor departure → Resident
- Security incident detected → Admin & Residents
- Bill due → Resident
- Complaint status update → Resident
- Maintenance completed → Resident
- Emergency alert → All

### Live Updates:
- Watchman duty status
- Resident online status
- Visitor entry/exit in real-time
- Activity feed updates
- Message notifications

---

## 6. SECURITY CONSIDERATIONS

### Access Control:
- Residents: Only see their own data
- Watchman: See visitor approvals and building info
- Admin: See all data (with audit logs)

### Data Privacy:
- Encrypt sensitive data (phone, ID proof photos)
- Audit logs for all admin actions
- Data retention policies
- GDPR compliance

### Authentication:
- Role-based access control (RBAC)
- Two-factor authentication for admin
- Session management
- API token verification

---

## 7. INTEGRATION POINTS

### Between Dashboards:
- API endpoints for data sharing
- Real-time WebSocket connections for notifications
- Scheduled jobs for report generation
- Sync mechanisms for offline-first support

### External Integrations:
- SMS/Email notification service
- Payment gateway integration
- Photo storage (Vercel Blob/S3)
- Google Maps API for vehicle/guest tracking (optional)

---

## 8. NEXT STEPS FOR DEVELOPMENT

### Phase 1: Database Design
- Design and create all entities
- Set up relationships
- Create migration scripts

### Phase 2: API Development
- Visitor management endpoints
- Activity logging endpoints
- Bill management endpoints
- Notification endpoints
- Real-time WebSocket setup

### Phase 3: Dashboard Development
- Watchman Dashboard (priority: visitor logging, activity feed)
- Admin Dashboard (priority: resident management, financial)
- Enhance Resident Dashboard (integrate real notifications)

### Phase 4: Real-time Features
- Push notifications
- Live activity feeds
- Instant approval/rejection syncing

### Phase 5: Advanced Features
- Analytics and reporting
- Emergency alert system
- Mobile app considerations
