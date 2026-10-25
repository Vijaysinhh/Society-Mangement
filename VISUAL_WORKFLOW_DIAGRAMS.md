# Visual Workflow: Property → Owner → Tenant Connection

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOCIETY MANAGEMENT SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│     PROPERTY     │         │      OWNER       │         │    TENANT    │
│   (Unit A-101)   │────────▶│  (Resident with  │────────▶│ (Resident    │
│                  │         │  role='Owner')   │         │ role='Tenant'│
│ - Unit Number    │         │                  │         │)             │
│ - Address        │         │ - Name           │         │              │
│ - Type (Flat)    │         │ - Email          │         │ - Name       │
│ - Bedrooms: 2    │         │ - Phone          │         │ - Email      │
│ - Status: Rented │         │ - ownerId: null  │         │ - Phone      │
│                  │         │                  │         │ - ownerId:   │
└──────────────────┘         └──────────────────┘         │   "owner-1"  │
         │                           │                     │ - Lease End: │
         │                           │                     │   2024-12-31 │
         │                    Creates account              │              │
         │                           │                     └──────────────┘
         │                           │                            ▲
         │                           │                            │
         │                           ▼                            │
         │                    ┌──────────────┐                   │
         │                    │ Owner clicks │                   │
         │                    │ "Invite      │                   │
         │                    │  Tenant"     │                   │
         │                    └──────────────┘                   │
         │                           │                            │
         │                           ▼                            │
         │                    ┌──────────────────┐                │
         │                    │ Invitation Code  │                │
         │                    │ Generated        │                │
         │                    │ Code: XYZ123     │                │
         │                    │ Expires: 7 days  │                │
         │                    └──────────────────┘                │
         │                           │                            │
         │                           ▼                            │
         │                    ┌──────────────────┐                │
         │                    │ Email sent to    │                │
         │                    │ tenant@email.com │                │
         │                    └──────────────────┘                │
         │                           │                            │
         │                           └───────────────────────────▶│
         │                                    Tenant clicks link  │
         │                                    with code XYZ123    │
         │                                                        │
         └────────────────────────────────────────────────────────┘
              Auto-linked when tenant creates account
```

## Timeline: Connection Sequence

```
DAY 0 - OWNER SETUP
├─ 09:00 AM: Rajesh Kumar creates account
├─ 09:05 AM: System assigns to Unit A-101
├─ 09:10 AM: Rajesh sees "My Properties: A-101"
└─ Status: ✅ Owner registered


DAY 0 - TENANT INVITATION (Same day - 02:00 PM)
├─ 02:00 PM: Rajesh clicks "Invite Tenant"
├─ 02:01 PM: Modal opens - enter tenant email
├─ 02:02 PM: Rajesh enters "priya@email.com"
├─ 02:03 PM: System generates code: ABC123XYZ
├─ 02:04 PM: Email sent to priya@email.com
│            Subject: "Rajesh Kumar invites you to property A-101"
│            Body: "Click link to join: /join-property/ABC123XYZ"
└─ Status: ⏳ Invitation pending


DAY 1 - TENANT ACCEPTANCE (Next day - 10:00 AM)
├─ 10:00 AM: Priya clicks email link
├─ 10:01 AM: Redirected to /join-property/ABC123XYZ
├─ 10:02 AM: Validation: Code exists, not expired ✅
├─ 10:03 AM: Shows: "Join Unit A-101 (Owner: Rajesh Kumar)"
├─ 10:04 AM: Priya fills signup form
├─ 10:05 AM: Account created - Role: "Tenant"
├─ 10:06 AM: System auto-sets ownerId = "rajesh-resident-id"
├─ 10:07 AM: Database links: Unit A-101 → Rajesh (owner) + Priya (tenant)
├─ 10:08 AM: Email confirmation sent to Priya
├─ 10:09 AM: Email notification sent to Rajesh
└─ Status: ✅ Connection complete!


