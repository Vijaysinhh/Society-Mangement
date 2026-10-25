import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { createAmenitySchema, bookAmenitySchema } from '@/lib/schemas'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * GET /api/amenities?society_id=xxx
 * Get all amenities (cached - rarely changes)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId) {
      throw errors.validation('society_id is required')
    }

    const cacheKey = CACHE_KEYS.AMENITIES(societyId)
    const cached = cache.get(cacheKey)
    if (cached) {
      return Response.json({ success: true, data: cached, fromCache: true })
    }

    const { data: amenities, error } = await supabaseAdmin
      .from('amenities')
      .select('*')
      .eq('society_id', societyId)

    if (error) throw error

    cache.set(cacheKey, amenities || [], CACHE_TTL.LONG) // Cache 30 min

    return Response.json({ success: true, data: amenities, fromCache: false })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/amenities
 * Admin creates new amenity
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw errors.forbidden('Only admins can create amenities')
    }

    const body = await request.json()
    const validatedData = createAmenitySchema.parse(body)

    const { data: amenity, error } = await supabaseAdmin
      .from('amenities')
      .insert({
        ...validatedData,
        society_id: user.societyId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    cache.invalidate(`amenities:${user.societyId}`)

    return Response.json({ success: true, data: amenity }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}


