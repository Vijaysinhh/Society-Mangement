import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function relation<T>(value: T | T[] | null | undefined): T | undefined { return Array.isArray(value) ? value[0] : value || undefined }

async function buildNotifications(societyId: string) {
  if (!supabaseAdmin) return { notifications: [], error: 'Database not configured' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const upcoming = new Date(today); upcoming.setDate(upcoming.getDate() + 7)
  const recent = new Date(today); recent.setDate(recent.getDate() - 30)
  const [billsResult, issuesResult] = await Promise.all([
    supabaseAdmin.from('maintenance_bills').select('id, title, amount, due_date, status, updated_at, units!inner(unit_number, unit_assignments(status, residents(name)))').eq('society_id', societyId).neq('status', 'void').or(`status.in.(unpaid,payment_pending),and(status.eq.paid,updated_at.gte.${recent.toISOString()})`).order('due_date'),
    supabaseAdmin.from('issues').select('id, title, priority, status, created_at, units!inner(unit_number), residents!inner(name)').eq('society_id', societyId).in('status', ['open', 'in_progress']).in('priority', ['high', 'urgent']).order('created_at', { ascending: false }).limit(25),
  ])
  const firstError = billsResult.error || issuesResult.error
  if (firstError) return { notifications: [], error: firstError.message }
  const notifications: any[] = []
  for (const bill of billsResult.data || []) {
    const unit: any = relation(bill.units), assignments = Array.isArray(unit?.unit_assignments) ? unit.unit_assignments : []
    const activeAssignment = assignments.find((item: any) => item.status === 'active'), resident: any = relation(activeAssignment?.residents)
    const due = new Date(`${bill.due_date}T00:00:00`), days = Math.floor((today.getTime() - due.getTime()) / 86400000)
    if (bill.status === 'payment_pending') notifications.push({ id: `bill:${bill.id}:payment_pending`, type: 'action-needed', severity: 'high', unit: unit?.unit_number || 'Unknown', owner: resident?.name || 'Resident', amount: Number(bill.amount), message: `Payment submitted for ${bill.title} and requires verification`, date: bill.updated_at })
    else if (bill.status === 'unpaid' && due < today) notifications.push({ id: `bill:${bill.id}:overdue`, type: 'overdue', severity: days >= 30 ? 'critical' : 'high', unit: unit?.unit_number || 'Unknown', owner: resident?.name || 'Resident', amount: Number(bill.amount), daysOverdue: days, message: `${bill.title} payment is ${days} day${days === 1 ? '' : 's'} overdue`, date: bill.due_date })
    else if (bill.status === 'unpaid' && due <= upcoming) notifications.push({ id: `bill:${bill.id}:upcoming`, type: 'upcoming', severity: 'medium', unit: unit?.unit_number || 'Unknown', owner: resident?.name || 'Resident', amount: Number(bill.amount), message: `${bill.title} payment is due by ${bill.due_date}`, date: bill.due_date })
    else if (bill.status === 'paid' && new Date(bill.updated_at) >= recent) notifications.push({ id: `bill:${bill.id}:paid`, type: 'success', severity: 'low', unit: unit?.unit_number || 'Unknown', owner: resident?.name || 'Resident', amount: Number(bill.amount), message: `${bill.title} payment was confirmed`, date: bill.updated_at })
  }
  for (const issue of issuesResult.data || []) {
    const unit: any = relation(issue.units), resident: any = relation(issue.residents)
    notifications.push({ id: `issue:${issue.id}:${issue.status}`, type: 'action-needed', severity: issue.priority === 'urgent' ? 'critical' : 'high', unit: unit?.unit_number || 'Unknown', owner: resident?.name || 'Resident', message: `${issue.priority === 'urgent' ? 'Urgent' : 'High-priority'} issue: ${issue.title}`, date: issue.created_at })
  }
  notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return { notifications, error: null }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const built = await buildNotifications(session.societyId)
    if (built.error) return response.error(built.error, 400)
    const { data: reads, error } = await supabaseAdmin.from('society_admin_notification_reads').select('notification_key').eq('society_id', session.societyId).eq('admin_id', session.accountId)
    if (error) return response.error(error.message, 400)
    const readKeys = new Set((reads || []).map(item => item.notification_key))
    const alerts = built.notifications.map(item => ({ ...item, date: new Date(item.date).toLocaleDateString('en-IN'), read: readKeys.has(item.id) }))
    return response.success({ alerts, unreadCount: alerts.filter(item => !item.read).length })
  } catch (error) { console.error('[Admin notifications] GET failed:', error); return response.serverError() }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json(), built = await buildNotifications(session.societyId)
    if (built.error) return response.error(built.error, 400)
    const available = new Set(built.notifications.map(item => item.id))
    const requested = body.all ? [...available] : [typeof body.id === 'string' ? body.id : '']
    const keys = requested.filter(key => available.has(key))
    if (!keys.length) return response.error('Notification not found', 404)
    const { error } = await supabaseAdmin.from('society_admin_notification_reads').upsert(keys.map(notification_key => ({ society_id: session.societyId, admin_id: session.accountId, notification_key, read_at: new Date().toISOString() })), { onConflict: 'admin_id,notification_key' })
    if (error) return response.error(error.message, 400)
    return response.success({ readIds: keys })
  } catch (error) { console.error('[Admin notifications] PATCH failed:', error); return response.serverError() }
}
