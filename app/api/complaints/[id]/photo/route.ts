import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session?.societyId || !['resident', 'society_admin'].includes(session.accountType)) return response.unauthorized()
    const { id } = await params
    let query = supabaseAdmin.from('issues').select('resident_id, photo_path').eq('id', id).eq('society_id', session.societyId)
    if (session.accountType === 'resident') query = query.eq('resident_id', session.accountId)
    const { data: issue } = await query.maybeSingle()
    if (!issue?.photo_path) return response.notFound('Issue photo not found')
    const { data: photo, error } = await supabaseAdmin.storage.from('issue-photos').download(issue.photo_path)
    if (error || !photo) return response.notFound('Issue photo not found')
    return new Response(photo, { headers: { 'Content-Type': photo.type || 'application/octet-stream', 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' } })
  } catch (error) { console.error('[Issue photo] GET failed:', error); return response.serverError() }
}
