# FRONTEND COMPLETION CHECKLIST

## Current Status
- ✅ Watchman Dashboard: 85% UI complete
- ✅ Resident Dashboard: 90% UI complete  
- ✅ Society Admin Dashboard: 80% UI complete
- ❌ Missing: Critical photo capture, data display features

---

## WATCHMAN DASHBOARD - FRONTEND TODO

### 1. Photo Capture for Visitor Entry ⭐ PRIORITY 1
**Current State:** `newVisitorForm.photo` exists in state but no camera UI
**What Needs Building:**
- [ ] Camera input component (phone camera at gate)
  - Real-time camera preview
  - Capture button
  - Retake option
  - Photo preview display
  - File size validation (< 5MB)
- [ ] Fallback: File upload if camera unavailable
- [ ] Save captured photo to visitor record
- [ ] Display photo in visitor list/history

**Location:** `/app/watchman-dashboard/page.tsx` - Around line 92-100

**Implementation Approach:**
```typescript
// Add to newVisitorForm state
photo: null as File | null,
photoPreview: null as string | null,
cameraActive: false,
capturedPhotoData: null as string | null
```

---

### 2. Visitor Entry Log Form Enhancement
**Current State:** Form exists but UI needs refinement
**What Needs Building:**
- [ ] Photo preview thumbnail in form
- [ ] Camera button in form (opens camera modal)
- [ ] Visitor purpose selector (dropdown with common values)
- [ ] Number of people visiting (counter)
- [ ] Vehicle info optional field (vehicle type, number plate)
- [ ] Submit button with validation
- [ ] Success/error message handling
- [ ] Form reset after submission

---

### 3. Pending Approvals List Enhancement
**Current State:** Shows pending visitors but no photos
**What Needs Building:**
- [ ] Display visitor photo thumbnail (circular, 60x60px)
- [ ] Quick action buttons (Approve/Reject) inline
- [ ] Show: Name, Purpose, Time, Unit, Photo
- [ ] Status badge (Pending/Approved/Rejected)
- [ ] Rejected reason display (if rejected)
- [ ] Filter by status (Pending/Approved/Rejected)

---

### 4. Today's Activity Log (Already exists - verify display)
**Current State:** Shows basic entry logs
**What Needs Building:**
- [ ] Photo thumbnail in activity log
- [ ] Entry time (HH:MM format)
- [ ] Status indicator (green for approved, red for rejected)
- [ ] Visitor name and purpose
- [ ] Resident approval status
- [ ] Note: NO exit time tracking needed

---

### 5. Incident/Flagged Visitors Display
**Current State:** isFlagged property exists
**What Needs Building:**
- [ ] Red alert badge for flagged visitors
- [ ] Flag reason display
- [ ] Watchman can add flag with reason
- [ ] Flag history (when flagged, by whom)

---

### 6. Blacklist Check on Entry
**Current State:** BlacklistManager component exists
**What Needs Building:**
- [ ] When visitor photo captured, check against blacklist
- [ ] Show warning if blacklisted person detected
- [ ] Block entry option if blacklisted
- [ ] Auto-flag blacklisted entries

---

## RESIDENT DASHBOARD - FRONTEND TODO

### 1. Visitor Photos in Approvals ⭐ PRIORITY 1
**Current State:** Photos not displayed in VisitorApprovals
**What Needs Building:**
- [ ] Display visitor photo (circular, 80x80px) in approval card
- [ ] Photo from watchman's capture
- [ ] Fallback avatar if no photo
- [ ] Tap photo to enlarge in modal
- [ ] Default visitor avatar with initials if no photo yet

**Location:** `/app/resident-dashboard/components/VisitorApprovals.tsx`

**Implementation:**
```typescript
// Add photo display in pending visitor card
<div className="flex items-center gap-4">
  <img 
    src={visitor.photo || `/avatar-${visitor.name}.jpg`}
    alt={visitor.name}
    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
  />
  <div>
    {/* visitor details */}
  </div>
</div>
```

---

### 2. Quick Approval/Rejection Interface
**Current State:** Buttons exist but UX needs improvement
**What Needs Building:**
- [ ] Large Approve/Reject buttons
- [ ] Optional rejection reason (text input or dropdown)
- [ ] Confirmation dialog before approval
- [ ] Success toast notification
- [ ] Real-time update to watchman dashboard

---

### 3. Visitor History with Photos
**Current State:** History exists
**What Needs Building:**
- [ ] Show visitor photo thumbnail in history
- [ ] Timeline view with past approvals
- [ ] Filter by approval status
- [ ] Search by visitor name
- [ ] Export/print history option

---

