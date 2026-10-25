import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { getRequestSession } from '@/lib/session'
import { validateAdminInput, ValidationError } from '@/lib/validation'
import * as response from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'superadmin') return response.error('Unauthorized', 401)

    const societyId = new URL(request.url).searchParams.get('societyId')
    if (!societyId) return response.error('Society ID is required', 400)
    const { data, error } = await supabaseAdmin
      .from('society_admins')
      .select('id, society_id, username, post_name, holder_name, phone, is_primary, status, last_login, created_at')
      .eq('society_id', societyId)
      .order('created_at', { ascending: true })

    if (error) return response.error(error.message, 400)
    return Response.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('[Society admins] GET failed:', error)
    return response.serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'superadmin') return response.error('Unauthorized', 401)

    const body = await request.json()
    if (!body.societyId) return response.error('Society ID is required', 400)
    const admin = validateAdminInput(body)
    if (admin.password.length < 8) return response.error('Password must be at least 8 characters', 400)

    const { data: society } = await supabaseAdmin
      .from('societies')
      .select('id, status')
      .eq('id', body.societyId)
      .maybeSingle()
    if (!society) return response.error('Society not found', 404)
    if (society.status === 'archived') return response.error('Cannot add an admin to an archived society', 409)

    const { data, error } = await supabaseAdmin
      .from('society_admins')
      .insert({
        society_id: body.societyId,
        username: admin.username.toLowerCase(),
        password_hash: hashPassword(admin.password),
        post_name: body.postName || 'Society Administrator',
        holder_name: admin.name,
        phone: admin.phone,
        is_primary: false,
        status: 'active',
        created_by: session.accountId,
      })
      .select('id, society_id, username, post_name, holder_name, phone, is_primary, status, created_at')
      .single()

    if (error) {
      if (error.code === '23505') return response.conflict('Username already exists')
      return response.error('Could not create society administrator', 400)
    }
    await supabaseAdmin.from('audit_events').insert({
      society_id: body.societyId,
      actor_type: 'superadmin',
      actor_id: session.accountId,
      action: 'society_admin.created',
      entity_type: 'society_admin',
      entity_id: data.id,
      metadata: { username: data.username, post_name: data.post_name },
    })
    return response.created(data)
  } catch (error) {
    if (error instanceof ValidationError) return response.error(error.message, 400)
    console.error('[Society admins] POST failed:', error)
    return response.serverError()
  }
}
