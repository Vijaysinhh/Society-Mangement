# Society Admin frontend and backend integration review

## Scope and verification method

Static review of the existing Society Admin shell, property/resident workflow, watchman workflow, visitor workflow, current API routes, and the clean platform migration. No product UI or behavior was changed during this review. Runtime task walkthrough was limited because the reviewed flows currently operate only on in-memory sample data.

## Executive read

The existing frontend already expresses the intended product: a society administrator manages properties and residents together, creates time-limited resident invitations, creates watchman credentials, and monitors duty and visitor operations. It should be preserved, but it is not yet connected to the authenticated tenant or the clean database; currently successful-looking actions usually change only React state and disappear after refresh.

The safest production path is to connect one complete domain slice at a time, starting with authenticated society context and property/unit records, then resident invitations, then watchman accounts. Existing legacy APIs should not be reused as-is because they trust client-supplied society IDs, use incompatible authentication helpers, and reference tables absent from `001_platform_foundation.sql`.

## What works and should be preserved

- The `Properties & Residents` surface keeps the unit as the central domain object and shows owner, tenants, vehicles, payment status, and assignment history together.
- Resident invitation is initiated from a selected property, which matches the required business rule that a resident belongs to a society and a unit.
- The watchman surface already captures the needed account and operations concepts: name, phone/username, password, address, shift times, assigned area, status, duty log, and schedule.
- The main dashboard navigation already contains the correct operating areas: dashboard, properties, finances, issues, watchmen, visitors, and community.
- The foundation authentication correctly limits a society-admin session to one `society_id`; this should become the only source of tenant identity.

## Scorecard

| Dimension | Score | Reason |
|---|---:|---|
| Product clarity and fidelity | 3/4 | The intended operational model is visible and specific. |
| Information hierarchy | 3/4 | Properties and watchman tools are organized around recognizable tasks. |
| Task flow and feedback | 2/4 | Flows appear complete but only mutate local state and rely on alerts. |
| Real-data resilience | 0/4 | No loading, database error, stale-data, or permission behavior exists in the primary flows. |
| Credibility | 1/4 | Large amounts of invented operational and financial data are presented as real. |
| Tenant/security readiness | 0/4 | The page and legacy APIs accept browser-controlled society identifiers. |

## Findings

| ID | Severity | Area | Location / evidence | Current behavior | Proposed correction | User impact |
|---|---|---|---|---|---|---|
| SA-01 | HIGH | Tenant isolation | `app/society-admin/page.tsx:19-43` | Defaults to `society-001`, accepts `?id=`, and reads society name from localStorage. | Add a session-scoped `/api/society-admin/context` endpoint and derive `society_id` only from `getRequestSession`. Never accept tenant selection from the client. | A logged-in admin can request or display another tenant ID. |
| SA-02 | HIGH | Resident invitations | `PropertyResidentsUnified.tsx:60-75`, `930-987`, `1050-1074` | Creates a random browser token and a URL for a route that does not exist; invitations vanish on refresh and are not securely hashed or redeemable. The footer can also create a general invitation without a property. | Create `resident_invitations` with hashed token, society, unit, intended role, expiry, use/revoke timestamps, and creator. Generate only server-side for a selected unit and add a public redemption route. Remove the property-less link path. | The displayed invitation cannot safely create a resident account and can mislead admins into sharing unusable access. |
| SA-03 | HIGH | Watchman credentials | `WatchmanMobile.tsx:48-85`, `146-208` | Hardcoded plaintext passwords are present in client source. New passwords are retained in React state and displayed in an alert; no database account or session is created. | Add a tenant-scoped watchmen table/API, hash passwords server-side, return credentials only at creation, and never return stored hashes/passwords. Use the existing session system for watchman login. | Credentials are insecure and created accounts cannot actually log in. |
| SA-04 | HIGH | Legacy APIs | `api/residents/route.ts`, `api/watchmen/route.ts`, `api/units/route.ts` | Routes accept caller-supplied `societyId` and use service-role access without verifying a society-admin session. | Replace with server-session authorization; obtain society ID from the session and reject cross-tenant IDs. Add role-specific permission checks for every mutation. | A caller could read or write another society's data if the missing tables were added unchanged. |
| SA-05 | HIGH | Login endpoints | `api/auth/resident-login/route.ts`, `api/auth/watchman-login/route.ts` | Both reference an undefined `db` variable, do not create an application session, and require a client-provided society ID. | Rebuild on `supabaseAdmin`, exact normalized account lookup, hashed password comparison, active society/account checks, and `createSession`. | Resident and watchman authentication cannot work. |
| SA-06 | HIGH | Database availability | `supabase/migrations/001_platform_foundation.sql:22-210` | Clean schema contains only superadmins, societies, society_admins, auth_sessions, and audit_events. Units, residents, invitations, watchmen, assignments, vehicles, duty logs, and visitors do not exist. | Add a new forward-only domain migration after agreeing on unit/resident ownership rules. | Existing backend routes fail against the clean database. |
| SA-07 | MEDIUM | Property management | `PropertyResidentsUnified.tsx:87-305`, `399-431` | Properties and assignments are sample objects; add property changes only local state. The form also rejects floor 0, which may be a valid ground floor. | Back the existing interface with units, occupancy assignments, and vehicles APIs; validate floor as nullable/non-negative rather than truthy. | Work disappears on refresh and valid ground-floor units may be rejected. |
| SA-08 | MEDIUM | Resident access lifecycle | `PropertyResidentsUnified.tsx:83-85`, `989-1045` | “Revoke access” removes a local array item with no confirmation, audit history, assignment end date, or session revocation. | Use status transitions, end active assignments, revoke sessions/invitations, preserve history, require confirmation, and audit the action. | Admins may believe access was revoked when it remains active. |
| SA-09 | MEDIUM | Watchman operations | `WatchmanMobile.tsx:87-144`, `212-540` | Duty history, incidents, visitor counts, attendance, schedules, and current month are hardcoded or random. | Hide unsupported metrics until their tables exist; then calculate from duty and visitor records. | Operational decisions are based on fabricated figures. |
| SA-10 | MEDIUM | Global dashboard credibility | `DashboardMobile.tsx`, `VisitorsMobile.tsx`, `society-admin/page.tsx:22-37` | Payments, occupancy, alerts, visitors, blacklist, and notifications are presented as actual activity but are sample state. | Introduce honest empty/not-configured states and connect each module only after its domain API exists. | The administrator cannot distinguish demonstration content from society records. |

