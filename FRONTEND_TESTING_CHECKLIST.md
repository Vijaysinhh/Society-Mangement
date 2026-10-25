# FRONTEND TESTING & REFINEMENT CHECKLIST

## RESIDENT DASHBOARD - HOME PAGE TESTING

### Navigation Tests
- [ ] Click "Review Visitors →" button → should navigate to Visitors tab
- [ ] Click "Overdue Bill Payment" notice → should navigate to Payments tab
- [ ] Click Quick Access Visitors icon → should navigate to Visitors tab
- [ ] Click Quick Access Complaints icon → should navigate to Complaints tab
- [ ] Click Quick Access Tickets icon → should navigate to Tickets tab
- [ ] Click Quick Access Payments icon → should navigate to Payments tab
- [ ] Click profile avatar (top right) → dropdown menu should appear
- [ ] Click "Profile Settings" in dropdown → should show full profile page
- [ ] Click X to close profile dropdown → menu should close
- [ ] Click on each nav tab → correct view should display

### Data Display Tests
- [ ] Resident name displays correctly: "Ajay Kumar"
- [ ] Unit number displays: "201"
- [ ] Pending visitor count shows: "2"
- [ ] Visitor names show: "Rajesh (Maid) • Priya (Delivery)"
- [ ] Today's summary shows 8 total visitors
- [ ] Status breakdown shows: 5 approved (✓), 2 pending (⏳), 1 rejected (✗)
- [ ] On-duty watchman shows: "Rajesh"
- [ ] Due bills show: "₹6,000"
- [ ] Monthly visitors show: "156" with "↑ 12%"
- [ ] Recent activity shows 4 events with timestamps
- [ ] Upcoming events shows 3 items with countdown

---

## RESIDENT DASHBOARD - VISITOR APPROVALS TESTING

### Pending Approvals Display
- [ ] Two pending visitors are displayed with blue "PENDING" badges
- [ ] Photo thumbnail (56x56px) displays for each visitor
- [ ] Visitor name displays correctly
- [ ] Purpose displays correctly ("Electronics Delivery", "Friend Visit")
- [ ] Phone number displays with +91 country code
- [ ] "Approve" and "Reject" buttons are visible and clickable

### Photo Modal Testing
- [ ] Click on photo thumbnail → full-size photo modal opens
- [ ] Modal has semi-transparent dark overlay
- [ ] Modal shows close (X) button in top right
- [ ] Click X button → modal closes
- [ ] Click outside modal → modal closes
- [ ] Photo displays at full size in modal

### Visitor History Tab
- [ ] Switch to "History" tab → shows past approvals/rejections
- [ ] Search bar filters by name or phone → results update
- [ ] Filter buttons (All/Approved/Rejected) → correct visitors display
- [ ] Each historical entry shows status badge
- [ ] Each entry shows date and time

### Recurring Visitors Tab
- [ ] Switch to "Recurring" tab → shows saved regular visitors
- [ ] Each recurring visitor shows name, phone, frequency
- [ ] Star icon indicates whitelisted status
- [ ] "Delete" button removes visitor from list
- [ ] "Add New Visitor" button opens form

### Approval/Rejection Flow
- [ ] Click "Approve" button → status changes to approved
- [ ] Visitor moves from "Pending" tab to "History" tab
- [ ] Green checkmark appears in history
- [ ] Click "Reject" button → status changes to rejected
- [ ] Rejection reason can be entered
- [ ] Red X appears in history with rejection reason

---

## RESIDENT DASHBOARD - PROFILE PAGE TESTING

### Profile Overview Tab
- [ ] Tab displays email: "ajay.kumar@gmail.com"
- [ ] Tab displays phone: "+91 98765 43210"
- [ ] Tab displays unit: "201"
- [ ] Tab displays member since: "January 2024"
- [ ] Status shows: "Active" with green badge

### Edit Profile Tab
- [ ] Input fields pre-fill with current data
- [ ] Can edit name field
- [ ] Can edit email field
- [ ] Can edit phone field
- [ ] Unit number field is disabled (grayed out)
- [ ] "Save Changes" button saves and returns to overview
- [ ] "Cancel" button discards changes without saving

