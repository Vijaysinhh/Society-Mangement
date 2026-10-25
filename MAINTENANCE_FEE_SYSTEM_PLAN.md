# Comprehensive Maintenance Fee System - Implementation Plan

## 1. DATA MODEL & SCHEMA

### MaintenanceFee Schema
```typescript
interface MaintenanceFee {
  id: string
  unitId: string
  societyId: string
  
  // Fee Configuration
  feeAmount: number
  feeType: 'fixed' | 'tiered' | 'area-based'
  unitType?: string // 1BHK, 2BHK, etc (for tiered)
  carpetArea?: number // for area-based
  frequency: 'monthly' | 'quarterly' | 'yearly'
  
  // Billing Cycle
  dueDate: Date
  billingMonth: string // "2024-03"
  isOverdue: boolean
  
  // Payment Status
  status: 'unpaid' | 'partial' | 'paid' | 'waived' | 'exempted'
  amountPaid: number
  remainingAmount: number
  
  // Late Fees
  lateFeeApplicable: boolean
  lateFeeAmount: number
  interestRate: number // percentage
  
  // Exemptions & Waivers
  exempted: boolean
  exemptionReason?: string
  exemptionType: 'permanent' | 'temporary' | 'none'
  exemptionEndDate?: Date
  
  // Adjustments
  waiverAmount: number
  discountAmount: number
  discountReason?: string
  seasonalAdjustment: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  lastReminderSent?: Date
  notes?: string
}
```

### Payment Transaction Schema
```typescript
interface PaymentTransaction {
  id: string
  maintenanceFeeId: string
  unitId: string
  societyId: string
  
  // Payment Details
  amountPaid: number
  paymentMethod: 'cash' | 'bank-transfer' | 'upi' | 'cheque' | 'online'
  paymentDate: Date
  referenceNumber: string // check number, transaction ID, etc
  
  // Receipt
  receiptGenerated: boolean
  receiptNumber: string
  receiptEmail: string
  receiptSentAt?: Date
  
  // Audit Trail
  recordedBy: string // admin ID
  recordedAt: Date
  updatedAt: Date
  notes?: string
}
```

### Reminder Schema
```typescript
interface MaintenanceFeeReminder {
  id: string
  maintenanceFeeId: string
  unitId: string
  societyId: string
  
  reminderType: 'pre-due' | 'overdue' | 'manual' | 'bulk'
  channels: ('email' | 'whatsapp' | 'sms')[]
  scheduledDate: Date
  sentAt?: Date
  status: 'pending' | 'sent' | 'failed'
  
  createdAt: Date
}
```

---

## 2. KEY FEATURES & UI COMPONENTS

### Feature 1: Individual Payment Recording
- **UI**: Modal/Form in Collections tab
- **Fields**: Unit selection, Amount, Payment method, Reference number, Date, Notes
- **Actions**: Record payment, Generate receipt, Print/Email receipt
- **Validation**: Amount ≤ remaining balance, valid payment date

### Feature 2: Bulk Payment Recording
- **UI**: Bulk payment modal with table
- **Capability**: Select multiple units → Enter payment method → Record all at once
- **Output**: Summary report, Option to generate bulk receipts
- **Import**: CSV template download, Parse CSV, Validate data, Confirm before recording

### Feature 3: Bulk Actions Bar (Sticky)
Appears when users select multiple fees:
- **Selection**: Checkboxes for each fee row
- **Actions**:
  - Mark as Paid (opens payment form)
  - Apply Waiver/Discount (amount + reason)
  - Send Reminders (select channels: email/WhatsApp/SMS)
  - Generate Receipts (for already paid)
  - Export (Excel/CSV)
- **Counts**: Show "X selected, Y total"

### Feature 4: Payment History & Audit Trail
- **Per Fee View**: 
  - Timeline of all payments
  - Each entry: Date, Amount, Method, Reference, Recorded by, Receipt link
  - Shows partial payments and adjustments
- **Search & Filter**: By date range, payment method, status

