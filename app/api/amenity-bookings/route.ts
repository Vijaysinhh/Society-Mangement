import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function serialize(row: any) {
  const amenity = Array.isArray(row.amenities) ? row.amenities[0] : row.amenities
  const resident = Array.isArray(row.residents) ? row.residents[0] : row.residents
  const unit = Array.isArray(row.units) ? row.units[0] : row.units
  const displayStatus = row.status === 'approved' ? (row.payment_status === 'paid' ? 'paid' : 'awaiting-payment') : row.status
  return {
    id: row.id, amenityId: row.amenity_id, amenityName: amenity?.name || 'Amenity',
    residentId: row.resident_id, residentName: resident?.name || '', owner: resident?.name || '',
    unitId: row.unit_id, property: unit?.unit_number || '', unitNo: unit?.unit_number || '',
    bookingDate: row.booking_date, date: row.booking_date, timeSlot: row.time_slot,
    amount: Number(row.amount), cost: Number(row.amount), status: displayStatus,
    bookingStatus: row.status, paymentStatus: row.payment_status, requestDate: row.created_at, createdAt: row.created_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    let query = supabaseAdmin.from('amenity_bookings').select('*, amenities(name), residents(name), units(unit_number)').eq('society_id', session.societyId).order('booking_date', { ascending: false }).order('created_at', { ascending: false })
    if (session.accountType === 'resident') query = query.eq('resident_id', session.accountId)
    const { data, error } = await query
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) {
    console.error('[Amenity bookings] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'resident') return response.unauthorized()
    const body = await request.json()
    const amenityId = clean(body.amenityId), unitId = clean(body.unitId), bookingDate = clean(body.bookingDate ?? body.date), timeSlot = clean(body.timeSlot ?? body.time)
    if (!amenityId || !unitId || !bookingDate || !timeSlot) return response.error('Amenity, property, date, and time slot are required', 400)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) return response.error('Enter a valid booking date', 400)
    const today = new Date(); const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (bookingDate < todayText) return response.error('Booking date cannot be in the past', 400)
    const [{ data: amenity }, { data: assignment }] = await Promise.all([
      supabaseAdmin.from('amenities').select('id, name, price, availability, status').eq('id', amenityId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle(),
      supabaseAdmin.from('unit_assignments').select('id').eq('society_id', session.societyId).eq('resident_id', session.accountId).eq('unit_id', unitId).eq('status', 'active').maybeSingle(),
    ])
    if (!amenity) return response.notFound('Amenity is not available')
    if (!assignment) return response.error('You are not assigned to this property', 403)
    const selectedDay = dayNames[new Date(`${bookingDate}T12:00:00Z`).getUTCDay()]
    if (!amenity.availability?.includes(selectedDay)) return response.error(`${amenity.name} is not available on ${selectedDay}`, 400)
    const { data: existing } = await supabaseAdmin.from('amenity_bookings').select('id').eq('amenity_id', amenityId).eq('booking_date', bookingDate).ilike('time_slot', timeSlot).in('status', ['pending', 'approved']).limit(1).maybeSingle()
    if (existing) return response.conflict('That time slot is already booked or awaiting approval')
    const { data, error } = await supabaseAdmin.from('amenity_bookings').insert({ society_id: session.societyId, amenity_id: amenityId, resident_id: session.accountId, unit_id: unitId, booking_date: bookingDate, time_slot: timeSlot, amount: Number(amenity.price) }).select('*, amenities(name), residents(name), units(unit_number)').single()
    if (error) {
      if (error.code === '23505') return response.conflict('That time slot is already booked or awaiting approval')
      return response.error(error.message, 400)
    }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'resident', actor_id: session.accountId, action: 'amenity_booking.created', entity_type: 'amenity_booking', entity_id: data.id })
    return response.created(serialize(data))
  } catch (error) {
    console.error('[Amenity bookings] POST failed:', error)
    return response.serverError()
  }
}
