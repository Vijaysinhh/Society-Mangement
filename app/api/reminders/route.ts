import { getAuthUser } from '@/lib/auth'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * GET /api/reminders?society_id=xxx
 * Get payment reminders for resident
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId || societyId !== user.societyId) {
      throw errors.tenantViolation()
    }

    if (user.role !== 'resident') {
      throw errors.forbidden('Only residents can view their reminders')
    }

    // Get bills due soon (within 7 days)
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: upcomingBills, error } = await supabaseAdmin
      .from('maintenance_bills')
      .select('*')
      .eq('society_id', societyId)
      .eq('resident_id', user.sub)
      .eq('status', 'unpaid')
      .gte('due_date', today.toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true })

    if (error) throw error

    // Calculate days until due for each bill
    const reminders = upcomingBills?.map(bill => ({
      ...bill,
      daysUntilDue: Math.ceil(
        (new Date(bill.due_date).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      ),
      reminderType:
        Math.ceil(
          (new Date(bill.due_date).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
        ) <= 1
          ? 'urgent'
          : 'upcoming'
    }))

    return Response.json({ success: true, data: reminders })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/reminders/send
 * Admin manually sends payment reminders to all residents with pending bills
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw errors.forbidden('Only admins can send reminders')
    }

    const { searchParams } = new URL(request.url)
    const societyId = user.societyId

    // Get all unpaid bills
    const { data: unpaidBills, error: billsError } = await supabaseAdmin
      .from('maintenance_bills')
      .select(`
        *,
        residents (id, name, email)
      `)
      .eq('society_id', societyId)
      .eq('status', 'unpaid')

    if (billsError) throw billsError

    // Create reminder records
    const reminders = unpaidBills?.map(bill => ({
      resident_id: bill.resident_id,
      society_id: societyId,
      bill_id: bill.id,
      amount: bill.amount,
      due_date: bill.due_date,
      message: `Payment reminder: Bill of ₹${bill.amount} is due on ${new Date(bill.due_date).toLocaleDateString()}`,
      sent_by_admin_id: user.sub,
      sent_at: new Date().toISOString(),
      read: false
    }))

    // Bulk insert reminders
    const { data: createdReminders, error: createError } = await supabaseAdmin
      .from('payment_reminders')
      .insert(reminders || [])
      .select()

    if (createError) throw createError

    // TODO: Send SMS/Email to residents
    // This would integrate with Twilio, SendGrid, etc.

    return Response.json({
      success: true,
      data: {
        remindersSent: createdReminders?.length || 0,
        message: `Reminders sent to ${createdReminders?.length || 0} residents`
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/reminders/:id/read
 * Mark reminder as read
 */
export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('id')

    if (!reminderId) {
      throw errors.validation('reminder id is required')
    }

    const { data: reminder, error: getError } = await supabaseAdmin
      .from('payment_reminders')
      .select('*')
      .eq('id', reminderId)
      .single()

    if (getError || !reminder) {
      throw errors.notFound('Reminder not found')
    }

    if (reminder.resident_id !== user.sub && user.role !== 'admin') {
      throw errors.forbidden('Cannot mark other residents reminders as read')
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('payment_reminders')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', reminderId)
      .select()
      .single()

    if (updateError) throw updateError

    return Response.json({ success: true, data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
