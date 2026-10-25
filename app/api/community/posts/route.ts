import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const CATEGORIES = ['safety', 'maintenance', 'event', 'general']
function clean(value: unknown) { return typeof value === 'string' ? value.trim() : '' }

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()

    const { data: posts, error } = await supabaseAdmin.from('community_posts')
      .select('id, author_type, author_id, post_type, message, category, created_at, updated_at, community_post_reactions(id, resident_id)')
      .eq('society_id', session.societyId).eq('status', 'published')
      .order('created_at', { ascending: false }).limit(100)
    if (error) return response.error(error.message, 400)

    const residentIds = [...new Set((posts || []).filter((post) => post.author_type === 'resident').map((post) => post.author_id))]
    const authorMap = new Map<string, { name: string; unit: string }>()
    if (residentIds.length) {
      const [{ data: residents }, { data: assignments }] = await Promise.all([
        supabaseAdmin.from('residents').select('id, name').eq('society_id', session.societyId).in('id', residentIds),
        supabaseAdmin.from('unit_assignments').select('resident_id, units(unit_number)').eq('society_id', session.societyId).eq('status', 'active').in('resident_id', residentIds),
      ])
      for (const resident of residents || []) authorMap.set(resident.id, { name: resident.name, unit: '' })
      for (const assignment of assignments || []) {
        const unit = Array.isArray(assignment.units) ? assignment.units[0] : assignment.units
        const author = authorMap.get(assignment.resident_id)
        if (author && !author.unit) author.unit = unit?.unit_number || ''
      }
    }

    return response.success((posts || []).map((post) => {
      const reactions = Array.isArray(post.community_post_reactions) ? post.community_post_reactions : []
      const author = authorMap.get(post.author_id)
      return {
        id: post.id, type: post.post_type, author: post.author_type === 'society_admin' ? 'Management' : author?.name || 'Resident',
        unit: post.author_type === 'society_admin' ? 'Admin' : author?.unit || '', timestamp: post.created_at,
        message: post.message, likes: reactions.length, replies: 0, shares: 0,
        liked: session.accountType === 'resident' && reactions.some((reaction) => reaction.resident_id === session.accountId),
        category: post.category, canEdit: post.author_type === session.accountType && post.author_id === session.accountId,
      }
    }))
  } catch (error) {
    console.error('[Community posts] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['society_admin', 'resident'].includes(session.accountType)) return response.unauthorized()
    const body = await request.json()
    const message = clean(body.message)
    const category = clean(body.category) || 'general'
    if (!message) return response.error('Post message is required', 400)
    if (message.length > 3000) return response.error('Post message must be 3000 characters or fewer', 400)
    if (!CATEGORIES.includes(category)) return response.error('Invalid category', 400)
    const postType = session.accountType === 'society_admin' ? 'announcement' : 'post'
    const { data, error } = await supabaseAdmin.from('community_posts').insert({
      society_id: session.societyId, author_type: session.accountType, author_id: session.accountId,
      post_type: postType, message, category: postType === 'announcement' ? category : null,
    }).select('id, created_at').single()
    if (error) return response.error(error.message, 400)
    let author = 'Management', unit = 'Admin'
    if (session.accountType === 'resident') {
      const [{ data: resident }, { data: assignment }] = await Promise.all([
        supabaseAdmin.from('residents').select('name').eq('id', session.accountId).eq('society_id', session.societyId).maybeSingle(),
        supabaseAdmin.from('unit_assignments').select('units(unit_number)').eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').limit(1).maybeSingle(),
      ])
      const assignedUnit = Array.isArray(assignment?.units) ? assignment.units[0] : assignment?.units
      author = resident?.name || 'Resident'
      unit = assignedUnit?.unit_number || ''
    }
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: session.accountType, actor_id: session.accountId, action: `community.${postType}_created`, entity_type: 'community_post', entity_id: data.id })
    return response.created({ id: data.id, type: postType, author, unit, timestamp: data.created_at, message, likes: 0, replies: 0, shares: 0, liked: false, category: postType === 'announcement' ? category : undefined, canEdit: true })
  } catch (error) {
    console.error('[Community posts] POST failed:', error)
    return response.serverError()
  }
}
