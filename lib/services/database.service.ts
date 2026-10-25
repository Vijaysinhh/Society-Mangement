import { supabaseAdmin } from '@/lib/db'

// Types for type-safe database operations
export interface CreateSocietyInput {
  name: string
  slug: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  total_properties: number
  villas: number
  bungalows: number
  flats: number
  admin_email?: string
  admin_phone?: string
}

export interface CreateUnitInput {
  society_id: string
  unit_number: string
  unit_type: 'villa' | 'bungalow' | 'flat'
  block_name?: string
  floor_number?: number
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  owner_name?: string
  owner_email?: string
  owner_phone?: string
}

export interface CreateResidentInput {
  unit_id: string
  society_id: string
  email: string
  password_hash: string
  resident_name: string
  phone_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  family_members?: number
}

export interface CreateWatchmanInput {
  society_id: string
  email: string
  password_hash: string
  watchman_name: string
  phone_number?: string
  shift_start?: string
  shift_end?: string
  shift_days?: string
  badge_number?: string
}

export interface CreateVisitorInput {
  society_id: string
  unit_id: string
  resident_id?: string
  visitor_name: string
  visitor_phone?: string
  purpose?: string
  vehicle_number?: string
  photo_url?: string
  approval_status?: 'pending' | 'approved' | 'rejected'
}

export interface CreatePaymentInput {
  society_id: string
  unit_id: string
  payment_type: 'rent' | 'maintenance' | 'water' | 'electricity' | 'other'
  amount: number
  due_date?: string
  paid_date?: string
  payment_status?: 'pending' | 'paid' | 'overdue' | 'partial'
  payment_method?: string
  transaction_id?: string
  description?: string
}

export interface CreateMaintenanceInput {
  society_id: string
  unit_id: string
  resident_id?: string
  title: string
  description?: string
  category?: 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'general' | 'urgent'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
}

export interface CreateAnnouncementInput {
  society_id: string
  posted_by_admin_id: string
  title: string
  content: string
  category?: 'general' | 'maintenance' | 'event' | 'security' | 'billing' | 'urgent'
  is_pinned?: boolean
}

// SOCIETIES SERVICE
export const societiesService = {
  async create(input: CreateSocietyInput) {
    const { data, error } = await supabaseAdmin
      .from('societies')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('societies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from('societies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('societies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<CreateSocietyInput>) {
    const { data, error } = await supabaseAdmin
      .from('societies')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// UNITS SERVICE
export const unitsService = {
  async create(input: CreateUnitInput) {
    const { data, error } = await supabaseAdmin
      .from('units')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('units')
      .select('*')
      .eq('society_id', societyId)
      .order('unit_number', { ascending: true })

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('units')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<CreateUnitInput>) {
    const { data, error } = await supabaseAdmin
      .from('units')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// RESIDENTS SERVICE
export const residentsService = {
  async create(input: CreateResidentInput) {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByEmail(email: string, societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('email', email)
      .eq('society_id', societyId)
      .single()

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, input: Partial<CreateResidentInput>) {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// WATCHMEN SERVICE
export const watchmenService = {
  async create(input: CreateWatchmanInput) {
    const { data, error } = await supabaseAdmin
      .from('watchmen')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByEmail(email: string, societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('watchmen')
      .select('*')
      .eq('email', email)
      .eq('society_id', societyId)
      .single()

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('watchmen')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}

// VISITORS SERVICE
export const visitorsService = {
  async create(input: CreateVisitorInput) {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('society_id', societyId)
      .order('check_in_time', { ascending: false })

    if (error) throw error
    return data
  },

  async getByUnitId(unitId: string) {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('unit_id', unitId)
      .order('check_in_time', { ascending: false })

    if (error) throw error
    return data
  },

  async updateApprovalStatus(id: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .update({ approval_status: status, photo_approved: status === 'approved' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCheckOut(id: string) {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// PAYMENTS SERVICE
export const paymentsService = {
  async create(input: CreatePaymentInput) {
    const { data, error } = await supabaseAdmin
      .from('property_payments')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUnitId(unitId: string) {
    const { data, error } = await supabaseAdmin
      .from('property_payments')
      .select('*')
      .eq('unit_id', unitId)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('property_payments')
      .select('*')
      .eq('society_id', societyId)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data
  },

  async updatePaymentStatus(id: string, status: 'paid' | 'pending' | 'overdue' | 'partial', paidDate?: string) {
    const { data, error } = await supabaseAdmin
      .from('property_payments')
      .update({ payment_status: status, paid_date: paidDate || new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// MAINTENANCE SERVICE
export const maintenanceService = {
  async create(input: CreateMaintenanceInput) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUnitId(unitId: string) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .select('*')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string, resolutionNotes?: string) {
    const { data, error } = await supabaseAdmin
      .from('maintenance_requests')
      .update({ status, resolution_notes: resolutionNotes, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// ANNOUNCEMENTS SERVICE
export const announcementsService = {
  async create(input: CreateAnnouncementInput) {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getBySocietyId(societyId: string) {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}
