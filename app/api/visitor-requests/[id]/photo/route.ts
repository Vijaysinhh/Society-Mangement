import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

const PHOTO_BUCKET = 'visitor-photos'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['watchman', 'resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()

    const { id } = await params
    const { data: visitor } = await supabaseAdmin.from('visitor_requests').select('unit_id, photo_path').eq('id', id).eq('society_id', session.societyId).maybeSingle()
    if (!visitor?.photo_path) return response.notFound('Visitor photo not found')

    if (session.accountType === 'resident') {
      const { data: assignment } = await supabaseAdmin.from('unit_assignments').select('id').eq('unit_id', visitor.unit_id).eq('resident_id', session.accountId).eq('society_id', session.societyId).eq('status', 'active').maybeSingle()
      if (!assignment) return response.error('You cannot view this visitor photo', 403)
    }

    const { data: photo, error } = await supabaseAdmin.storage.from(PHOTO_BUCKET).download(visitor.photo_path)
    if (error || !photo) return response.notFound('Visitor photo not found')
    return new Response(photo, { headers: { 'Content-Type': photo.type || 'application/octet-stream', 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' } })
  } catch (error) {
    console.error('[Visitor photo] GET failed:', error)
    return response.serverError()
  }
}
