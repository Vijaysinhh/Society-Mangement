# System Architecture - Questions & Answers

## ROUTING & URL STRUCTURE

### Q1: How does the dynamic /{societyName} routing work?
**A:** Using Next.js dynamic route `[societyName]` parameter, which becomes:
- /{societyName}/resident/login
- /{societyName}/resident/dashboard
- /{societyName}/watchman/login
- /{societyName}/watchman/dashboard
- /{societyName}/societyadmin/login
- /{societyName}/societyadmin/dashboard

The societyName is a URL-safe slug generated when creating a society.

### Q2: What happens if someone visits /{randomName}/resident/dashboard without valid society?
**A:** Middleware checks if token.societyId matches the database societyId for that society slug. If society doesn't exist or societyId doesn't match, request is denied.

### Q3: Can a resident access /superadmin-dashboard?
**A:** No. Middleware checks token.role. If role="resident" but trying to access superadmin route, access denied.

---

## AUTHENTICATION & SESSION

### Q4: User logs in on Phone, then on Laptop. What happens?
**A:** Both get unique JWT tokens. Both tokens are valid. No conflicts. Each device maintains independent session.

### Q5: Resident forgets to logout on a library computer. What's the risk?
**A:** ⚠️ MAJOR RISK. Token has no expiry, so anyone with that device has permanent access until resident manually logs out. Need to:
- Add logout button visibility in all dashboards
- Consider adding device/session management to revoke specific tokens
- OR add optional PIN/biometric for sensitive operations

### Q6: Can we revoke a token?
**A:** Currently NO - tokens have no expiry. Options to add revocation:
1. Maintain blacklist of revoked tokens in Redis
2. Add version number to tokens, check against DB
3. Add expiry after all (defeats no-expiry goal)

### Q7: What if resident changes password? Old tokens still work?
**A:** YES - we don't validate password hash against token. Only verify JWT signature. If want to force re-auth on password change, need to:
- Add password_version field to users table
- Include in token
- Validate on each request

---

## DATA ISOLATION & MULTI-TENANCY

### Q8: How do we ensure Resident A can't see Resident B's data from same society?
**A:** In queries, filter by resident_id AND society_id:
```sql
SELECT * FROM visitors 
WHERE society_id = ? 
  AND (resident_id = ? OR watchman_id = ?)
```

### Q9: What if database query doesn't include society_id filter?
**A:** 🚨 MAJOR BUG. All residents see all data from society. Need code review process to catch this.

### Q10: Should we use Supabase RLS policies?
**A:** YES - add RLS as second layer of protection:
```sql
CREATE POLICY resident_can_see_own_visitors ON visitors
  USING (
    (resident_id = auth.uid() AND society_id = (SELECT society_id FROM residents WHERE id = auth.uid()))
  )
```

---

## TOKEN & JWT

### Q11: Where is JWT secret stored?
**A:** Environment variable `JWT_SECRET`. Must be:
- ✅ At least 32 characters
- ✅ Different per environment (dev, staging, prod)
- ✅ Rotated periodically
- ❌ NOT in code/git

### Q12: If JWT_SECRET is compromised, what happens?
**A:** Attacker can forge any JWT token impersonating any user. Need to:
- Immediately rotate secret (all old tokens invalid)
- Force all users to re-login
- Investigate how secret leaked

### Q13: Can token be decrypted to read data?
**A:** NO - JWT is only SIGNED, not encrypted. Anyone can read the payload. So don't put sensitive data in token like:
- ❌ password_hash
- ❌ payment info
- ✅ safe: userId, email, role, societyId

---

## MULTI-DEVICE & MULTI-LOGIN

### Q14: Same resident logs in 3x. How many tokens?
**A:** 3 tokens. Each is independent:
- Token 1 on Phone
- Token 2 on Tablet  
- Token 3 on Laptop

Each can access dashboards independently. No session sharing.

### Q15: How do we handle "Log me out on all devices"?
**A:** Currently IMPOSSIBLE with no-expiry tokens. To implement:
1. Add device_id to token
2. On "logout all", update user.session_version in DB
3. Validate session_version in middleware
4. All old tokens invalid

### Q16: If device stolen with active session, can we disable that specific device?
**A:** Only if we track device_id in token:
```json
{
  userId: "...",
  device_id: "unique_device_hash",
  ...
}
```
Then maintain `revoked_devices` table. But adds complexity.

---

## BILLING & FINANCIAL

### Q17: Bill tied to property or resident?
**A:** Property. Because:
- Property owner responsible for utilities
- Rent paid by current resident(s)
- If resident moves out, someone else pays

### Q18: How do we track bill payments across residents?
**A:** 
- Bill belongs to property_id
- Payment record belongs to bill_id (could be multiple residents if shared account)
- Maintain payment_history table

### Q19: What if property has no resident? Do we bill?
**A:** Based on bill_type:
- Maintenance: YES (building charge)
- Utilities: Maybe (depends on rules)
- Parking: NO (nobody using)

