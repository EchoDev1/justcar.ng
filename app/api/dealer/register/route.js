/**
 * Dealer Registration API
 * POST /api/dealer/register
 * Public endpoint - dealers can self-register
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      business_name,
      email,
      phone,
      whatsapp,
      location,
      address,
      business_registration_number,
      password
    } = body

    // Validation
    if (!business_name || !email || !phone || !location || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: business_name, email, phone, location, password' },
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
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for public registration
    const supabase = createServiceRoleClient()

    // Check if dealer already exists
    const { data: existingDealer, error: checkError } = await supabase
      .from('dealers')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing dealer:', checkError)
      return NextResponse.json(
        { error: 'Database error while checking existing dealer' },
        { status: 500 }
      )
    }

    if (existingDealer) {
      return NextResponse.json(
        {
          error: 'A dealer account with this email already exists',
          status: existingDealer.status
        },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new dealer with pending status and hashed password
    const { data: newDealer, error: insertError } = await supabase
      .from('dealers')
      .insert([
        {
          business_name: business_name,
          name: business_name, // Keep compatibility with existing schema
          email,
          phone,
          whatsapp: whatsapp || phone,
          location,
          address,
          business_registration_number,
          status: 'pending',
          is_verified: false,
          password_hash: passwordHash,
          password_set_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating dealer:', insertError)
      return NextResponse.json(
        { error: 'Failed to create dealer account: ' + insertError.message },
        { status: 500 }
      )
    }

    // Log the registration
    await supabase
      .from('dealer_auth_logs')
      .insert([
        {
          dealer_id: newDealer.id,
          dealer_email: email,
          event_type: 'registration',
          success: true,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        }
      ])

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Your account is pending approval by our admin team. You will be notified once approved.',
        dealer: {
          id: newDealer.id,
          business_name: newDealer.business_name,
          email: newDealer.email,
          status: newDealer.status
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Dealer registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
