import { NextResponse } from 'next/server'
import { getRequestSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getRequestSession(request)
  // Session discovery is also used on public/login screens. Being logged out is
  // a valid state, not an API failure; protected routes still enforce access in
  // their layouts and mutation handlers.
  if (!session) return NextResponse.json({ authenticated: false })

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.accountId,
      role: session.accountType,
      societyId: session.societyId,
    },
  })
}