### Feature 5: Receipt Generation & Management
- **Automatic**: When payment recorded → Generate receipt immediately
- **Manual**: "Generate Receipt" button for paid fees
- **Features**:
  - Professional PDF template
  - Unit details, Fee details, Payment details
  - Receipt number, Date, Footer
  - Email delivery with PDF attachment
  - Print option
  - Store receipt copies (audit trail)

### Feature 6: Due Date & Overdue Management
- **Due Date Setup**: Per billing cycle
- **Overdue Calculation**: 
  - Automatic flag when date passes
  - Count days overdue
  - Calculate late fees if enabled
- **Dashboard**: Show overdue count, total overdue amount
- **Overdue List**: Dedicated view with collection priority

### Feature 7: Late Fees & Interest
- **Configuration**:
  - Enable/disable per society
  - Late fee amount (fixed or percentage)
  - Interest rate (% per month)
  - Grace period (days after due date before fees apply)
- **Auto-calculation**: When overdue → Calculate & display late fees
- **Manual Override**: Ability to waive/adjust late fees

### Feature 8: Exemptions & Waivers
- **Permanent Exemptions**: 
  - Mark unit as exempt (reason: VIP resident, staff, etc)
  - Exempted fees don't appear in pending/overdue lists
- **Temporary Waivers**:
  - One-time waiver for specific fee (reason: renovation, dispute, etc)
  - Waiver expiry date
- **Partial Waiver**: Reduce fee amount instead of full waiver
- **Seasonal Adjustment**: Reduce/increase % for specific periods

### Feature 9: Automated Reminders
- **Configuration**:
  - Pre-due reminder (X days before)
  - Overdue reminder (Y days after, recurring)
  - Channels: Email, WhatsApp, SMS
  - Custom message template
- **Execution**: Background job sends on schedule
- **Tracking**: View sent reminders, retry failed, manual override

### Feature 10: Tiered Fee Structure
- **Setup**: Define fee by unit type (1BHK = X, 2BHK = Y, etc)
- **Area-Based**: Define fee per sq.ft (or multiple by area)
- **Display**: Show how fee was calculated per unit
- **Bulk Update**: Change all tier amounts at once

---

## 3. COLLECTIONS TAB LAYOUT

### Top Section:
- **Quick Stats**: Total pending, Total overdue, Total collected this month
- **Filters**: Date range, Status (unpaid/partial/paid/overdue), Unit type, Exemption status
- **Actions**: Import payments, Bulk send reminders, Export all

### Main Table/List:
Columns: Unit number | Resident | Amount | Due date | Paid | Status | Overdue | Actions

Inline Actions:
- Record payment
- View history
- Send reminder
- Apply waiver
- Exempt
- More (edit notes, view details)

### Bulk Selection:
- Checkboxes on each row
- Select all checkbox
- Bulk actions bar appears (sticky at bottom)

### Side Panel/Drawer:
When clicking a fee row:
- Fee details (amount, type, structure)
- Payment history timeline
- Reminders sent
- Exemptions/waivers applied
- Edit form for adjustments
- Action buttons

---

## 4. PAYMENT RECORDING FLOWS

### Flow 1: Individual Payment
1. Click "Record Payment" on a fee
2. Modal opens: Amount (pre-filled), Method, Reference, Date, Notes
3. Optional: Generate receipt immediately
4. Submit → Update fee status → Show confirmation
5. Optional: Email receipt

### Flow 2: Bulk Payment Recording
1. Select multiple units from list
2. Click "Mark as Paid" in bulk actions
3. Modal: Select payment method, Date (same for all)
4. Enter individual amounts (or use templates)
5. Review summary
6. Submit → All updated → Show report
7. Option: Generate receipts in batch

### Flow 3: Import from CSV
1. Click "Import Payments"
2. Download template or drag CSV
3. Parse & validate data
4. Show preview with errors highlighted
5. Confirm import
6. Process all → Show results (X imported, Y errors)

---

## 5. EXEMPTION & WAIVER FLOWS

### Permanent Exemption
- Mark entire unit as exempt
- Reason dropdown or text
- All future fees auto-marked as exempted
- Show in dashboard: "X exempted units"

