/**
 * Dealer Login API
 * POST /api/dealer/login
 * Authenticates dealer with email and password (no Supabase Auth)
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Helper function to generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // CRITICAL: Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    // Get dealer by email
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (dealerError || !dealer) {
      // Log failed attempt
      await supabase
        .from('dealer_auth_logs')
        .insert([
          {
            dealer_email: email,
            event_type: 'login_failed',
            success: false,
            error_message: 'Dealer account not found',
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent')
          }
        ])

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (dealer.locked_until && new Date(dealer.locked_until) > new Date()) {
      return NextResponse.json(
        {
          error: 'Account is temporarily locked due to multiple failed login attempts',
          lockedUntil: dealer.locked_until
        },
        { status: 423 }
      )
    }

    // Check dealer status
    if (dealer.status === 'pending') {
      return NextResponse.json(
        {
          error: 'Your account is pending verification by our admin team',
          status: 'pending'
        },
        { status: 403 }
      )
    }

    if (dealer.status === 'verified') {
      return NextResponse.json(
        {
          error: 'Please set up your password first',
          status: 'verified',
          needsPasswordSetup: true,
          setupToken: dealer.setup_token
        },
        { status: 403 }
      )
    }

    if (dealer.status === 'suspended') {
      return NextResponse.json(
        {
          error: 'Your account has been suspended. Please contact support',
          status: 'suspended'
        },
        { status: 403 }
      )
    }

    // Check if password is set
    if (!dealer.password_hash) {
      return NextResponse.json(
        {
          error: 'Password not set. Please complete your account setup',
          needsPasswordSetup: true
        },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, dealer.password_hash)

    if (!passwordMatch) {
      // Increment login attempts
      const newLoginAttempts = (dealer.login_attempts || 0) + 1
      const updateData = {
        login_attempts: newLoginAttempts
      }

      // Lock account after 5 failed attempts
      if (newLoginAttempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString() // Lock for 30 minutes

        await supabase
          .from('dealer_auth_logs')
          .insert([
            {
              dealer_id: dealer.id,
              dealer_email: email,
              event_type: 'account_locked',
              success: false,
              error_message: 'Too many failed login attempts',
              ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              user_agent: request.headers.get('user-agent')
            }
          ])
      }

      await supabase
        .from('dealers')
        .update(updateData)
        .eq('id', dealer.id)

      // Log failed attempt
      await supabase
        .from('dealer_auth_logs')
        .insert([
          {
            dealer_id: dealer.id,
            dealer_email: email,
            event_type: 'login_failed',
            success: false,
            error_message: 'Invalid password',
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent')
          }
        ])

      return NextResponse.json(
        {
          error: 'Invalid email or password',
          remainingAttempts: Math.max(0, 5 - newLoginAttempts)
        },
        { status: 401 }
      )
    }

    // Successful login - create session
    const sessionToken = generateSessionToken()
    const refreshToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { data: session, error: sessionError } = await supabase
      .from('dealer_sessions')
      .insert([
        {
          dealer_id: dealer.id,
          session_token: sessionToken,
          refresh_token: refreshToken,
          expires_at: expiresAt.toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        }
      ])
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Reset login attempts and update last login
    await supabase
      .from('dealers')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', dealer.id)

    // Log successful login
    await supabase
      .from('dealer_auth_logs')
      .insert([
        {
          dealer_id: dealer.id,
          dealer_email: email,
          event_type: 'login_success',
          success: true,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        }
      ])

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        dealer: {
          id: dealer.id,
          business_name: dealer.business_name || dealer.name,
          email: dealer.email,
          status: dealer.status
        },
        session: {
          expiresAt: expiresAt.toISOString()
        }
      },
      { status: 200 }
    )

    // Set session cookie
    response.cookies.set('dealer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Dealer login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}
