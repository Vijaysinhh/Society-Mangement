import bcryptjs from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hash a password using bcryptjs
 * @param password Plain text password
 * @returns Bcrypt hashed password
 */
export function hashPassword(password: string): string {
  const salt = bcryptjs.genSaltSync(SALT_ROUNDS)
  return bcryptjs.hashSync(password, salt)
}

/**
 * Compare a plain text password with a bcrypt hash
 * @param password Plain text password
 * @param hash Bcrypt hash
 * @returns True if password matches hash
 */
export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcryptjs.compareSync(password, hash)
  } catch (error) {
    console.error('[Crypto] Error comparing passwords:', error)
    return false
  }
}
