# CROSS-DASHBOARD DATA FLOW & BUTTON FUNCTIONALITY AUDIT

## RESIDENT DASHBOARD DATA FLOW

### State Management
```
residentName: 'Ajay Kumar' (used for display on home, profile)
residentEmail: 'ajay.kumar@gmail.com' (user profile)
residentPhone: '+91 98765 43210' (user profile)
unitNumber: '201' (display only - not editable)
view: 'home' | 'visitors' | 'complaints' | 'tickets' | 'payments' | 'community' | 'emergency' | 'profile'
profileSection: 'overview' | 'edit' | 'password' | 'preferences' | 'visitors' | 'help'
menuOpen: boolean (header dropdown menu)
```

### Data Resident Dashboard SENDS to Other Dashboards
1. **TO WATCHMAN DASHBOARD** - When visitor is approved:
   - visitor.id, visitor.name, visitor.phone, visitor.purpose
   - Status: 'approved' (watchman sees this as pre-approved)
   - Approval timestamp
   - Unit number (which unit to guide visitor to)

2. **TO SOCIETY ADMIN DASHBOARD** - Aggregated stats only:
   - Total visitor approvals count
   - Monthly visitor statistics
   - Resident complaint logs
   - Maintenance requests
   - Payment records

### Data Resident Dashboard RECEIVES from Other Dashboards
1. **FROM WATCHMAN DASHBOARD**:
   - Pending visitor logs (visitor name, phone, purpose, vehicle, timestamp)
   - Visitor photos captured at gate
   - Security incidents/alerts
   - Watchman on-duty status

2. **FROM SOCIETY ADMIN DASHBOARD**:
   - Announcements and notices
   - Maintenance updates
   - Bill/payment information
   - Complaint resolution updates
   - Community events

---

## WATCHMAN DASHBOARD DATA FLOW

### State Management
```
view: 'home' | 'log' | 'approvals' | 'history' | 'blacklist' | 'incidents' | 'emergency' | 'parcels'
formData: {
  visitorName, phone, unit, purpose, vehicleNumber, vehicleColor, 
  numberOfPeople, expectedDeparture, additionalInfo, photo
}
visitorsLogged: [] (all visitor entries)
incidentsReported: [] (security incidents)
emergencyAlerts: [] (emergency logs)
```

### Data Watchman Dashboard SENDS to Other Dashboards
1. **TO RESIDENT DASHBOARD** - Real-time visitor entry:
   - New visitor arrival notification
   - Visitor photo (base64 encoded)
   - Visitor details: name, phone, purpose, vehicle info
   - Expected arrival/departure time
   - "PENDING APPROVAL" status
   
2. **TO SOCIETY ADMIN DASHBOARD**:
   - Daily visitor log (aggregated counts, no resident names)
   - Incident reports with photos
   - Emergency alerts
   - Duty log and attendance

### Data Watchman Dashboard RECEIVES from Other Dashboards
1. **FROM RESIDENT DASHBOARD**:
   - Approved visitor list (recurring visitors whitelist)
   - Visitor approval/rejection status
   - Blocked visitor blacklist
   
2. **FROM SOCIETY ADMIN DASHBOARD**:
   - Building announcements
   - Security procedures
   - Emergency protocols
   - Duty roster and shift assignments

---

## SOCIETY ADMIN DASHBOARD DATA FLOW

### State Management
```
activeTab: 'overview' | 'units' | 'visitors' | 'watchmen' | 'announcements' | 'maintenance' | 'financials' | 'reports'
```

### Data Society Admin Dashboard SENDS to Other Dashboards
1. **TO RESIDENT DASHBOARD**:
   - Announcements and notices
   - Maintenance schedules
   - Payment reminders
   - Community events
   - Emergency alerts

2. **TO WATCHMAN DASHBOARD**:
   - Emergency procedures
   - Duty roster updates
   - Building-wide notices
   - Security alerts

### Data Society Admin Dashboard RECEIVES from Other Dashboards
1. **FROM RESIDENT DASHBOARD**:
   - New complaints
   - Maintenance requests
   - Payments received
   - Visitor approval patterns (for analytics)
   - Profile information (for unit management)

2. **FROM WATCHMAN DASHBOARD**:
   - Daily visitor statistics (aggregated, no private data)
   - Incident reports
   - Attendance logs
   - Security incidents
   - Building activity summary

---

## BUTTON FUNCTIONALITY AUDIT

