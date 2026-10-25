import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { comparePassword } from '@/lib/crypto'
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    email: string
    role: 'superadmin'
  }
  sessionToken?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    if (!supabaseAdmin) {
      console.error('[AUTH] Supabase admin client not initialized')
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication service unavailable. Please try again later.',
        },
        { status: 503 }
      )
    }

    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Query superadmins table
    const normalizedEmail = email.toLowerCase()
    console.log('[AUTH] Attempting login:', normalizedEmail)
    
    const { data: superadminData, error: queryError } = await supabaseAdmin
      .from('superadmins')
      .select('id, email, password_hash')
      .eq('email', normalizedEmail)
      .single()

    if (queryError) {
      console.log('[AUTH] Query error code:', queryError.code, 'message:', queryError.message)
    }
    console.log('[AUTH] Query result - found:', !!superadminData, 'has password:', !!superadminData?.password_hash)

    if (queryError || !superadminData) {
      console.warn('[AUTH] Superadmin not found:', normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Verify password using bcrypt
    const isPasswordValid = comparePassword(password, superadminData.password_hash)
    if (!isPasswordValid) {
      console.warn(`[AUTH] Invalid password for superadmin: ${email}`)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    const session = await createSession('superadmin', superadminData.id)

    // Log successful login
    console.log(`[AUTH] Superadmin login successful: ${email}`)

    // Update last login time
    const { error: lastLoginError } = await supabaseAdmin
      .from('superadmins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', superadminData.id)
    if (lastLoginError) {
      console.error('[AUTH] Failed to update last_login:', lastLoginError.message)
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: superadminData.id,
          email: superadminData.email,
          role: 'superadmin',
        },
      },
      { status: 200 }
    )
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt))
    return response
  } catch (error) {
    console.error('[AUTH] Superadmin login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during authentication. Please try again.',
      },
      { status: 500 }
    )
  }
}
