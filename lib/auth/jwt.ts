import crypto from 'crypto'

export interface JWTPayload {
  userId: string
  email: string
  userType: 'resident' | 'watchman' | 'admin' | 'superadmin'
  societyId: string
  societyName: string
  iat: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Simple JWT implementation (no expiry)
export function createJWT(payload: Omit<JWTPayload, 'iat'>): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const tokenPayload: JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const [headerEncoded, payloadEncoded, signature] = token.split('.')

    if (!headerEncoded || !payloadEncoded || !signature) {
      return null
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64url')

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString())
    return payload as JWTPayload
  } catch (error) {
    console.error('[JWT] Verification failed:', error)
    return null
  }
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const [, payloadEncoded] = token.split('.')
    if (!payloadEncoded) return null
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString())
    return payload as JWTPayload
  } catch (error) {
    console.error('[JWT] Decode failed:', error)
    return null
  }
}