### 4. Profile Completion in Dashboard
**Current State:** Profile page exists but integration needs work
**What Needs Building:**
- [ ] Profile shows in modal or separate page
- [ ] Photo upload for profile
- [ ] Resident details editable (name, phone, email)
- [ ] Unit information display
- [ ] Save changes functionality

---

## SOCIETY ADMIN DASHBOARD - FRONTEND TODO

### 1. Visitor Statistics Dashboard ⭐ PRIORITY 1
**Current State:** VisitorStats component exists
**What Needs Building:**
- [ ] Today's total visitors count
- [ ] Approved count & percentage (%)
- [ ] Rejected count & percentage (%)
- [ ] Pending count & percentage (%)
- [ ] Trend chart (last 7 days)
- [ ] Peak visiting hours chart
- [ ] Most visited units (top 5)
- [ ] Most common visitor purposes

**Privacy Requirements:** ⚠️ NO private data shown
- ❌ Do NOT show resident names
- ❌ Do NOT show visitor personal details
- ❌ Do NOT show which unit visited
- ✅ Only show aggregated numbers and percentages

---

### 2. Visitor Entry/Exit Summary
**Current State:** Probably missing
**What Needs Building:**
- [ ] Total entry count today
- [ ] Breakdown by purpose (Delivery, Guest, Service, etc.)
- [ ] Time distribution chart
- [ ] Alert if visitors exceed normal count
- [ ] No exit tracking needed

---

### 3. Watchman Activity Feed (Aggregate Only)
**Current State:** May exist
**What Needs Building:**
- [ ] Total entries logged by each watchman
- [ ] Entries flagged/rejected count
- [ ] Performance metrics (response time to approvals)
- [ ] Duty hours tracked
- [ ] No visitor names or resident identities

---

### 4. Unit Overview (Without Visitor Details)
**Current State:** UnitGrid exists
**What Needs Building:**
- [ ] Grid showing all units
- [ ] Mark units with visitors today
- [ ] No resident identification shown
- [ ] No visitor details in popup
- [ ] Just show "Unit 201 - 2 visitors today"

---

### 5. Reports Tab (Anonymized Data)
**Current State:** ReportsTab exists
**What Needs Building:**
- [ ] Daily visitor report (total count)
- [ ] Weekly/Monthly trends
- [ ] Visitor type distribution (pie chart)
- [ ] Peak hours analysis
- [ ] Blacklist match incidents
- [ ] All data anonymized/aggregated

---

## CROSS-DASHBOARD FEATURES

### 1. Notification System Integration
- [ ] Watchman → Resident: "Visitor at gate for approval"
- [ ] Resident → Watchman: "Visitor approved/rejected"
- [ ] Admin → Watchman: "Blacklist alert when flagged person detected"
- [ ] Toast notifications with timestamps
- [ ] Notification center (bell icon in header)

---

### 2. Data Synchronization UI
- [ ] Show sync status indicator (online/offline)
- [ ] Manual refresh buttons
- [ ] Last sync timestamp
- [ ] Loading states for real-time updates

---

### 3. Utility Features
- [ ] Dark mode toggle (if needed)
- [ ] Language toggle (already partially done)
- [ ] Export data to CSV
- [ ] Print functionality
- [ ] Mobile responsive verification

---

## IMPLEMENTATION ORDER

**Phase 1 (Most Critical):**
1. Add camera capture UI to watchman dashboard
2. Display photos in resident visitor approvals
3. Add aggregate statistics to admin dashboard

**Phase 2:**
4. Visitor history enhancements
5. Notification system UI
6. Admin reports with anonymized data

**Phase 3:**
7. Polish and edge cases
8. Mobile optimization verification
9. Accessibility checks

---

## DATA FLOW DIAGRAM (Frontend Only)

```
WATCHMAN:
1. Open camera → Capture photo
2. Enter visitor details + photo
3. Submit → Add to pending list
4. Show "Awaiting resident approval"

RESIDENT:
1. See notification "Visitor at gate"
2. See visitor photo + details
3. Click Approve/Reject
4. Confirmation shown

ADMIN:
1. Dashboard loads
2. Show today's stats: 25 visitors (80% approved, 20% pending)
3. Chart: Peak time was 10-11 AM
4. No resident or visitor names visible
```

---

## Testing Checklist

- [ ] Camera works on mobile (iOS + Android)
- [ ] Photo uploads work on desktop (fallback)
- [ ] Photos display correctly (all formats)
- [ ] Admin sees no private data
- [ ] Notifications appear real-time
- [ ] All dashboards responsive on mobile
- [ ] Forms validate input properly
- [ ] Error states handle gracefully

---

## Notes

- Keep all data flows frontend-only for now (mock data)
- Focus on UI/UX completion
- Backend integration comes AFTER frontend is 100%
- No photos will persist yet (lost on refresh)
- This is frontend architecture only
