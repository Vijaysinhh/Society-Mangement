import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function indiaBoundaries(now = new Date()) {
  const offset = 330 * 60 * 1000
  const india = new Date(now.getTime() + offset)
  const year = india.getUTCFullYear()
  const month = india.getUTCMonth()
  const day = india.getUTCDate()
  return {
    today: new Date(Date.UTC(year, month, day) - offset).toISOString(),
    tomorrow: new Date(Date.UTC(year, month, day + 1) - offset).toISOString(),
    monthStart: new Date(Date.UTC(year, month, 1) - offset).toISOString(),
    billingPeriod: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    minutesNow: india.getUTCHours() * 60 + india.getUTCMinutes(),
  }
}

function isInShift(start: string, end: string, minutesNow: number) {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
    return hours * 60 + minutes
  }
  const shiftStart = toMinutes(start)
  const shiftEnd = toMinutes(end)
  return shiftStart <= shiftEnd
    ? minutesNow >= shiftStart && minutesNow < shiftEnd
    : minutesNow >= shiftStart || minutesNow < shiftEnd
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()

    const bounds = indiaBoundaries()
    const [adminResult, unitsResult, residentsResult, billsResult, issuesResult, visitorsResult, watchmenResult, activityResult] = await Promise.all([
      supabaseAdmin.from('society_admins').select('holder_name, post_name').eq('id', session.accountId).eq('society_id', session.societyId).single(),
      supabaseAdmin.from('units').select('id, unit_number, lifecycle_status, unit_assignments(id, status)').eq('society_id', session.societyId).neq('lifecycle_status', 'inactive'),
      supabaseAdmin.from('residents').select('id', { count: 'exact', head: true }).eq('society_id', session.societyId).eq('status', 'active'),
      supabaseAdmin.from('maintenance_bills').select('amount, status, unit_id').eq('society_id', session.societyId).eq('billing_period', bounds.billingPeriod).neq('status', 'void'),
      supabaseAdmin.from('issues').select('id, status, priority').eq('society_id', session.societyId).in('status', ['open', 'in_progress']),
      supabaseAdmin.from('visitor_requests').select('id, status, requested_at, checked_in_at, checked_out_at').eq('society_id', session.societyId).gte('requested_at', bounds.monthStart),
      supabaseAdmin.from('watchmen').select('id, name, phone, assigned_area, watchman_shifts(shift_start, shift_end, status)').eq('society_id', session.societyId).eq('status', 'active'),
      supabaseAdmin.from('audit_events').select('id, action, entity_type, metadata, created_at').eq('society_id', session.societyId).neq('action', 'auth.login_failed').order('created_at', { ascending: false }).limit(8),
    ])

    const firstError = [adminResult, unitsResult, residentsResult, billsResult, issuesResult, visitorsResult, watchmenResult, activityResult].find((result) => result.error)?.error
    if (firstError) return response.error(firstError.message, 400)

    const units = unitsResult.data || []
    const activeUnits = units.filter((unit) => unit.lifecycle_status === 'active')
    const occupiedUnits = activeUnits.filter((unit) => {
      const assignments = Array.isArray(unit.unit_assignments) ? unit.unit_assignments : []
      return assignments.some((assignment) => assignment.status === 'active')
    }).length
    const bills = billsResult.data || []
    const collectionTarget = bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0)
    const collectionAmount = bills.filter((bill) => bill.status === 'paid').reduce((sum, bill) => sum + Number(bill.amount || 0), 0)
    const outstandingBills = bills.filter((bill) => ['unpaid', 'payment_pending'].includes(bill.status))
    const issues = issuesResult.data || []
    const visitors = visitorsResult.data || []
    const todayVisitors = visitors.filter((visitor) => visitor.requested_at >= bounds.today && visitor.requested_at < bounds.tomorrow)

    const onDuty = (watchmenResult.data || []).flatMap((watchman) => {
      const shifts = Array.isArray(watchman.watchman_shifts) ? watchman.watchman_shifts : []
      const shift = shifts.find((item) => item.status === 'active' && isInShift(item.shift_start, item.shift_end, bounds.minutesNow))
      return shift ? [{ id: watchman.id, name: watchman.name, phone: watchman.phone, area: watchman.assigned_area || 'Society premises', shiftStart: shift.shift_start.slice(0, 5), shiftEnd: shift.shift_end.slice(0, 5) }] : []
    })

    const unitNumbers = new Map(units.map((unit) => [unit.id, unit.unit_number]))
    const actionLabels: Record<string, string> = {
      'bill.created': 'Maintenance bill created',
      'payment.submitted': 'Payment submitted',
      'issue.created': 'Issue reported',
      'parcel.received': 'Parcel received',
      'parcel.collected': 'Parcel collected',
      'resident_invitation.created': 'Resident invitation created',
      'unit.created': 'Property created',
      'visitor.requested': 'Visitor request created',
      'watchman.created': 'Watchman account created',
      'watchman.updated': 'Watchman account updated',
      'society_admin.profile_updated': 'Admin profile updated',
    }
    const activity = (activityResult.data || []).map((event) => {
      const metadata = (event.metadata || {}) as Record<string, unknown>
      const unitId = typeof metadata.unit_id === 'string' ? metadata.unit_id : ''
      return {
        id: event.id,
        action: event.action,
        title: actionLabels[event.action] || event.action.replace(/[._]/g, ' '),
        description: unitId && unitNumbers.get(unitId) ? `Unit ${unitNumbers.get(unitId)}` : event.entity_type.replace(/_/g, ' '),
        amount: typeof metadata.amount === 'number' ? metadata.amount : null,
        createdAt: event.created_at,
      }
    })

    return response.success({
      firstName: adminResult.data?.holder_name?.trim().split(/\s+/)[0] || adminResult.data?.post_name || 'Admin',
      metrics: {
        totalUnits: units.length,
        occupiedUnits,
        vacantUnits: activeUnits.length - occupiedUnits,
        totalResidents: residentsResult.count || 0,
        collectionAmount,
        collectionTarget,
        collectionPercent: collectionTarget > 0 ? Math.round((collectionAmount / collectionTarget) * 100) : 0,
        outstandingDues: new Set(outstandingBills.map((bill) => bill.unit_id)).size,
        outstandingAmount: outstandingBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
        maintenanceIssues: issues.length,
        highPriority: issues.filter((issue) => ['high', 'urgent'].includes(issue.priority)).length,
      },
      visitors: {
        totalToday: todayVisitors.length,
        checkedInToday: visitors.filter((visitor) => visitor.checked_in_at && visitor.checked_in_at >= bounds.today && visitor.checked_in_at < bounds.tomorrow).length,
        checkedOutToday: visitors.filter((visitor) => visitor.checked_out_at && visitor.checked_out_at >= bounds.today && visitor.checked_out_at < bounds.tomorrow).length,
        deniedThisMonth: visitors.filter((visitor) => visitor.status === 'denied').length,
      },
      securityAlerts: { repeatedRejected: 0, blacklistedAttempts: 0 },
      onDuty,
      activity,
    })
  } catch (error) {
    console.error('[Society admin dashboard] GET failed:', error)
    return response.serverError()
  }
}
