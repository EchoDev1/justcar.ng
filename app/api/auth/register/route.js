/**
 * Buyer Registration API - Simple Version
 * POST /api/auth/register
 * Creates buyer account using standard Supabase auth
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('[REGISTER] Registration request received')

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

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      console.error('[REGISTER] Auth error:', authError)

      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please login instead.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    // Check if user was created
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create buyer profile using service role if available, otherwise try with anon key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const dbClient = serviceKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      : supabase

    const { error: insertError } = await dbClient
      .from('buyers')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        full_name: fullName,
        phone: phone || null,
        location: location || null,
        verified: false
      })

    if (insertError) {
      console.error('[REGISTER] Database error:', insertError)
      // Don't fail registration if buyer profile creation fails
      // User can still login and we can create profile later
    }

    console.log('[REGISTER] Registration successful for:', email)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now login.',
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