### Q20: How to handle bounced checks or failed payments?
**A:** Track in payments table:
```sql
status: "pending" | "completed" | "failed" | "refunded"
error_code: "nsf" | "expired_card" | etc
retry_count: 0
next_retry: null
```

---

## VISITOR MANAGEMENT

### Q21: Why do residents need to approve visitor photos?
**A:** Security + identity verification:
- Resident confirms they know the visitor
- Photo on record for security
- Watchman can verify before entry

### Q22: What if resident approves visitor but watchman rejects at gate?
**A:** Two levels of security. Resident can:
- Complain about watchman decision
- Create appeal request
- Emergency scenarios handled by society admin

### Q23: Can visitor enter without resident approval?
**A:** No - should be blocked. Unless:
- Pre-approved list (frequent visitors)
- Emergency (ambulance, fire)
- Society admin override

### Q24: How long is visitor photo kept?
**A:** Depends on policy:
- Delete after checkout? (no audit trail)
- Keep for 30 days? (storage cost)
- Keep forever? (privacy concern)
- Keep on demand? (GDPR compliance)

---

## WATCHMAN & GATE MANAGEMENT

### Q25: Can watchman see residents' personal info?
**A:** Depends on design:
- ✅ Resident name, phone, property
- ❌ Payment info, complaint details
- Need to implement field-level filtering

### Q26: Can watchman create visitors on behalf of resident?
**A:** Depends on policy. Options:
- NO (resident only)
- YES with resident notification
- YES with approval queue

### Q27: How to prevent watchman time fraud?
**A:** Track:
- Check-in timestamp (automatic)
- Check-out timestamp (automatic)
- GPS location (if available)
- Photos (if available)
- Create duty_log with audit trail

### Q28: Multiple watchmen same gate same time - who's responsible?
**A:** Assign shift + gate combination:
```sql
watchman_id + society_id + gate_id + shift_time
```
Track who did what action on audit_log.

---

## SOCIETY ADMIN & PERMISSIONS

### Q29: Can society admin delete residents?
**A:** Depends on permissions:
- Soft delete (mark inactive) - safer
- Hard delete - permanent
- Archive (keep for audit, hide from views)

### Q30: Can society admin change bills?
**A:** Depends on permissions:
- No write access (superadmin only)
- Can adjust for disputes
- Need approval workflow

### Q31: How many society admins per society?
**A:** Options:
- Single admin (simple, risky)
- Multiple admins (needs permission hierarchy)
- Admin + Co-admin (defined roles)

### Q32: Can society admin transfer to new admin?
**A:** Yes, need process:
1. Create new admin account
2. Grant all permissions
3. Remove old admin permissions
4. Archive old admin account
5. Log audit trail

---

## EDGE CASES & ERROR HANDLING

### Q33: Resident approved visitor, then removed the visitor before check-in. What happens?
**A:** Visitor tries to enter:
- Watchman can't find approval
- Visitor denied entry
- Log incident
- Notify resident

### Q34: Bill due date passes but resident didn't pay. Who gets notified?
**A:** Notification recipients:
1. Resident (reminder)
2. Society admin (overdue alert)
3. Finance team (collection queue)

### Q35: Watchman on duty leaves without finishing shift. What happens?
**A:** Missing checkout entry. Options:
- Alert supervisor
- Mark as abandoned shift
- Flag for manual review
- Security concern

### Q36: Visitor doesn't check out. How long can they stay?
**A:** Need policy:
- Auto checkout at shift end?
- Next visitor checkin auto-checkouts previous?
- Alert after X hours?

### Q37: Network fails. Watchman can't access app at gate. What do they do?
**A:** Offline mode needed:
- Queue visitor entries locally
- Sync when network returns
- Manual logbook backup

---

## TECHNICAL DEBT

### Q38: Should we add API versioning?
**A:** YES - for when we change endpoints:
- /api/v1/residents
- /api/v2/residents (with new response format)
- Maintain backward compatibility

### Q39: How to handle database migrations in production?
**A:** Use migration tool like Supabase migrations:
- Version each migration
- Run in order
- Rollback capability
- Test in staging first

### Q40: How to monitor system health?
**A:** Add:
- Error tracking (Sentry, LogRocket)
- Performance monitoring (timing)
- Database query logs
- API endpoint metrics

---

## RECOMMENDATIONS SUMMARY

| Priority | Task | Reason |
|----------|------|--------|
| CRITICAL | Create DB migrations | Foundation for everything |
| CRITICAL | Implement RLS policies | Multi-tenancy security |
| CRITICAL | Add logout everywhere | Session security |
| HIGH | Implement device tracking | Session management |
| HIGH | Add error handling | User experience |
| HIGH | Finish society admin dashboard | Core feature |
| MEDIUM | Add API pagination | Performance |
| MEDIUM | Add notifications | UX improvement |
| MEDIUM | Implement payment integration | Revenue functionality |
| MEDIUM | Add audit logging | Compliance |
| LOW | Add offline mode | Watchman UX |
| LOW | Add analytics | Business intelligence |

