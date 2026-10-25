import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function serialize(item: any) {
  return { id: item.id, version: `v1.${Math.max(0, item.version_number - 1)}`, title: item.title, content: item.content, createdAt: item.created_at, updatedAt: item.updated_at }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    const { data, error } = await supabaseAdmin.from('community_guidelines').select('id, version_number, title, content, created_at, updated_at')
      .eq('society_id', session.societyId).eq('status', 'published').order('version_number', { ascending: false })
    if (error) return response.error(error.message, 400)
    return response.success((data || []).map(serialize))
  } catch (error) {
    console.error('[Community guidelines] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const body = await request.json(), title = clean(body.title), content = clean(body.content)
    if (!title || !content) return response.error('Title and content are required', 400)
    const { data: latest } = await supabaseAdmin.from('community_guidelines').select('version_number').eq('society_id', session.societyId).order('version_number', { ascending: false }).limit(1).maybeSingle()
    const { data, error } = await supabaseAdmin.from('community_guidelines').insert({ society_id: session.societyId, title, content, version_number: (latest?.version_number || 0) + 1, created_by: session.accountId }).select('id, version_number, title, content, created_at, updated_at').single()
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'community.guideline_created', entity_type: 'community_guideline', entity_id: data.id })
    return response.created(serialize(data))
  } catch (error) {
    console.error('[Community guidelines] POST failed:', error)
    return response.serverError()
  }
}