### Password Tab
- [ ] Three password input fields are visible
- [ ] Current password field is empty and editable
- [ ] New password field is empty and editable
- [ ] Confirm password field is empty and editable
- [ ] "Update Password" button is clickable

### Preferences Tab
- [ ] Four toggle checkboxes display: Email, SMS, Visitor, Payments
- [ ] All checkboxes are checked by default
- [ ] Can toggle each checkbox on/off
- [ ] "Save Preferences" button is clickable

### Saved Visitors Tab
- [ ] Shows at least 2 recurring visitors (Rajesh, Priya)
- [ ] Each shows name and phone
- [ ] "Delete" button removes visitor
- [ ] "Add New Visitor" button opens form to add new

### Help Tab
- [ ] Shows contact info: "+91 9876543210"
- [ ] Shows email: "support@society.com"
- [ ] Shows hours: "Monday to Friday, 9 AM to 6 PM"
- [ ] "Contact Support Team" button is clickable
- [ ] "Logout" button appears at bottom with LogOut icon

---

## RESIDENT DASHBOARD - OTHER TABS TESTING

### Complaints Tab
- [ ] Can see existing complaints with status
- [ ] "Report New Complaint" button is clickable
- [ ] Can select complaint category
- [ ] Can enter complaint description
- [ ] "Submit" button creates new complaint
- [ ] Submitted complaint appears in list

### Tickets Tab
- [ ] Shows maintenance request tickets
- [ ] Each ticket shows status: pending/in-progress/completed
- [ ] Can request new maintenance
- [ ] Can view ticket details
- [ ] Can cancel pending tickets

### Payments Tab
- [ ] Shows outstanding bills
- [ ] Shows paid bills with receipts
- [ ] "Pay Now" button is clickable (would need payment gateway)
- [ ] "Download Invoice" button is clickable
- [ ] Payment history displays

---

## WATCHMAN DASHBOARD - VISITOR ENTRY FORM TESTING

### Form Fields
- [ ] Visitor name input field works
- [ ] Phone number input field works with +91 prefix
- [ ] Unit selection dropdown shows all units
- [ ] Purpose dropdown shows: Delivery, Guest, Service, Other
- [ ] Vehicle number input works
- [ ] Vehicle color input works
- [ ] Number of people input works
- [ ] Expected departure time picker works
- [ ] Additional info textarea works

### Photo Capture
- [ ] "Take Photo" button opens device camera on mobile
- [ ] Photo preview displays after capture
- [ ] "Retake" button clears photo and reopens camera
- [ ] Photo is retained when scrolling form
- [ ] Photo displays as thumbnail (56x56px or larger)

### Form Submission
- [ ] "Submit" button validates all required fields
- [ ] Visitor data is logged and appears in history
- [ ] Photo is saved with visitor record
- [ ] Form clears after submission
- [ ] Success message appears after submission
- [ ] Visitor appears as "PENDING" until resident approves

---

## WATCHMAN DASHBOARD - HISTORY LOG TESTING

### Display & Filtering
- [ ] All logged visitors appear in history
- [ ] Each entry shows: name, phone, purpose, unit, time, photo
- [ ] Search by name or phone filters results
- [ ] Filter by status (Pending/Approved/Rejected) works
- [ ] Status badges show correct colors:
  - [ ] Blue for pending
  - [ ] Green for approved
  - [ ] Red for rejected

### Visitor Details
- [ ] Click on visitor row → expands to show full details
- [ ] Photo displays when expanded
- [ ] Approval status displays
- [ ] Approval timestamp displays (from resident)

---

## WATCHMAN DASHBOARD - INCIDENTS TESTING

### Incident Reporting
- [ ] "Report Incident" button opens form
- [ ] Incident categories display: Noise, Theft, Property Damage, Lost & Found, Security, Other
- [ ] Can select category
- [ ] Can enter incident description
- [ ] Can set priority: Low, Medium, High
- [ ] "Add Photo" captures incident photo
- [ ] Photo displays in preview
- [ ] "Submit" button logs incident

### Incident History
- [ ] All reported incidents display
- [ ] Each shows date, time, category, priority
- [ ] Incidents with high priority show red badge
- [ ] Photos display for each incident
- [ ] Can view full incident details

---

