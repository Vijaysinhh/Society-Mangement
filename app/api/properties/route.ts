import { getTenantDB } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { createPropertySchema } from '@/lib/schemas'
import { errors, handleApiError } from '@/lib/errors'

/**
 * GET /api/properties?society_id=xxx
 * Get properties for current user
 * - Admins see all properties in their society
 * - Residents see only their own property
 * - Watchmen see all properties in their society
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId || societyId !== user.societyId) {
      throw errors.tenantViolation()
    }

    // Check cache first
    const cacheKey = CACHE_KEYS.PROPERTIES(societyId)
    const cached = cache.get(cacheKey)
    if (cached) {
      return Response.json({
        success: true,
        data: cached,
        fromCache: true
      })
    }

    // Fetch from database
    const db = getTenantDB(request)
    const properties = await db.getProperties()

    // Cache for 10 minutes
    cache.set(cacheKey, properties, CACHE_TTL.MEDIUM)

    return Response.json({
      success: true,
      data: properties,
      fromCache: false
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/properties
 * Create new property (admin only)
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    const db = getTenantDB(request)

    // Only admins can create properties
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw errors.forbidden('Only admins can create properties')
    }

    const body = await request.json()
    const validatedData = createPropertySchema.parse(body)

    // Create property
    const property = await db.createProperty(validatedData)

    // Invalidate cache
    cache.invalidate(`properties:${user.societyId}`)

    return Response.json(
      {
        success: true,
        data: property
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
