# Society Admin current functionality audit

## Scope and verification method

Read-only static review of the current Society Admin route, shell, all navigable sections, finance sub-tabs, supporting API routes, and migrations through `009_billing_workflow.sql`. The review maps visible controls to persistent backend behavior. No dashboard product file or visual design was changed. Browser interaction, narrow-width rendering, keyboard testing, and live database mutation tests were not performed in this audit.

## Executive read

The Society Admin dashboard has several complete production-backed vertical slices: authenticated society context, unit listing/creation, resident signup links, watchman accounts, visitor history, parcel tracking, issue handling, and live maintenance billing. However, the main Dashboard, notifications, search, Schedule, Community, Profile, and most original Finance tools still present demo data or local-only actions as if they were persistent operations.

The existing information architecture and UI should be preserved. Implementation should replace each component's data source and handlers in place, one domain at a time, without substituting new screens or removing original sections.

## What works and should be preserved

- The Society Admin shell and navigation expose the correct operational domains.
- Tenant identity comes from `/api/society-admin/context`; the page no longer trusts a URL or browser-selected society.
- Properties and residents remain organized around the unit, which matches the database model.
- Resident self-onboarding uses a server-generated, expiring invitation link.
- Watchman account creation, editing, deactivation, and credential delivery use authenticated APIs and hashed passwords.
- Visitor history is society-scoped and refreshes from the live visitor workflow.
- Parcel tracking, issue management, and live billing expose honest loading, empty, and error states.
- The recovered Finance layouts and their original Overview, Maintenance, Amenities, Transactions, My Finances, and Society sections remain present.

## Current functionality map

| Area | Status | Current evidence | Next backend work |
|---|---|---|---|
| Society context | Working | `app/society-admin/page.tsx:39-58` loads authenticated context. | None beyond runtime regression tests. |
| Dashboard | Working | `DashboardMobile.tsx` loads the session-scoped `/api/society-admin/dashboard` aggregate; parcel tracking remains connected through `/api/parcels`. | Runtime-test aggregate values against the development database. |
| Properties | Partially working | Unit listing/creation, resident access revocation, assignment history, resident-submitted vehicles, and admin vehicle edit/remove are persistent and society-scoped. | Apply migration 010, runtime-test vehicle onboarding, then connect real billing status. |
| Resident invitations | Working | `PropertyResidentsUnified.tsx:90-109` calls `/api/resident-invitations`; the API creates a society-scoped expiring token. | Add invitation history/revoke only if exposed without redesign. |
| Watchman accounts | Working | `WatchmanMobile.tsx:125-199` loads and mutates `/api/watchmen`; credentials are shown after creation. | Runtime-test all edit/deactivate/login paths. |
| Watchman duty/incident details | Demo-only | `WatchmanMobile.tsx:48-100` uses `mockDutyLogs` and `mockIncidents`. | Add duty-log and incident persistence, then feed the existing panels. |
| Visitors | Working | `VisitorsMobile.tsx:10-17` loads `/api/visitor-requests` and uses live refresh. | Add filtering/export only if existing UI calls for it. |
| Parcels | Working read view | `ParcelTracking.tsx:10-17` reads `/api/parcels`; watchman/resident perform mutations elsewhere. | Runtime-test society-wide visibility. |
| Issues | Working | `IssuesMobile.tsx:10-13` reads and updates `/api/complaints`. | Add assignment/history only if required by the existing interface. |
| Finance: Live Billing | Working | `ConnectedMaintenanceBilling.tsx:21-24` reads/creates bills and reviews payments. | Runtime-test proof viewing and all review decisions. |
| Finance: original four tabs | Demo/local-only | `components/tabs/OverviewReportsTab.tsx:16-32`, `MaintenanceFeeTab.tsx:15-33`, `AmenitiesBookingsTab.tsx:15-24`, and `TransactionsTab.tsx:15-52` define mock records. | Connect each existing tab progressively; do not remove or replace them. |
| Schedule | Demo/local-only and unreachable from main menu | `ScheduleMobile.tsx:17-48` initializes mock schedules; `AdminLayout.tsx:24-32` has no Schedule navigation item. | Decide whether Schedule belongs in the locked navigation; then persist shifts through the existing UI. |
| Community | Demo/local-only | `CommunityMobile.tsx:30-75` seeds posts and guidelines; mutations only change React state. | Add announcements/posts/guidelines schema and APIs. |
| Profile | Working | `ProfileMobile.tsx` loads authenticated context, persists the post holder name, changes the password through `/api/auth/change-password`, and logs out through `/api/auth/logout`. | Runtime-test successful and rejected password changes with a real session. |
| Notifications | Demo/local-only | `page.tsx:27-36` defines fixed alerts and unread counts. | Generate notifications from real issues, bills, visitors, and system events. |
| Global search | Non-functional | `page.tsx:101` only logs the query. | Search units/residents/watchmen or route the query into the active existing section. |

## Scorecard

| Dimension | Score | Reason |
|---|---:|---|
| Product clarity and prompt fidelity | 3/4 | The dashboard clearly represents society operations and matches the intended roles. |
| Information hierarchy and composition | 3/4 | Existing surfaces are organized well and must be preserved. |
| Task flow, affordance, and feedback | 2/4 | Connected flows generally have feedback, but many visible actions remain local-only or inert. |
| Component and visual consistency | 3/4 | The original design language is coherent after restoration; connected panels are additions rather than replacements. |
| Real-data resilience | 2/4 | Connected domains have loading/error/empty states; large sections still rely on fixtures. |
| Tenant and authorization safety | 3/4 | Current core APIs derive society from the authenticated session and scope queries accordingly. |
| Credibility | 1/4 | Fixed names, financial figures, notifications, schedules, and activity are presented alongside live data without a demo label. |
| Accessibility and responsive behavior | Pending | Static inspection alone cannot verify keyboard, focus, zoom, reflow, or assistive technology behavior. |

