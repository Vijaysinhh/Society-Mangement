export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function isPasswordStrong(password: string): boolean {
  return password.length >= 6
}

export function hashPassword(password: string): string {
  const crypto = require('crypto')
  const salt = 'app-password-salt-v1'
  return crypto
    .createHash('sha256')
    .update(password + salt, 'utf8')
    .digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function getLockoutTime(failedAttempts: number): number {
  if (failedAttempts < 3) return 0
  if (failedAttempts < 5) return 5 * 60 * 1000 // 5 minutes
  return 30 * 60 * 1000 // 30 minutes
}

export function shouldLockUser(failedAttempts: number, lastFailureTime: number): boolean {
  const lockoutTime = getLockoutTime(failedAttempts)
  if (lockoutTime === 0) return false
  return Date.now() - lastFailureTime < lockoutTime
}
