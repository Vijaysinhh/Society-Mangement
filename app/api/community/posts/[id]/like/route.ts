import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'resident' || !session.societyId) return response.unauthorized()
    const { id } = await params
    const { data: post } = await supabaseAdmin.from('community_posts').select('id').eq('id', id).eq('society_id', session.societyId).eq('status', 'published').maybeSingle()
    if (!post) return response.notFound('Post not found')
    const { data: existing } = await supabaseAdmin.from('community_post_reactions').select('id').eq('post_id', id).eq('resident_id', session.accountId).maybeSingle()
    if (existing) await supabaseAdmin.from('community_post_reactions').delete().eq('id', existing.id).eq('society_id', session.societyId)
    else {
      const { error } = await supabaseAdmin.from('community_post_reactions').insert({ society_id: session.societyId, post_id: id, resident_id: session.accountId })
      if (error) return response.error(error.message, 400)
    }
    const { count } = await supabaseAdmin.from('community_post_reactions').select('id', { count: 'exact', head: true }).eq('post_id', id)
    return response.success({ liked: !existing, likes: count || 0 })
  } catch (error) {
    console.error('[Community post like] failed:', error)
    return response.serverError()
  }
}
