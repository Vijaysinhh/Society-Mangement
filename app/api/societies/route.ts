import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { getRequestSession } from '@/lib/session'
import { validateAdminInput, validateSocietyInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'

async function requireSuperadmin(request: Request) {
  const session = await getRequestSession(request)
  return session?.accountType === 'superadmin' ? session : null
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    if (!(await requireSuperadmin(request))) return response.error('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('limit') || '20', 10)))
    const start = (page - 1) * limit
    const { data, error, count } = await supabaseAdmin
      .from('societies')
      .select('*, society_admins(id, username, post_name, holder_name, phone, status, is_primary, last_login, created_at)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1)

    if (error) return response.error(error.message, 400)
    return Response.json({
      success: true,
      data: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    console.error('[Societies] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await requireSuperadmin(request)
    if (!session) return response.error('Unauthorized', 401)

    const body = await request.json()
    const society = validateSocietyInput(body.society || body)
    const admin = validateAdminInput(body.admin || {})
    if (admin.password.length < 8) return response.error('Admin password must be at least 8 characters', 400)

    const { data, error } = await supabaseAdmin.rpc('provision_society_with_primary_admin', {
      p_name: society.name,
      p_slug: society.slug,
      p_address: society.address,
      p_city: society.city,
      p_state: society.state,
      p_phone: society.phone,
      p_contact_person: society.contact_person,
      p_villas: society.villas,
      p_bungalows: society.bungalows,
      p_flats: society.flats,
      p_admin_username: admin.username.toLowerCase(),
      p_admin_password_hash: hashPassword(admin.password),
      p_admin_name: admin.name,
      p_admin_phone: admin.phone,
      p_created_by: session.accountId,
    })

    if (error) {
      if (error.code === '23505') return response.conflict('Society slug or admin username already exists')
      console.error('[Societies] Provisioning failed:', error)
      return response.error('Could not provision society and administrator', 400)
    }
    return response.created(data)
  } catch (error) {
    if (error instanceof ValidationError) return response.error(error.message, 400)
    console.error('[Societies] POST failed:', error)
    return response.serverError()
  }
}
