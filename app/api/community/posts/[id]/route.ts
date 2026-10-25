import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    const { id } = await params
    const message = clean((await request.json()).message)
    if (!message) return response.error('Post message is required', 400)
    if (message.length > 3000) return response.error('Post message must be 3000 characters or fewer', 400)
    const { data, error } = await supabaseAdmin.from('community_posts').update({ message })
      .eq('id', id).eq('society_id', session.societyId).eq('author_type', session.accountType).eq('author_id', session.accountId)
      .select('id, message, updated_at').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Post not found')
    return response.success(data)
  } catch (error) {
    console.error('[Community post] PATCH failed:', error)
    return response.serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    const { id } = await params
    let query = supabaseAdmin.from('community_posts').delete().eq('id', id).eq('society_id', session.societyId)
    if (session.accountType === 'resident') query = query.eq('author_type', 'resident').eq('author_id', session.accountId)
    const { data, error } = await query.select('id').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Post not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: 'community.post_deleted', entity_type: 'community_post', entity_id: id })
    return response.success({ id })
  } catch (error) {
    console.error('[Community post] DELETE failed:', error)
    return response.serverError()
  }
}
