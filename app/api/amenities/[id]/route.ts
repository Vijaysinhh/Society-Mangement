import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const { id } = await params, body = await request.json()
    const updates: Record<string, unknown> = {}
    if ('name' in body) { const value = clean(body.name); if (!value) return response.error('Amenity name is required', 400); updates.name = value }
    if ('description' in body) updates.description = clean(body.description)
    if ('timing' in body) { const value = clean(body.timing); if (!value) return response.error('Timing is required', 400); updates.timing = value }
    if ('price' in body || 'cost' in body) { const value = Number(body.price ?? body.cost); if (!Number.isFinite(value) || value < 0) return response.error('Price must be zero or greater', 400); updates.price = value }
    if ('capacity' in body) { const value = Number(body.capacity); if (!Number.isInteger(value) || value < 1) return response.error('Capacity must be a positive whole number', 400); updates.capacity = value }
    if ('availability' in body) { const value = Array.isArray(body.availability) ? body.availability.filter((day: unknown) => DAYS.includes(String(day))) : []; if (!value.length) return response.error('Select at least one available day', 400); updates.availability = value }
    if ('status' in body) { if (!['active', 'inactive'].includes(body.status)) return response.error('Invalid amenity status', 400); updates.status = body.status }
    if (!Object.keys(updates).length) return response.error('No changes supplied', 400)
    const { data, error } = await supabaseAdmin.from('amenities').update(updates).eq('id', id).eq('society_id', session.societyId).select('*').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Amenity not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'amenity.updated', entity_type: 'amenity', entity_id: id, metadata: updates })
    return response.success({ ...data, price: Number(data.price), cost: Number(data.price), createdDate: data.created_at })
  } catch (error) {
    console.error('[Amenity] PATCH failed:', error)
    return response.serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || session.accountType !== 'society_admin') return response.unauthorized()
    const { id } = await params
    const { count, error: countError } = await supabaseAdmin.from('amenity_bookings').select('id', { count: 'exact', head: true }).eq('amenity_id', id).eq('society_id', session.societyId)
    if (countError) return response.error(countError.message, 400)
    if (count) return response.conflict('This amenity has booking history. Set it to inactive instead.')
    const { data, error } = await supabaseAdmin.from('amenities').delete().eq('id', id).eq('society_id', session.societyId).select('id').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Amenity not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'amenity.deleted', entity_type: 'amenity', entity_id: id })
    return response.success({ id })
  } catch (error) {
    console.error('[Amenity] DELETE failed:', error)
    return response.serverError()
  }
}