### RESIDENT DASHBOARD - HOME PAGE

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Review Visitors →" | Changes view to 'visitors' tab | setView('visitors') | VisitorApprovals component |
| "Overdue Bill Payment" notice | Changes view to 'payments' | setView('payments') | Payments component |
| "Quick Access" Visitors icon | Changes view to 'visitors' | setView('visitors') | VisitorApprovals component |
| "Quick Access" Complaints icon | Changes view to 'complaints' | setView('complaints') | ComplaintsReporting component |
| "Quick Access" Tickets icon | Changes view to 'tickets' | setView('tickets') | MaintenanceTickets component |
| "Quick Access" Payments icon | Changes view to 'payments' | setView('payments') | MaintenanceAndBilling component |
| Profile avatar (top right) | Opens/closes profile dropdown | setMenuOpen(!menuOpen) | Profile menu |
| "Profile Settings" in dropdown | Changes view to 'profile', section to 'overview' | setView('profile'), setProfileSection('overview') | Profile page |

### RESIDENT DASHBOARD - VISITOR APPROVALS

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Photo thumbnail (click) | Opens enlarged photo modal | setEnlargedPhoto(visitor.photo) | Photo modal |
| "Approve" button | Approves visitor, sends to watchman, moves to history | status: 'approved', sends notification to watchman dashboard | Watchman receives approved visitor |
| "Reject" button | Rejects visitor, records reason, sends to watchman | status: 'rejected', reason stored | Watchman dashboard sees rejection |
| Search bar | Filters visitors by name/phone | filters visitorsArray | Updates display |
| "All/Approved/Rejected" tabs | Filters by status | filterStatus state | VisitorApprovals component |
| "Add New Visitor" button | Opens form to manually add recurring visitor | Opens add modal | Adds to recurring visitors list |
| "Delete" button (recurring) | Removes visitor from whitelist | Removes from recurringVisitors array | Updates whitelist |

### RESIDENT DASHBOARD - PROFILE PAGE

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Tab buttons (Overview/Edit/Password/etc) | Changes profile section | setProfileSection(tabId) | Updates profile view |
| "Save Changes" (Edit) | Updates resident name/email/phone | setResidentName, setResidentEmail, setResidentPhone | Updates page header and state |
| "Cancel" (Edit) | Discards changes, returns to Overview | setProfileSection('overview') | Profile overview |
| "Update Password" | Would send password reset (needs backend) | -- | Backend authentication |
| "Save Preferences" | Saves notification preferences (needs backend) | -- | Preferences storage |
| "Add New Visitor" (Saved Visitors tab) | Opens form to add recurring visitor | Opens modal | Recurring visitors list |
| "Delete" button (Saved Visitors) | Removes from recurring visitors | Removes from array | Updates recurring list |
| "Contact Support Team" | Opens contact information | -- | Display only |
| "Logout" | Clears session and redirects to login | -- | Backend logout endpoint |
| Close (X) button | Returns to home | setView('home') | Home page |

### RESIDENT DASHBOARD - COMPLAINTS

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Report New Complaint" | Opens complaint form | Opens complaint creation modal | New complaint submitted |
| Complaint category buttons | Filters by type | setFilter(category) | Updates complaint display |
| "Submit" button | Creates new complaint, sends to admin | Adds to complaintsArray, notifies admin dashboard | Admin sees new complaint |
| Priority radio buttons | Sets complaint severity | Sets priority level | Admin sees priority level |

### RESIDENT DASHBOARD - PAYMENTS

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Pay Now" button | Initiates payment (needs backend) | -- | Payment gateway integration |
| "Download Invoice" | Downloads PDF of bill | -- | PDF export |
| View receipt | Shows payment confirmation | -- | Display receipt details |

---

## WATCHMAN DASHBOARD BUTTONS

### ENTRY FORM SECTION

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Take Photo" / Camera icon | Opens device camera for photo capture | Captures image as base64 data URL | visitorPhoto state |
| "Retake" button | Clears current photo, opens camera again | setVisitorPhoto(null), reopens camera | Camera input |
| "Submit" button | Logs visitor entry to system | Creates visitor object with photo, sends to resident dashboard | Resident dashboard sees pending approval |
| Phone input | Enters visitor phone number | Updates formData.phone | Form data |
| Unit dropdown | Selects destination unit | Updates formData.unit | Form data - CRITICAL: this links visitor to resident |
| Purpose dropdown | Selects reason for visit | Updates formData.purpose | Form data |

### WATCHMAN DASHBOARD VISITOR LOG

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Visitor row (click) | Shows visitor details | Expands to show full info | Detailed view |
| Search bar | Filters by visitor name/phone | Updates filter | Display |
| Status filter (Pending/Approved/Rejected) | Filters by approval status | setStatusFilter(status) | Updates display |
| "View Details" | Shows full visitor information | Modal with all details | Detailed view modal |

### WATCHMAN DASHBOARD INCIDENTS

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Report Incident" | Opens incident form | Opens incident creation modal | Incident form |
| Category buttons | Selects incident type | Sets incident.category | Form data |
| "Add Photo" | Captures incident photo | Captures image with camera | incidentPhoto state |
| "Submit" | Logs incident with photo | Creates incident object, sends to admin dashboard | Admin sees incident report |
| Priority selector | Sets incident urgency | Sets incident.priority | Admin sees priority |

