import { getAuthUser } from '@/lib/auth'
import { cache, CACHE_KEYS } from '@/lib/cache'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * GET /api/blacklist?society_id=xxx
 * Get blacklist for society (watchman checks this before allowing entry)
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId || societyId !== user.societyId) {
      throw errors.tenantViolation()
    }

    // Check cache
    const cacheKey = CACHE_KEYS.BLACKLIST(societyId)
    const cached = cache.get(cacheKey)
    if (cached) {
      return Response.json({ success: true, data: cached, fromCache: true })
    }

    // Fetch from database
    const { data: blacklist, error } = await supabaseAdmin
      .from('visitor_blacklist')
      .select('*')
      .eq('society_id', societyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    cache.set(cacheKey, blacklist || [], 600) // Cache 10 minutes

    return Response.json({ success: true, data: blacklist, fromCache: false })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/blacklist
 * Watchman manually adds visitor to blacklist
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'watchman') {
      throw errors.forbidden('Only watchmen can add to blacklist')
    }

    const body = await request.json()
    const { visitor_name, visitor_phone, reason } = body

    if (!visitor_name || !reason) {
      throw errors.validation('visitor_name and reason are required')
    }

    // Add to society-wide blacklist (watchman's action)
    const { data: blacklistEntry, error } = await supabaseAdmin
      .from('visitor_blacklist')
      .insert({
        society_id: user.societyId,
        visitor_name,
        visitor_phone,
        reason,
        scope: 'society_wide', // Watchman additions are society-wide
        added_by_watchman_id: user.sub,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    cache.invalidate(`blacklist:${user.societyId}`)

    return Response.json({ success: true, data: blacklistEntry }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/blacklist/:id
 * Remove visitor from blacklist
 */
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'watchman' && user.role !== 'admin') {
      throw errors.forbidden('Only admins/watchmen can remove from blacklist')
    }

    const { searchParams } = new URL(request.url)
    const blacklistId = searchParams.get('id')

    if (!blacklistId) {
      throw errors.validation('id is required')
    }

    // Remove from blacklist
    const { data, error } = await supabaseAdmin
      .from('visitor_blacklist')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString()
      })
      .eq('id', blacklistId)
      .eq('society_id', user.societyId)
      .select()
      .single()

    if (error) throw error

    cache.invalidate(`blacklist:${user.societyId}`)

    return Response.json({ success: true, data })
  } catch (error) {
    return handleApiError(error)
  }
}
