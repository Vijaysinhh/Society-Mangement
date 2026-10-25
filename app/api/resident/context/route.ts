import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'
import { comparePassword } from '@/lib/crypto'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'resident' || !session.societyId) return response.error('Unauthorized', 401)

    const { data, error } = await supabaseAdmin.from('residents').select(`
      id, society_id, name, phone, email, status, created_at,
      societies!inner(id, name, slug, status),
      unit_assignments!inner (
        id, assignment_role, start_date, status,
        units!inner (id, unit_number, unit_type, floor, area_sqft, bedroom_count, bathroom_count, lifecycle_status)
      )
    `).eq('id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').eq('unit_assignments.status', 'active').single()

    if (error || !data) return response.error('Resident account not found', 404)
    const society = Array.isArray(data.societies) ? data.societies[0] : data.societies
    if (!society || society.status !== 'active') return response.error('Society workspace is not active', 403)
    const { data: vehicles, error: vehicleError } = await supabaseAdmin.from('vehicles')
      .select('id, unit_id, registration_number, vehicle_type, make_model, color, parking_slot, status')
      .eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('status', 'active').order('created_at')
    if (vehicleError) return response.error(vehicleError.message, 400)
    return response.success({
      resident: { id: data.id, name: data.name, phone: data.phone, email: data.email, createdAt: data.created_at },
      society: { id: society.id, name: society.name, slug: society.slug },
      assignments: (data.unit_assignments || []).map((assignment: any) => ({
        id: assignment.id, role: assignment.assignment_role, startDate: assignment.start_date,
        unit: Array.isArray(assignment.units) ? assignment.units[0] : assignment.units,
      })),
      vehicles: vehicles || [],
    })
  } catch (error) {
    console.error('[Resident context] GET failed:', error)
    return response.serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'resident' || !session.societyId) return response.unauthorized()
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!name) return response.error('Full name is required', 400)
    if (phone.length < 6 || phone.length > 20) return response.error('Enter a valid phone number', 400)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response.error('Enter a valid email address', 400)

    const { data: resident } = await supabaseAdmin.from('residents').select('phone, password_hash')
      .eq('id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
    if (!resident) return response.notFound('Resident account not found')
    const phoneChanged = phone !== resident.phone
    if (phoneChanged && (!body.currentPassword || !comparePassword(String(body.currentPassword), resident.password_hash))) {
      return response.error('Current password is required to change your login phone number', 403)
    }

    const { data, error } = await supabaseAdmin.from('residents').update({ name, phone, email: email || null })
      .eq('id', session.accountId).eq('society_id', session.societyId).eq('status', 'active')
      .select('id, name, phone, email, created_at').single()
    if (error) {
      if (error.code === '23505') return response.conflict('That phone number or email is already registered in this society')
      return response.error(error.message, 400)
    }
    if (phoneChanged) await supabaseAdmin.from('auth_sessions').update({ revoked_at: new Date().toISOString() })
      .eq('account_type', 'resident').eq('account_id', session.accountId).neq('id', session.id).is('revoked_at', null)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'resident.profile_updated', entity_type: 'resident', entity_id: session.accountId, metadata: { phone_changed: phoneChanged } })
    return response.success({ resident: { id: data.id, name: data.name, phone: data.phone, email: data.email, createdAt: data.created_at }, phoneChanged })
  } catch (error) {
    console.error('[Resident context] PATCH failed:', error)
    return response.serverError()
  }
}
