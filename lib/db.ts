import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
// Prefer the explicit development/public project variables from .env.local.
// Legacy shell-level SUPABASE_* variables can otherwise silently point the
// running Next.js process at a different project than scripts and migrations.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''

// Validate URL format
const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Initialize Supabase clients only if credentials are valid
let supabaseAdmin: SupabaseClient | null = null
let supabasePublic: SupabaseClient | null = null

try {
  if (isValidSupabaseUrl(SUPABASE_URL) && SUPABASE_SERVICE_KEY?.trim()) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  } else if (!isValidSupabaseUrl(SUPABASE_URL)) {
    console.warn('[DB] Supabase URL is not a valid HTTP/HTTPS URL')
  } else {
    console.warn('[DB] Missing Supabase service key')
  }
} catch (err) {
  console.error('[DB] Failed to initialize Supabase admin client:', err instanceof Error ? err.message : String(err))
}

try {
  if (isValidSupabaseUrl(SUPABASE_URL) && SUPABASE_ANON_KEY?.trim()) {
    supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } else if (!isValidSupabaseUrl(SUPABASE_URL)) {
    console.warn('[DB] Supabase URL is not a valid HTTP/HTTPS URL')
  } else {
    console.warn('[DB] Missing Supabase anon key')
  }
} catch (err) {
  console.error('[DB] Failed to initialize Supabase public client:', err instanceof Error ? err.message : String(err))
}

/**
 * Tenant-aware database client with automatic multi-tenant isolation
 * - Enforces society_id on all queries
 * - Validates user permissions by role
 * - Works with Supabase RLS policies for defense-in-depth security
 */
export class TenantDB {
  private db: SupabaseClient

  constructor(
    private societyId: string,
    private userId: string,
    private userRole: 'resident' | 'admin' | 'watchman' | 'superadmin'
  ) {
    if (!supabaseAdmin) {
      throw new Error('Supabase is not initialized. Check environment variables: SUPABASE_URL, SUPABASE_SECRET_KEY')
    }
    this.db = supabaseAdmin
  }

  /**
   * Verify user belongs to this society (defense-in-depth)
   */
  private async verifyTenantAccess(): Promise<boolean> {
    if (this.userRole === 'superadmin') {
      return true
    }

    const table =
      this.userRole === 'resident'
        ? 'residents'
        : this.userRole === 'admin'
          ? 'society_admins'
          : 'watchmen'

    const { data, error } = await this.db
      .from(table)
      .select('id')
      .eq('id', this.userId)
      .eq('society_id', this.societyId)
      .single()

    if (error || !data) {
      throw new Error('Unauthorized: User does not belong to this society')
    }

    return true
  }

  // ============ SOCIETY QUERIES ============

  async getSociety() {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('societies')
      .select('*')
      .eq('id', this.societyId)
      .single()

    if (error) throw error
    return data
  }

  // ============ PROPERTY QUERIES ============

  async getProperties(filters?: { resident_id?: string; limit?: number }) {
    await this.verifyTenantAccess()

    let query = this.db
      .from('properties')
      .select('*')
      .eq('society_id', this.societyId)

    if (this.userRole === 'resident') {
      query = query.eq('resident_id', this.userId)
    }

    if (filters?.resident_id) {
      query = query.eq('resident_id', filters.resident_id)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async getProperty(propertyId: string) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('society_id', this.societyId)
      .single()

    if (error || !data) {
      throw new Error('Property not found or access denied')
    }

    return data
  }

  async createProperty(propertyData: any) {
    if (this.userRole !== 'admin' && this.userRole !== 'superadmin') {
      throw new Error('Only admins can create properties')
    }

    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('properties')
      .insert({
        ...propertyData,
        society_id: this.societyId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ BILL QUERIES ============

  async getBills(filters?: {
    status?: string
    resident_id?: string
    limit?: number
    offset?: number
  }) {
    await this.verifyTenantAccess()

    let query = this.db
      .from('maintenance_bills')
      .select('*')
      .eq('society_id', this.societyId)
      .order('due_date', { ascending: false })

    if (this.userRole === 'resident') {
      query = query.eq('resident_id', this.userId)
    }

    if (filters?.resident_id) {
      query = query.eq('resident_id', filters.resident_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async getBill(billId: string) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('maintenance_bills')
      .select('*')
      .eq('id', billId)
      .eq('society_id', this.societyId)
      .single()

    if (error || !data) {
      throw new Error('Bill not found or access denied')
    }

    if (this.userRole === 'resident' && data.resident_id !== this.userId) {
      throw new Error('Access denied: This is not your bill')
    }

    return data
  }

  async createBill(billData: any) {
    if (this.userRole !== 'admin' && this.userRole !== 'superadmin') {
      throw new Error('Only admins can create bills')
    }

    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('maintenance_bills')
      .insert({
        ...billData,
        society_id: this.societyId,
        status: 'unpaid'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateBill(billId: string, updates: any) {
    if (this.userRole !== 'admin' && this.userRole !== 'superadmin') {
      throw new Error('Only admins can update bills')
    }

    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('maintenance_bills')
      .update(updates)
      .eq('id', billId)
      .eq('society_id', this.societyId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ PAYMENT QUERIES ============

  async createPayment(paymentData: any) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('bill_payments')
      .insert({
        ...paymentData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPayments(billId: string) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('bill_payments')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async confirmPayment(paymentId: string, confirmedByAdminId: string) {
    if (this.userRole !== 'admin' && this.userRole !== 'superadmin') {
      throw new Error('Only admins can confirm payments')
    }

    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('bill_payments')
      .update({
        status: 'confirmed',
        confirmed_by_admin_id: confirmedByAdminId,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ VISITOR QUERIES ============

  async getVisitors(filters?: { status?: string }) {
    await this.verifyTenantAccess()

    let query = this.db
      .from('visitor_logs')
      .select('*')
      .eq('society_id', this.societyId)
      .order('check_in_time', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createVisitor(visitorData: any) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('visitor_logs')
      .insert({
        ...visitorData,
        society_id: this.societyId,
        status: 'pending_approval'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ COMPLAINT QUERIES ============

  async getComplaints(filters?: { status?: string }) {
    await this.verifyTenantAccess()

    let query = this.db
      .from('complaints')
      .select('*')
      .eq('society_id', this.societyId)
      .order('created_at', { ascending: false })

    if (this.userRole === 'resident') {
      query = query.eq('resident_id', this.userId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createComplaint(complaintData: any) {
    await this.verifyTenantAccess()

    const { data, error } = await this.db
      .from('complaints')
      .insert({
        ...complaintData,
        society_id: this.societyId,
        resident_id: this.userId,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Factory function to create TenantDB from request headers
 */
export function getTenantDB(request: Request): TenantDB {
  const userId = request.headers.get('x-user-id')
  const societyId = request.headers.get('x-society-id')
  const role = request.headers.get('x-user-role')

  if (!userId || !societyId || !role) {
    throw new Error('Missing tenant context headers')
  }

  return new TenantDB(
    societyId,
    userId,
    role as 'resident' | 'admin' | 'watchman' | 'superadmin'
  )
}

export { supabaseAdmin, supabasePublic, SUPABASE_URL }