## SOCIETY ADMIN DASHBOARD - OVERVIEW TAB TESTING

### Key Metrics Display
- [ ] Total Visitors card shows correct number
- [ ] Total Approved card shows correct number with %
- [ ] Total Rejected card shows correct number
- [ ] Average Daily card shows daily average
- [ ] All cards have appropriate icon and color gradient

### Privacy Notice
- [ ] Privacy notice displays at top
- [ ] Notice explains no resident names or private data shown
- [ ] Notice is clearly visible and readable

---

## SOCIETY ADMIN DASHBOARD - UNITS TAB TESTING

### Unit List
- [ ] All units display with unit number
- [ ] Each unit shows resident name and status
- [ ] Click unit card → shows full details
- [ ] Search by unit number filters list
- [ ] "Edit" button allows editing unit details

---

## SOCIETY ADMIN DASHBOARD - WATCHMEN TAB TESTING

### Watchmen List
- [ ] All watchmen display with name, status, current shift
- [ ] "Add Watchman" button opens form
- [ ] Click watchman → shows full profile

### Duty Log Subtab
- [ ] Shows clock-in and clock-out times
- [ ] Displays duty duration
- [ ] Filters by date range work
- [ ] Search by watchman name works

### Incidents Subtab
- [ ] Shows all reported incidents
- [ ] Each incident shows category, priority, date
- [ ] Photos display with incidents
- [ ] Can view full incident details

---

## SOCIETY ADMIN DASHBOARD - ANNOUNCEMENTS TAB TESTING

### Create & Post
- [ ] "Create Announcement" button opens form
- [ ] Can type announcement title and content
- [ ] Can select target audience (All/Residents Only/Watchmen Only)
- [ ] "Post" button publishes announcement
- [ ] Announcement appears in list
- [ ] Residents receive notification

### Announcements List
- [ ] All announcements display with date
- [ ] Can "Edit" announcements
- [ ] Can "Delete" announcements
- [ ] Delete confirmation appears before removal

---

## CROSS-DASHBOARD DATA FLOW TESTING

### Visitor Approval Flow
1. [ ] **Watchman**: Log visitor with name "Test Visitor" and photo
2. [ ] **Resident**: Navigate to Visitors tab → "Test Visitor" appears as pending
3. [ ] **Resident**: Click photo → modal opens and shows photo
4. [ ] **Resident**: Click "Approve" button
5. [ ] **Watchman**: Refresh or check history → status shows "APPROVED" (green)
6. [ ] **Resident**: Visitor moved to history tab with green checkmark

### Incident Reporting Flow
1. [ ] **Watchman**: Report incident with photo and high priority
2. [ ] **Admin**: Navigate to Watchmen → Incidents tab
3. [ ] **Admin**: New incident appears with red "HIGH PRIORITY" badge
4. [ ] **Admin**: Click incident → photo displays

### Announcement Flow
1. [ ] **Admin**: Create announcement "Test Notice"
2. [ ] **Resident**: Check home page → notice appears in "Important Notices"
3. [ ] **Watchman**: Check dashboard → announcement appears

---

## MOBILE RESPONSIVENESS TESTING

Test on different screen sizes (use browser DevTools):
- [ ] 375px (iPhone SE)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1440px (Desktop)

For each size:
- [ ] Navigation tabs display correctly
- [ ] Buttons are touch-friendly (minimum 44x44px)
- [ ] Cards don't overflow
- [ ] Photos display without distortion
- [ ] Forms are usable on small screens
- [ ] Modals don't exceed screen width

---

## BROWSER COMPATIBILITY TESTING

- [ ] Chrome/Edge (latest)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Mobile browsers

---

## PERFORMANCE TESTING

- [ ] Home page loads quickly (< 2s)
- [ ] Photo thumbnails load quickly
- [ ] Switching between tabs is smooth
- [ ] No lag when scrolling through lists
- [ ] Modals open/close smoothly

---

## TESTING SUMMARY

**Total Tests**: 180+
**Critical Tests** (must all pass):
- All navigation buttons work
- Visitor approval flow works end-to-end
- Photos display correctly
- Admin can't see private resident data
- Mobile layout works on at least 2 screen sizes

**Pass Criteria**: All critical tests must pass before moving to backend development.
