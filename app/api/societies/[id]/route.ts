import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

async function isSuperadmin(request: Request) {
  const session = await getRequestSession(request)
  return session?.accountType === 'superadmin'
}

type SocietyRouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: SocietyRouteContext) {
  try {
    if (!supabaseAdmin) {
      return response.error('Database not configured', 503)
    }
    if (!(await isSuperadmin(request))) return response.error('Unauthorized', 401)

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('societies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return response.error('Society not found', 404)
      }
      console.error('[API] Database error:', error)
      return response.error(error.message, 400)
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return response.serverError()
  }
}

export async function PUT(request: NextRequest, { params }: SocietyRouteContext) {
  try {
    if (!supabaseAdmin) {
      return response.error('Database not configured', 503)
    }
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'superadmin') return response.error('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()
    const allowed = ['name', 'address', 'city', 'state', 'postal_code', 'admin_phone', 'contact_person', 'status'] as const
    const updates = Object.fromEntries(
      allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]])
    )
    if (updates.status && !['active', 'paused', 'archived'].includes(updates.status)) {
      return response.error('Invalid society status', 400)
    }

    const { data, error } = await supabaseAdmin
      .from('societies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API] Database error:', error)
      return response.error(error.message, 400)
    }

    await supabaseAdmin.from('audit_events').insert({
      society_id: id,
      actor_type: 'superadmin',
      actor_id: session.accountId,
      action: updates.status ? `society.${updates.status}` : 'society.updated',
      entity_type: 'society',
      entity_id: id,
      metadata: { changed_fields: Object.keys(updates) },
    })

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return response.serverError()
  }
}

export async function DELETE(request: NextRequest, { params }: SocietyRouteContext) {
  try {
    if (!supabaseAdmin) {
      return response.error('Database not configured', 503)
    }
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'superadmin') return response.error('Unauthorized', 401)

    const { id } = await params
    // Preserve tenant history: delete means archive, never cascade-delete.
    const { error } = await supabaseAdmin
      .from('societies')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('[API] Database error:', error)
      return response.error(error.message, 400)
    }

    await supabaseAdmin.from('audit_events').insert({
      society_id: id,
      actor_type: 'superadmin',
      actor_id: session.accountId,
      action: 'society.archived',
      entity_type: 'society',
      entity_id: id,
    })

    return Response.json({ success: true, message: 'Society archived' })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return response.serverError()
  }
}
