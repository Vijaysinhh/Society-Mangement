import { getAuthUser } from '@/lib/auth'
import { emergencyAlertSchema } from '@/lib/schemas'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

// In-memory broadcast queue for WebSocket notifications
const alertBroadcasters = new Map<
  string,
  (alert: any) => void
>()

/**
 * Register a broadcaster function for a society
 * Called by WebSocket server to broadcast to all connected clients
 */
export function registerAlertBroadcaster(
  societyId: string,
  broadcaster: (alert: any) => void
) {
  alertBroadcasters.set(societyId, broadcaster)
}

/**
 * GET /api/emergency?society_id=xxx
 * Get emergency alert history
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId || societyId !== user.societyId) {
      throw errors.tenantViolation()
    }

    // Get recent emergency alerts
    const { data: alerts, error } = await supabaseAdmin
      .from('emergency_alerts')
      .select(
        `
        *,
        watchmen (id, name)
      `
      )
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return Response.json({ success: true, data: alerts })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/emergency
 * Watchman triggers emergency alert (instant broadcast via WebSocket)
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'watchman') {
      throw errors.forbidden('Only watchmen can trigger emergency alerts')
    }

    const body = await request.json()
    const validatedData = emergencyAlertSchema.parse(body)

    // Save to database
    const { data: alert, error: dbError } = await supabaseAdmin
      .from('emergency_alerts')
      .insert({
        society_id: user.societyId,
        watchman_id: user.sub,
        ...validatedData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Broadcast to all WebSocket connections for this society (real-time)
    const broadcaster = alertBroadcasters.get(user.societyId)
    if (broadcaster) {
      broadcaster({
        type: 'EMERGENCY_ALERT',
        data: alert,
        timestamp: new Date().toISOString()
      })
    }

    return Response.json(
      {
        success: true,
        data: alert,
        message: 'Emergency alert sent to all residents!'
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/emergency/:id/acknowledge
 * Admin acknowledges emergency was handled
 */
export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw errors.forbidden('Only admins can acknowledge emergencies')
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')

    if (!alertId) {
      throw errors.validation('alert id is required')
    }

    const { data: updatedAlert, error } = await supabaseAdmin
      .from('emergency_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by_admin_id: user.sub,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('society_id', user.societyId)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, data: updatedAlert })
  } catch (error) {
    return handleApiError(error)
  }
}