DAY 1+ - SYSTEM SHOWS RELATIONSHIP
├─ Admin sees: A-101 → Rajesh (Owner) + Priya (Tenant)
├─ Rajesh sees: "My Properties: A-101 (Tenant: Priya Sharma)"
├─ Priya sees: "My Units: A-101 (Owner: Rajesh Kumar)"
└─ Status: ✅ Active relationship
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Owner Dashboard                             │
│                                                                   │
│  My Properties: ┌─────────────────────────────────────────┐    │
│                 │  A-101 (2BHK Flat)                       │    │
│                 │  Status: Rented to Tenant                │    │
│                 │  Current Tenant: Priya Sharma            │    │
│                 │  Lease Ends: 2024-12-31                  │    │
│                 │                                          │    │
│                 │  [View Details] [Invite New Tenant]     │    │
│                 └─────────────────────────────────────────┘    │
│                                                                   │
│  [Save] [Edit] [Cancel]                                          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Database Update     │
                    │                      │
                    │ UPDATE Resident      │
                    │ SET ownerId = null   │ (for owner)
                    │ WHERE id = rajesh-1  │
                    │                      │
                    │ INSERT TenantInvite  │
                    │ code = ABC123XYZ     │
                    │ ownerId = rajesh-1   │
                    │ unitId = a101        │
                    └──────────────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Email Service       │
                    │  Send to: priya@...  │
                    │  Code: ABC123XYZ     │
                    │  Link: /join/...     │
                    └──────────────────────┘
                              ▼
           ┌────────────────────────────────────┐
           │       Tenant Email                  │
           │                                     │
           │  Hi Priya,                          │
           │                                     │
           │  Rajesh Kumar has invited you       │
           │  to join property A-101            │
           │                                     │
           │  [Click to Accept]                 │
           │  Link: /join/ABC123XYZ             │
           └────────────────────────────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Tenant Signup Page  │
                    │                      │
                    │  Property: A-101     │
                    │  Owner: Rajesh Kumar │
                    │                      │
                    │  [Signup Form]       │
                    │  Name: ___           │
                    │  Email: ___          │
                    │  Phone: ___          │
                    │  Password: ___       │
                    │                      │
                    │  [Create Account]    │
                    └──────────────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Final Link Created  │
                    │                      │
                    │ Unit A-101:          │
                    │ ├─ Owner: Rajesh     │
                    │ └─ Tenant: Priya     │
                    │                      │
                    │ Resident.ownerId:    │
                    │ priya → "rajesh-1"   │
                    └──────────────────────┘
```

## Admin Dashboard View

```
┌────────────────────────────────────────────────────────────────────┐
│                  Property-Tenant Mapping View                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  UNIT A-101 (2BHK Flat)                                             │
│  ├─ Owner: Rajesh Kumar (Resident ID: R001)                        │
│  ├─ Owner Email: rajesh@email.com                                  │
│  ├─ Owner Phone: 98765 43210                                       │
│  ├─ Payment Status: PAID ✅                                        │
│  │                                                                  │
│  ├─ Tenant: Priya Sharma (Resident ID: R002)                       │
│  ├─ Tenant Email: priya@email.com                                  │
│  ├─ Tenant Phone: 98765 54321                                      │
│  ├─ Lease Start: 2024-01-01                                        │
│  ├─ Lease End: 2024-12-31                                          │
│  ├─ Payment Status: PENDING ⚠️                                     │
│  │                                                                  │
│  ├─ [View Owner Details] [View Tenant Details]                    │
│  ├─ [Modify Mapping] [Terminate Lease]                            │
│  └─ [View Payment Split]                                          │
│                                                                      │
│  UNIT B-202 (1BHK Flat)                                             │
│  ├─ Owner: Amit Patel (Resident ID: R003)                         │
│  ├─ Status: OWNER-OCCUPIED ✅                                      │
│  ├─ No Tenant (Available)                                          │
│  └─ [Invite/Link Tenant]                                          │
│                                                                      │
│  UNIT C-301 (3BHK Bungalow)                                         │
│  ├─ Owner: Suresh Iyer (Resident ID: R004)                        │
│  ├─ Tenant 1: Neha Verma (Resident ID: R005)                      │
│  ├─ Tenant 2: Vikram Singh (Resident ID: R006)                    │
│  ├─ Status: SHARED OCCUPANCY 👥                                    │
│  └─ [View Details] [Modify Permissions]                           │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

## Tenant View

```
┌────────────────────────────────────────────────────────┐
│            My Rented Properties (Tenant)               │
├────────────────────────────────────────────────────────┤
│                                                         │
│  UNIT A-101                                            │
│  ├─ Address: Rosewood Apartments, Mumbai              │
│  ├─ Owner: Rajesh Kumar                               │
│  ├─ Owner Contact: 98765 43210                        │
│  ├─ Lease Period: Jan 1, 2024 - Dec 31, 2024         │
│  ├─ Days Remaining: 180 days                          │
│  │                                                    │
│  ├─ Payment Info:                                     │
│  │  ├─ Rent: ₹15,000/month                           │
│  │  ├─ Due Date: 25th of every month                 │
│  │  ├─ Status: PENDING (Due in 3 days)               │
│  │  └─ [Pay Now]                                     │
│  │                                                    │
│  ├─ [View Owner Details]                             │
│  ├─ [Contact Owner]                                  │
│  ├─ [View Property Details]                          │
│  ├─ [Submit Maintenance Request]                     │
│  └─ [Download Lease Agreement]                       │
│                                                         │
└────────────────────────────────────────────────────────┘
```

