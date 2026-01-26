/**
 * Buyer Registration API with Email Verification
 * POST /api/auth/register
 * Creates buyer account and sends verification email via Resend
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmailConfirmation } from '@/lib/email/resend'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, location } = body

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, fullName' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role for admin operations
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Check if buyer already exists
    const { data: existingBuyer } = await supabase
      .from('buyers')
      .select('id, email, email_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingBuyer) {
      if (existingBuyer.email_verified) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please login instead.' },
          { status: 409 }
        )
      } else {
        // Resend verification email for unverified account
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await supabase
          .from('buyers')
          .update({
            verification_token: verificationToken,
            verification_token_expires_at: tokenExpiry.toISOString()
          })
          .eq('id', existingBuyer.id)

        const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

        const emailResult = await sendEmailConfirmation({
          userEmail: email,
          userName: fullName,
          confirmationUrl,
          userType: 'buyer'
        })

        return NextResponse.json({
          success: true,
          message: 'A verification email has been resent to your email address. Please check your inbox.',
          requiresVerification: true
        })
      }
    }

    // Create auth user in Supabase Auth
    let authData, authError

    if (serviceKey) {
      // Use admin API if service key available
      const result = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
          phone,
          location,
          user_type: 'buyer'
        }
      })
      authData = result.data
      authError = result.error
    } else {
      // Fallback to regular signup
      const result = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            location,
            user_type: 'buyer'
          }
        }
      })
      authData = result.data
      authError = result.error
    }

    if (authError) {
      console.error('[REGISTER] Auth error:', authError)

      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create buyer profile in buyers table
    const { error: insertError } = await supabase
      .from('buyers')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: fullName,
        phone: phone || null,
        location: location || null,
        verified: false,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: tokenExpiry.toISOString()
      })

    if (insertError) {
      console.error('[REGISTER] Database error:', insertError)
      // Try to clean up auth user
      if (serviceKey) {
        await supabase.auth.admin.deleteUser(authData.user.id)
      }
      return NextResponse.json(
        { error: 'Failed to create buyer profile: ' + insertError.message },
        { status: 500 }
      )
    }

    // Send verification email via Resend
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    const emailResult = await sendEmailConfirmation({
      userEmail: email,
      userName: fullName,
      confirmationUrl,
      userType: 'buyer'
    })

    if (!emailResult.success) {
      console.error('[REGISTER] Email send error:', emailResult.error)
      // Don't fail registration, user can request resend
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      requiresVerification: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    }, { status: 201 })

  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