## Findings

| ID | Severity | Area | Location / evidence | Current behavior | Proposed correction | User impact |
|---|---|---|---|---|---|---|
| SA-C01 | RESOLVED | Dashboard credibility | `DashboardMobile.tsx`, `app/api/society-admin/dashboard/route.ts` | Existing dashboard cards now show society-scoped units, residents, billing, issues, visitors, scheduled watchmen, and audit activity. Unsupported security-alert counts use an honest empty state. | Runtime regression-test aggregate values with a real Society Admin session. | Invented operational figures have been removed from the main dashboard. |
| SA-C02 | RESOLVED | Account security | `ProfileMobile.tsx`, `app/api/society-admin/context/route.ts`, `page.tsx` | The existing Profile UI now uses authenticated account data and persistent edit/password/logout actions. | Runtime regression-test success and failure paths with a real session. | The previously misleading account actions are now connected. |
| SA-C03 | RESOLVED | Resident access | `PropertyResidentsUnified.tsx`, `app/api/residents/[id]/access/route.ts` | Revocation is confirmed, ends only the selected property assignment, preserves history, deactivates accounts with no remaining assignment, revokes their sessions, and creates an audit event. | Runtime-test with residents holding one and multiple property assignments. | Revocation is now persistent and immediately enforced by session validation. |
| SA-C04 | MEDIUM | Finance | Finance tab components listed above | Original finance controls and reports operate on mock/local arrays; only Live Billing persists. | Connect Overview and Maintenance to `maintenance_bills`/`bill_payments`, then add ledger and amenities data models for Transactions and Amenities. | Figures conflict with real bills and changes disappear after refresh. |
| SA-C05 | MEDIUM | Watchman operations | `WatchmanMobile.tsx:48-100`, `259`, `377` | Account records are real but duty logs and incidents are fixtures. | Add duty/incident tables and APIs; calculate summaries in the existing panels. | Admin cannot rely on attendance or incident information. |
| SA-C06 | RESOLVED | Property vehicles | `ResidentSignupForm.tsx`, `010_resident_vehicle_onboarding.sql`, `PropertyResidentsUnified.tsx`, `app/api/vehicles/[id]/route.ts` | Residents optionally submit multiple vehicles during atomic signup; Society Admin can view owner/details, edit, or soft-remove them but cannot create vehicles. | Apply migration 010 and runtime-test signup, duplicate registration, editing, removal, and refresh persistence. | Vehicle ownership now originates from the resident and remains manageable and auditable by the Society Admin. |
| SA-C07 | MEDIUM | Schedule | `ScheduleMobile.tsx:17-48`; `AdminLayout.tsx:24-32` | Schedule is local-only and cannot be reached through main navigation. | Confirm intended navigation placement, then connect the existing schedule editor to `watchman_shifts`. | A completed-looking feature is inaccessible and non-persistent. |
| SA-C08 | MEDIUM | Community | `CommunityMobile.tsx:30-75` | Posts and guidelines are fixtures and CRUD is local-only. | Add tenant-scoped community tables/APIs and retain the existing board/guidelines UI. | Announcements and rules disappear on refresh. |
| SA-C09 | MEDIUM | Notifications and search | `page.tsx:27-36`, `101` | Notifications are fixed; global search only logs text. | Build derived notifications and connect search to existing records. | Prominent controls give misleading feedback or no result. |
| SA-C10 | LOW | Source/UI text integrity | Multiple current TSX files contain mojibake sequences such as `Â·` or malformed rupee/emoji strings. | Correct only corrupted text bytes in place after a rendered comparison; do not restyle components. | Text can display as broken symbols and reduce credibility. |

## Prioritized implementation plan

### Now

1. Connect real maintenance-bill status and amount to the existing property cards and portfolio collection summary.
2. Runtime-test Properties, Dashboard, and Profile with a real Society Admin session.

### Next

1. Connect the original Finance Overview and Maintenance tabs to the existing billing tables.
2. Add real watchman duty logs/incidents and connect the existing Watchman panels.
3. Make the existing Schedule reachable and persist it through `watchman_shifts`, subject to confirmation that it belongs in navigation.

### Later

1. Add ledger/expense support for Finance Transactions.
2. Add amenities and bookings persistence.
3. Add Community persistence, notifications, and global search.

## Verification gaps and assumptions

- No authenticated browser walkthrough was executed, so this report does not claim that connected workflows are visually or operationally regression-free.
- No keyboard-only, screen-reader, 200% zoom, 320 CSS-pixel, RTL, or reduced-motion checks were performed.
- Static review confirms API calls and authorization checks, but not the current development database state for every table.
- The existing Schedule component is treated as intended functionality because the page supports a `schedule` view, although the locked navigation currently omits it. Product confirmation is required before changing navigation.
- The original Finance tabs contain deliberate prototype data. They should remain visually intact while their data and handlers are replaced.

## Rejected alternatives

- Replacing incomplete screens with newly designed dashboards was rejected because the existing UI/UX is locked.
- Removing mock-only sections was rejected because they represent intended frontend requirements and should instead be connected in place.
- Merging Live Billing into the original Maintenance tab during this audit was rejected because this turn is read-only and requires runtime comparison before implementation.

## Verdict

**Block for production release.** Core operational slices work, but the dashboard and account-security surfaces are misleading or non-functional, and several prominent modules remain local-only. The existing frontend is suitable as the locked implementation target.
