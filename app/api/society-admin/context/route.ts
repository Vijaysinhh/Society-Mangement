import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.error('Unauthorized', 401)

    const { data, error } = await supabaseAdmin
      .from('society_admins')
      .select(`id, society_id, username, post_name, holder_name, phone, is_primary, status, created_at,
        societies!inner(id, name, slug, address, city, state, villas, bungalows, flats, status)`)
      .eq('id', session.accountId)
      .eq('society_id', session.societyId)
      .eq('status', 'active')
      .single()

    if (error || !data) return response.error('Society administrator account not found', 404)
    const society = Array.isArray(data.societies) ? data.societies[0] : data.societies
    if (!society || society.status !== 'active') return response.error('Society workspace is not active', 403)

    return response.success({
      account: { id: data.id, username: data.username, postName: data.post_name, holderName: data.holder_name, phone: data.phone, isPrimary: data.is_primary, createdAt: data.created_at },
      society,
    })
  } catch (error) {
    console.error('[Society admin context] GET failed:', error)
    return response.serverError()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.error('Unauthorized', 401)

    const body = await request.json()
    const holderName = typeof body.holderName === 'string' ? body.holderName.trim() : ''
    if (!holderName || holderName.length > 100) return response.error('Enter a holder name between 1 and 100 characters', 400)

    const { data, error } = await supabaseAdmin
      .from('society_admins')
      .update({ holder_name: holderName, updated_at: new Date().toISOString() })
      .eq('id', session.accountId)
      .eq('society_id', session.societyId)
      .eq('status', 'active')
      .select('id, holder_name')
      .single()
    if (error || !data) return response.error(error?.message || 'Could not update profile', 400)

    await supabaseAdmin.from('audit_events').insert({
      society_id: session.societyId,
      actor_type: 'society_admin',
      actor_id: session.accountId,
      action: 'society_admin.profile_updated',
      entity_type: 'society_admin',
      entity_id: session.accountId,
      metadata: { holder_name: holderName },
    })
    return response.success({ id: data.id, holderName: data.holder_name })
  } catch (error) {
    console.error('[Society admin context] PATCH failed:', error)
    return response.serverError()
  }
}
