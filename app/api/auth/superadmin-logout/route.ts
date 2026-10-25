import { NextRequest, NextResponse } from 'next/server'

interface LogoutResponse {
  success: boolean
  message?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  try {
    // Client-side cleanup is handled by the auth utility
    // This endpoint is optional but useful for backend cleanup if needed

    console.log('[AUTH] Superadmin logout request processed')

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[AUTH] Superadmin logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during logout',
      },
      { status: 500 }
    )
  }
}
