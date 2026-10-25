import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    const { id } = await params, body = await request.json()
    const { data: booking, error: findError } = await supabaseAdmin.from('amenity_bookings').select('*').eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (findError) return response.error(findError.message, 400)
    if (!booking || (session.accountType === 'resident' && booking.resident_id !== session.accountId)) return response.notFound('Booking not found')
    const updates: Record<string, unknown> = {}
    let action = ''
    if (session.accountType === 'resident') {
      if (body.action !== 'cancel') return response.error('Residents can only cancel a booking', 403)
      if (!['pending', 'approved'].includes(booking.status)) return response.error('This booking cannot be cancelled', 400)
      updates.status = 'cancelled'; updates.cancelled_at = new Date().toISOString(); updates.payment_status = 'unpaid'; action = 'cancelled'
    } else if (body.status) {
      if (!['approved', 'rejected'].includes(body.status)) return response.error('Invalid booking decision', 400)
      if (booking.status !== 'pending') return response.error('Only pending bookings can be reviewed', 400)
      if (body.status === 'approved') {
        const { data: conflict } = await supabaseAdmin.from('amenity_bookings').select('id').eq('amenity_id', booking.amenity_id).eq('booking_date', booking.booking_date).ilike('time_slot', booking.time_slot).eq('status', 'approved').neq('id', id).limit(1).maybeSingle()
        if (conflict) return response.conflict('Another booking already occupies this time slot')
      }
      updates.status = body.status; updates.reviewed_by = session.accountId; updates.reviewed_at = new Date().toISOString(); action = body.status
    } else if (body.paymentStatus) {
      if (!['paid', 'unpaid'].includes(body.paymentStatus)) return response.error('Invalid payment status', 400)
      if (booking.status !== 'approved') return response.error('Only approved bookings can have payment updates', 400)
      updates.payment_status = body.paymentStatus; action = `payment_${body.paymentStatus}`
    } else return response.error('No booking change supplied', 400)
    const { data, error } = await supabaseAdmin.from('amenity_bookings').update(updates).eq('id', id).eq('society_id', session.societyId).select('*').single()
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: `amenity_booking.${action}`, entity_type: 'amenity_booking', entity_id: id })
    return response.success({ id: data.id, status: data.status === 'approved' ? (data.payment_status === 'paid' ? 'paid' : 'awaiting-payment') : data.status, bookingStatus: data.status, paymentStatus: data.payment_status })
  } catch (error) {
    console.error('[Amenity booking] PATCH failed:', error)
    return response.serverError()
  }
}
