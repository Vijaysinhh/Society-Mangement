// Multi-Tenant Society Management Types

export interface Society {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface SocietyAdmin {
  id: string
  society_id: string
  username: string
  email?: string
  created_at: string
  updated_at: string
  // password_hash is never sent to client
}

export interface Property {
  id: string
  society_id: string
  unit_number: string
  floor?: number
  bedrooms?: number
  total_area?: number
  owner_type?: string
  created_at: string
  updated_at: string
}

export interface Resident {
  id: string
  society_id: string
  property_id: string
  name: string
  phone: string
  email: string
  signup_date: string
  created_at: string
  updated_at: string
  // password_hash is never sent to client
}

export interface Watchman {
  id: string
  society_id: string
  name: string
  phone: string
  address?: string
  shift_start?: string
  shift_end?: string
  assigned_area?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  // password_hash is never sent to client
}

export interface InvitationLink {
  id: string
  society_id: string
  token: string
  role: 'resident' | 'watchman'
  created_by?: string
  created_at: string
  expires_at: string
  used_by?: string
  used_at?: string
  is_used: boolean
}

// Auth session types
export interface AuthSession {
  user_id: string
  society_id: string
  role: 'society_admin' | 'resident' | 'watchman'
  phone?: string
  username?: string
  created_at: string
}

// Login request/response types
export interface AdminLoginRequest {
  society_name: string
  username: string
  password: string
}

export interface ResidentLoginRequest {
  society_name: string
  phone: string
  password: string
}

export interface WatchmanLoginRequest {
  society_name: string
  phone: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    society_id: string
    role: 'society_admin' | 'resident' | 'watchman'
    name?: string
  }
  token?: string
}

// Resident signup types
export interface ResidentSignupRequest {
  society_name: string
  invitation_token: string
  name: string
  phone: string
  email: string
  property_id: string
  password: string
}

export interface ResidentSignupResponse {
  success: boolean
  message: string
  user?: Resident
}