---

## SOCIETY ADMIN DASHBOARD BUTTONS

### UNITS TAB

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Unit cards (click) | Shows unit details/resident info | Opens unit profile modal | Shows resident and unit details |
| "Edit" button | Opens unit editing form | Opens edit modal | Update unit information |
| Search bar | Filters by unit number | Updates filter | Display |

### WATCHMEN TAB

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Tab buttons (List/Duty/Incidents/Performance) | Switches watchmen view | setWatchmenTab(tabId) | Updates view |
| "Add Watchman" button | Opens form to add new watchman | Opens add modal | New watchman creation |
| Watchman row (click) | Shows watchman details | Opens modal with full details | Watchman profile |
| Clock-in/Clock-out button | Records shift timing | Updates duty log | Sends to watchman dashboard |

### ANNOUNCEMENTS TAB

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| "Create Announcement" | Opens announcement form | Opens creation modal | New announcement |
| "Post" button | Publishes announcement to all residents | Sends announcement to all resident dashboards | Residents see notice |
| Edit button | Allows editing announcement | Opens edit modal | Updates announcement |
| Delete button | Removes announcement | Removes from list, notifies residents | Announcement removed |

### FINANCIALS TAB

| Button | Function | Data Flow | Target |
|--------|----------|-----------|--------|
| Payment row (click) | Shows payment details | Opens payment details modal | Display receipt |
| "Generate Invoice" | Creates PDF bill for unit | -- | PDF export |
| "Send Reminder" | Sends payment reminder notification | Sends notification to resident dashboard | Resident receives reminder |

---

## CRITICAL DATA CONNECTIONS

### VISITOR FLOW (Most Important)
1. Watchman logs visitor with photo → data sent to Resident Dashboard
2. Resident approves/rejects → status sent back to Watchman Dashboard
3. Approved visitors added to recurring list → whitelist sent back to Watchman
4. Statistics aggregated → sent to Admin Dashboard (numbers only, no names)

### INCIDENT FLOW
1. Watchman reports incident with photo → sent to Admin Dashboard
2. Admin Dashboard shows incident report → appears in analytics
3. Admin can send alert to residents → notification sent to Resident Dashboard

### FINANCIAL FLOW
1. Admin Dashboard creates bills → sent to Resident Dashboard
2. Resident pays → payment recorded in Admin Dashboard
3. Admin sends reminder → notification to Resident Dashboard

### ANNOUNCEMENT FLOW
1. Admin Dashboard creates announcement → broadcasted to all Resident Dashboards
2. Watchman Dashboard also receives building announcements
3. Residents see notices on home page

---

## CURRENT ISSUES & LIMITATIONS

### Issue 1: No Real-Time Synchronization
- All data currently stored in React useState (localStorage in mock)
- Changes in one dashboard don't immediately reflect in other dashboards
- **Solution needed**: Implement real-time database (Supabase) or WebSocket connection

### Issue 2: Photo Data Loss on Page Refresh
- Photos stored as base64 in memory, lost on refresh
- **Solution needed**: Store photos in backend/file storage (Vercel Blob)

### Issue 3: No Authentication Layer
- No login system - all dashboards accessible without credentials
- No role-based access control
- **Solution needed**: Implement NextAuth.js or Auth0

### Issue 4: No Validation
- Buttons execute actions without checking permissions
- Resident can theoretically approve/reject any visitor (should only see own approvals)
- **Solution needed**: Backend validation with role checking

### Issue 5: Missing Notification System
- No push notifications when visitor arrives
- No alerts for incidents or emergencies
- **Solution needed**: Firebase Cloud Messaging or Supabase Realtime

---

## DATA FLOW DIAGRAM

```
WATCHMAN DASHBOARD
    ↓ (logs visitor with photo)
    ↓
RESIDENT DASHBOARD (receives pending visitor)
    ↓ (approves/rejects)
    ↓
WATCHMAN DASHBOARD (sees approval status)
    ↓ (logs aggregated stats)
    ↓
SOCIETY ADMIN DASHBOARD (sees only numbers, no private data)
    ↑ (sends announcements)
    ↑
RESIDENT DASHBOARD & WATCHMAN DASHBOARD (receive notices)
```

---

## NEXT STEPS FOR REFINEMENT

1. **Test each button** on all three dashboards to verify navigation
2. **Trace data flow** through visitor approval workflow
3. **Verify photo display** in resident approvals when watchman logs visitor
4. **Check admin statistics** don't show private resident/visitor data
5. **Test on mobile** to ensure responsive design works
6. **Then: Implement backend database** to persist all data
