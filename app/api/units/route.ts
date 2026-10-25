import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

async function societyAdminSession(request: Request) {
  const session = await getRequestSession(request)
  return session?.accountType === 'society_admin' && session.societyId ? session : null
}

const unitSelect = `
  id, society_id, unit_number, unit_type, floor, area_sqft, bedroom_count,
  bathroom_count, lifecycle_status, created_at, updated_at,
  unit_assignments (
    id, assignment_role, start_date, end_date, status,
    residents (id, name, phone, email, status)
  ),
  vehicles (
    id, registration_number, resident_id, vehicle_type, make_model, color, parking_slot, status,
    residents (name)
  ),
  maintenance_bills (
    id, amount, due_date, status, billing_period
  )
`

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await societyAdminSession(request)
    if (!session) return response.error('Unauthorized', 401)

    const { data, error } = await supabaseAdmin.from('units').select(unitSelect)
      .eq('society_id', session.societyId).neq('lifecycle_status', 'inactive').order('unit_number')
    if (error) return response.error(error.message, 400)
    return response.success(data || [])
  } catch (error) {
    console.error('[Units] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await societyAdminSession(request)
    if (!session) return response.error('Unauthorized', 401)
    const body = await request.json()
    const unitNumber = typeof body.unitNumber === 'string' ? body.unitNumber.trim() : ''
    const unitType = typeof body.unitType === 'string' ? body.unitType : 'flat'
    const bedroomCount = Number(body.bedroomCount)
    if (!unitNumber) return response.error('Unit number is required', 400)
    if (!['villa', 'bungalow', 'flat'].includes(unitType)) return response.error('Invalid unit type', 400)
    if (!Number.isInteger(bedroomCount) || bedroomCount < 1 || bedroomCount > 5) return response.error('Choose a valid BHK value', 400)
    if (unitType === 'flat' && (body.floor === '' || body.floor === undefined || !Number.isInteger(Number(body.floor)) || Number(body.floor) < 0)) return response.error('Floor is required for flats and must be zero or a positive whole number', 400)

    const { data, error } = await supabaseAdmin.from('units').insert({
      society_id: session.societyId,
      unit_number: unitNumber,
      unit_type: unitType,
      floor: unitType === 'flat' ? Number(body.floor) : null,
      area_sqft: null,
      bedroom_count: bedroomCount,
      bathroom_count: null,
      lifecycle_status: 'active',
      created_by: session.accountId,
    }).select(unitSelect).single()

    if (error) {
      if (error.code === '23505') return response.conflict('A unit with this number already exists')
      return response.error(error.message, 400)
    }
    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId,
      action: 'unit.created', entity_type: 'unit', entity_id: data.id,
      metadata: { unit_number: data.unit_number, unit_type: data.unit_type },
    })
    return response.created(data)
  } catch (error) {
    console.error('[Units] POST failed:', error)
    return response.serverError()
  }
}