## Required data model

### Property and resident foundation

- `units`: society, unit number, type, floor, area, bedrooms, bathrooms, lifecycle status.
- `resident_invitations`: society, unit, role, token hash, expiry, created by, redeemed/revoked timestamps.
- `residents`: society, login identity, password hash, name, phone, email, status.
- `unit_assignments`: unit, resident, owner/tenant/co-owner/caretaker role, start/end dates, status.
- `vehicles`: society, unit, resident/owner reference, registration number, status.

### Watchman foundation

- `watchmen`: society, username, password hash, name, phone, address, assigned area, status.
- `watchman_shifts`: watchman, start/end times, effective dates.
- Later: `watchman_duty_logs` and `watchman_incidents`.

Every tenant-owned table must contain `society_id`, use indexes that begin with `society_id`, and be accessed through session-scoped server routes. Password hashes and invitation token hashes must never be returned to clients.

## Intended production flows

### Resident invitation

1. Society admin opens an existing unit.
2. Admin chooses owner or tenant and creates an invitation.
3. Server derives society and creator from the session, creates a cryptographically random token, stores only its hash, and returns the one-time link.
4. Resident opens the link, sees the society/unit/role, enters account details, and submits.
5. A transaction creates the resident and unit assignment, marks the invitation used, and creates a resident session.
6. The unit immediately reflects its real occupants; revoke ends access without deleting history.

### Watchman account creation

1. Society admin opens Watchmen and enters name, phone, username, password, shift, and area.
2. Server derives society from the session, validates username uniqueness, hashes the password, and creates the account and initial shift atomically.
3. Credentials are shown once for secure sharing.
4. Watchman logs in through a universal `/watchman-login` route; the server creates a tenant-bound session.
5. Suspend revokes active sessions; deletion is represented as deactivation so duty/visitor history remains intact.

## Prioritized implementation plan

### Now

1. Add authenticated Society Admin context API and remove URL/localStorage tenant selection without redesigning the dashboard.
2. Add migration `002_society_operations_foundation.sql` for units, resident invitations, residents, assignments, vehicles, watchmen, and shifts.
3. Add tenant-scoped units API and connect the existing property list/add form.

### Next

1. Implement server-generated resident invitations and the redemption/signup page.
2. Connect Manage Residents and access revocation to resident/assignment/session records.
3. Connect the existing Add Watchman form and rebuild watchman login/session handling.

### Later

1. Add duty logs, incidents, visitors, blacklist, and real dashboard aggregates.
2. Connect finances, issues, community, schedules, and notifications domain by domain.

## Verification gaps and assumptions

- No browser-level walkthrough or keyboard/accessibility test was performed in this static backend-readiness review.
- Existing database migration has been treated as the source of truth; legacy documentation and unused API routes may describe abandoned schemas.
- Owner/tenant multiplicity, whether one resident may hold multiple units, and whether phone or username is the canonical resident login identifier require an explicit product decision before migration implementation.

## Rejected alternatives

- Replacing the dashboard was rejected because the existing frontend already expresses the intended product workflows.
- Reusing the legacy APIs unchanged was rejected because their authentication and schema assumptions conflict with the clean foundation.
- Creating residents directly from the admin form was rejected because the required product model is resident self-signup through a unit-bound invitation.

## Verdict

**Block for production integration.** Preserve the frontend, but do not expose its resident/watchman actions as functional until tenant-scoped tables, authenticated APIs, and real login/session flows exist.
