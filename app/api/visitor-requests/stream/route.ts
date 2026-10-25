import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  if (!supabaseAdmin) return Response.json({ error: 'Database not configured' }, { status: 503 })
  const session = await getRequestSession(request)
  if (!session?.societyId || !['watchman', 'resident', 'society_admin'].includes(session.accountType)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const encoder = new TextEncoder()
  let heartbeat: ReturnType<typeof setInterval> | undefined
  let closed = false
  const channel = supabaseAdmin.channel(`visitor-stream:${session.societyId}:${session.id}`)

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, payload: object) => {
        if (closed) return
        try { controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)) } catch { closed = true }
      }

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_requests', filter: `society_id=eq.${session.societyId}` }, (change) => {
          send('visitor-change', { event: change.eventType, at: new Date().toISOString() })
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') send('ready', { connected: true })
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') send('stream-error', { connected: false })
        })

      heartbeat = setInterval(() => send('heartbeat', { at: new Date().toISOString() }), 15000)
      request.signal.addEventListener('abort', () => {
        closed = true
        if (heartbeat) clearInterval(heartbeat)
        void supabaseAdmin.removeChannel(channel)
        try { controller.close() } catch { /* already closed */ }
      }, { once: true })
    },
    cancel() {
      closed = true
      if (heartbeat) clearInterval(heartbeat)
      void supabaseAdmin.removeChannel(channel)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
