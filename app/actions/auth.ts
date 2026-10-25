'use server'

// Auth delegated to REST API routes - these are stubs for backward compatibility

export async function loginSuperAdminAction(email: string, password: string) {
  throw new Error('Use /api/auth/admin-login instead')
}

export async function loginResidentAction(societyId: string, username: string, password: string) {
  throw new Error('Use /api/auth/resident-login instead')
}

export async function loginWatchmanAction(societyId: string, username: string, password: string) {
  throw new Error('Use /api/auth/watchman-login instead')
}

export async function residentSignupAction(data: any) {
  throw new Error('Use /api/residents instead')
}

export async function getSocietyPropertiesAction(societyId: string) {
  throw new Error('Use /api/societies/{id} instead')
}

export async function createSocietyAction(data: any) {
  throw new Error('Use /api/societies instead')
}

export async function logoutAction() {
  return { success: true }
}