### Temporary Waiver
- One-time for specific fee
- Select waiver type: Full/Partial/Percentage
- Enter amount or reason
- Set expiry date (optional)
- Auto-remove after date

### Seasonal Adjustment
- Period: Jan-Mar (example)
- Adjustment: +10% or -20% or flat amount
- Apply to all or specific units
- Show adjustment in fee breakdown

---

## 6. REPORTING & EXPORTS

### Collections Report
- Date range
- Total assessed, Collected, Pending, Overdue, Exempted
- Break by unit type, resident type (owner/tenant)
- Trends (monthly collection rate)
- Export to PDF/Excel

### Payment Export
- Selected fees or all
- Include: Unit, Resident, Amount, Due date, Paid amount, Date paid, Method
- CSV format for accounting software

### Reminder Report
- Reminders sent (date, count, channels)
- Delivery success rate
- Failed reminders (auto-retry)

---

## 7. DATA STORAGE (localStorage structure)

```javascript
localStorage.maintenanceFees = []
localStorage.paymentTransactions = []
localStorage.maintenanceFeeReminders = []
localStorage.feeWaivers = []
localStorage.feeExemptions = []
```

---

## 8. FUNCTIONS NEEDED

### Fee Management
- `calculateMaintenanceFee(unit, feeStructure)` → amount
- `applyLateFees(fee, overdueDays)`
- `applyWaiver(feeId, waiverType, amount)`
- `exemptUnit(unitId, reason, type, endDate)`

### Payment Recording
- `recordPayment(feeId, amount, method, reference, date)`
- `importPaymentsFromCSV(csvData)`
- `generateReceipt(transactionId)` → PDF
- `emailReceipt(transactionId, email)`

### Bulk Operations
- `bulkMarkAsPaid(feeIds, paymentDetails)`
- `bulkApplyWaiver(feeIds, waiverAmount, reason)`
- `bulkSendReminders(feeIds, channels)`
- `bulkExport(feeIds, format)` → CSV/Excel

### Reminders
- `scheduleReminder(feeId, type, channels, date)`
- `sendReminders()` → background job
- `getRemitterHistory(feeId)` → array

### Reporting
- `getCollectionsStats(societyId, dateRange)` → {total, collected, pending, overdue}
- `generateCollectionsReport(filters)` → PDF

---

## 9. COMPONENT HIERARCHY

```
CollectionsTab/
├── QuickStatsCards
├── FiltersBar
├── BulkActionsBar (sticky when items selected)
├── MainFeesTable
│   ├── FeeRow (with inline actions)
│   └── Checkboxes
├── DetailsSidePanel (opens on row click)
│   ├── FeeDetails
│   ├── PaymentHistory
│   ├── ReminderHistory
│   └── ActionButtons
├── Modals/
│   ├── RecordPaymentModal
│   ├── BulkPaymentModal
│   ├── ImportCSVModal
│   ├── WaiverModal
│   ├── ExemptionModal
│   ├── ReceiptModal
│   └── Reminder Modal
└── Drawers/
    ├── BulkActionsDrawer
    └── FiltersDrawer
```

---

## 10. PRIORITY IMPLEMENTATION ORDER

**Phase 1 (Core):**
1. Fee structure setup (fixed, tiered, area-based)
2. Individual payment recording
3. Payment audit trail & history
4. Receipt generation

**Phase 2 (Bulk & Tracking):**
5. Bulk payment recording
6. Bulk actions (mark paid, waive, export)
7. Due date & overdue tracking
8. Late fees calculation

**Phase 3 (Advanced):**
9. Automated reminders
10. CSV import
11. Exemptions & waivers
12. Seasonal adjustments

**Phase 4 (Polish):**
13. Advanced reporting
14. Performance optimizations
15. Mobile responsiveness

---

## 11. KEY CONSIDERATIONS

- **Data Integrity**: All payments immutable (audit trail)
- **Reconciliation**: Ensure fee amount + payments = consistent
- **Notifications**: Real-time updates when bulk operations complete
- **Performance**: Handle large datasets (1000+ fees) efficiently
- **Security**: Only authorized admins can record/waive payments
- **Compliance**: Maintain receipt/transaction records for audits
