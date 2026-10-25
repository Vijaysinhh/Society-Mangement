export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10
  },

  slug: (value: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(value)
  },

  username: (value: string): boolean => {
    return value.length >= 3 && value.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(value)
  },

  password: (value: string): boolean => {
    return value.length >= 6
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== ''
  },

  string: (value: any): boolean => {
    return typeof value === 'string'
  },

  number: (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value)
  },
}

export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '')
}

export function validateSocietyInput(data: any) {
  if (!validators.required(data.name)) {
    throw new ValidationError('name', 'Society name is required')
  }
  if (data.name.length < 2) {
    throw new ValidationError('name', 'Society name must be at least 2 characters')
  }

  if (!validators.required(data.slug)) {
    throw new ValidationError('slug', 'Slug is required')
  }
  if (!validators.slug(data.slug)) {
    throw new ValidationError('slug', 'Slug must contain only lowercase letters, numbers, and hyphens')
  }

  if (!validators.required(data.address)) {
    throw new ValidationError('address', 'Address is required')
  }

  if (!validators.required(data.city)) {
    throw new ValidationError('city', 'City is required')
  }

  if (data.phone && !validators.phone(data.phone)) {
    throw new ValidationError('phone', 'Invalid phone number')
  }

  if (!validators.number(data.villas) || data.villas < 0) {
    throw new ValidationError('villas', 'Villas must be a non-negative number')
  }

  if (!validators.number(data.bungalows) || data.bungalows < 0) {
    throw new ValidationError('bungalows', 'Bungalows must be a non-negative number')
  }

  if (!validators.number(data.flats) || data.flats < 0) {
    throw new ValidationError('flats', 'Flats must be a non-negative number')
  }

  return {
    name: sanitizeString(data.name),
    slug: data.slug.toLowerCase(),
    address: sanitizeString(data.address),
    city: sanitizeString(data.city),
    state: sanitizeString(data.state || ''),
    phone: data.phone || '',
    contact_person: sanitizeString(data.contactPerson || ''),
    villas: data.villas || 0,
    bungalows: data.bungalows || 0,
    flats: data.flats || 0,
  }
}

export function validateAdminInput(data: any) {
  const username = typeof data.username === 'string' ? data.username.trim() : ''
  if (!validators.required(username)) {
    throw new ValidationError('username', 'Username is required')
  }
  if (!validators.username(username)) {
    throw new ValidationError('username', 'Username must be 3-50 characters, alphanumeric with _ or -')
  }

  if (!validators.required(data.password)) {
    throw new ValidationError('password', 'Password is required')
  }
  if (!validators.password(data.password)) {
    throw new ValidationError('password', 'Password must be at least 6 characters')
  }

  if (data.email && !validators.email(data.email)) {
    throw new ValidationError('email', 'Invalid email address')
  }

  if (data.phone && !validators.phone(data.phone)) {
    throw new ValidationError('phone', 'Invalid phone number')
  }

  return {
    username: username.toLowerCase(),
    password: data.password,
    name: sanitizeString(data.name || data.username),
    email: sanitizeString(data.email || `${data.username}@admin.local`),
    phone: data.phone || '',
  }
}
