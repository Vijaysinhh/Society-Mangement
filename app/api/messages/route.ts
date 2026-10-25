import { sendMessageSchema } from '@/lib/schemas'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * GET /api/messages?conversation_id=xxx
 * Get messages in a conversation
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      throw errors.validation('conversation_id is required')
    }

    // Get messages in conversation
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return Response.json({ success: true, data: messages })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/messages
 * Send message in conversation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    // Create message
    const { data: message, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        ...validatedData,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (msgError) throw msgError

    return Response.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}


