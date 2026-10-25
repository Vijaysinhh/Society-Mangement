import { createToken, verifyToken } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request
    const { email, password, role } = loginSchema.parse(body)

    // Determine table based on role
    const table =
      role === 'resident'
        ? 'residents'
        : role === 'admin'
          ? 'society_admins'
          : role === 'watchman'
            ? 'watchmen'
            : null

    if (!table) {
      throw errors.validation('Invalid role')
    }

    // Query user by email
    const { data: user, error: queryError } = await supabaseAdmin
      .from(table)
      .select('id, email, society_id, password_hash')
      .eq('email', email)
      .single()

    if (queryError || !user) {
      throw errors.unauthorized('Invalid email or password')
    }

    // TODO: Verify password with bcrypt
    // For now, simple comparison (replace with bcrypt in production)
    // const passwordValid = await bcrypt.compare(password, user.password_hash)
    const passwordValid = password === user.password_hash

    if (!passwordValid) {
      throw errors.unauthorized('Invalid email or password')
    }

    // Create JWT token
    const token = createToken(
      {
        societyId: user.society_id,
        role,
        email
      },
      user.id
    )

    // Return success response with token
    const response = Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        email,
        role,
        societyId: user.society_id
      }
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/auth/verify
 * Verify JWT token and return user info
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      throw errors.unauthorized('Missing authentication token')
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)

    return Response.json({
      success: true,
      user: {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        societyId: decoded.societyId
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
