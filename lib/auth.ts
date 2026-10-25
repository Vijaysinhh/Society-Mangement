import jwt from 'jsonwebtoken'

export interface AuthPayload {
  sub: string // user ID
  societyId: string
  role: 'resident' | 'admin' | 'watchman' | 'superadmin'
  email: string
  iat: number
}

export interface JWTPayloadInput {
  societyId: string
  role: 'resident' | 'admin' | 'watchman' | 'superadmin'
  email: string
}

/**
 * Create a JWT token for authenticated users
 */
export function createToken(payload: JWTPayloadInput, userId: string): string {
  const now = Math.floor(Date.now() / 1000)

  return jwt.sign(
    {
      sub: userId,
      ...payload,
      iat: now
      // No expiry - sessions persist until manual logout
    },
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  )
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
      { algorithms: ['HS256'], ignoreExpiration: true }
    )
    return decoded as AuthPayload
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw new Error('Token verification failed')
  }
}

/**
 * Extract and verify auth user from request headers
 */
export async function getAuthUser(request: Request): Promise<AuthPayload> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.slice(7) // Remove 'Bearer ' prefix
  return verifyToken(token)
}

/**
 * Extract auth user but don't throw - return null if invalid
 */
export async function getAuthUserOptional(
  request: Request
): Promise<AuthPayload | null> {
  try {
    return await getAuthUser(request)
  } catch {
    return null
  }
}
