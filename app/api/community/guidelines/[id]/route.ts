import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function serialize(item: any) { return { id: item.id, version: `v1.${Math.max(0, item.version_number - 1)}`, title: item.title, content: item.content, createdAt: item.created_at, updatedAt: item.updated_at } }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await params, body = await request.json(), title = clean(body.title), content = clean(body.content)
    if (!title || !content) return response.error('Title and content are required', 400)
    const { data, error } = await supabaseAdmin.from('community_guidelines').update({ title, content }).eq('id', id).eq('society_id', session.societyId).select('id, version_number, title, content, created_at, updated_at').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Guideline not found')
    return response.success(serialize(data))
  } catch (error) {
    console.error('[Community guideline] PATCH failed:', error)
    return response.serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const { id } = await params
    const { data, error } = await supabaseAdmin.from('community_guidelines').delete().eq('id', id).eq('society_id', session.societyId).select('id').maybeSingle()
    if (error) return response.error(error.message, 400)
    if (!data) return response.notFound('Guideline not found')
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'community.guideline_deleted', entity_type: 'community_guideline', entity_id: id })
    return response.success({ id })
  } catch (error) {
    console.error('[Community guideline] DELETE failed:', error)
    return response.serverError()
  }
}
