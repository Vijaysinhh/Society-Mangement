import { NextResponse } from 'next/server'
import { revokeSession, SESSION_COOKIE } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1)
    await revokeSession(token)

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    response.cookies.delete(SESSION_COOKIE)

    return response
  } catch (error) {
    console.error('[Logout API] Error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
