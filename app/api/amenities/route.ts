import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function serialize(amenity: any) {
  return {
    id: amenity.id, name: amenity.name, description: amenity.description || '', timing: amenity.timing,
    price: Number(amenity.price), cost: Number(amenity.price), capacity: amenity.capacity,
    availability: amenity.availability || [], status: amenity.status,
    createdDate: amenity.created_at, createdAt: amenity.created_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    let query = supabaseAdmin.from('amenities').select('*').eq('society_id', session.societyId).order('name')
    if (session.accountType === 'resident') query = query.eq('status', 'active')
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) {
    console.error('[Amenities] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const body = await request.json()
    const name = clean(body.name), description = clean(body.description), timing = clean(body.timing)
    const price = Number(body.price ?? body.cost), capacity = Number(body.capacity ?? 1)
    const availability = Array.isArray(body.availability) ? body.availability.filter((day: unknown) => DAYS.includes(String(day))) : DAYS
    if (!name || !timing) return response.error('Amenity name and timing are required', 400)
    if (!Number.isFinite(price) || price < 0) return response.error('Price must be zero or greater', 400)
    if (!Number.isInteger(capacity) || capacity < 1) return response.error('Capacity must be a positive whole number', 400)
    if (!availability.length) return response.error('Select at least one available day', 400)
    const { data, error } = await supabaseAdmin.from('amenities').insert({ society_id: session.societyId, name, description, timing, price, capacity, availability, created_by: session.accountId }).select('*').single()
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'amenity.created', entity_type: 'amenity', entity_id: data.id })
    return response.created(serialize(data))
  } catch (error) {
    console.error('[Amenities] POST failed:', error)
    return response.serverError()
  }
}
