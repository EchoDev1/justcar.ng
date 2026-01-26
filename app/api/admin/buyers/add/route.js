/**
 * Admin Add Buyer API
 * POST /api/admin/buyers/add
 * Creates a new buyer account
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { full_name, email, phone, location } = body

    // Validation
    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Verify admin status
    let { data: admin, error: adminError } = await serviceSupabase
      .from('admins')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Check if email already exists
    const { data: existingBuyer, error: existingError } = await serviceSupabase
      .from('buyers')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingBuyer) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create the buyer
    const { data: newBuyer, error: insertError } = await serviceSupabase
      .from('buyers')
      .insert([
        {
          full_name: full_name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          location: location?.trim() || null,
          account_status: 'active',
          is_banned: false,
          is_suspended: false,
          verification_status: 'unverified',
          verification_tier: 'basic',
          lead_score: 'low',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating buyer:', insertError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + insertError.message },
        { status: 500 }
      )
    }

    // Log the action
    await serviceSupabase
      .from('buyer_admin_actions')
      .insert([
        {
          buyer_id: newBuyer.id,
          admin_id: admin.id,
          action_type: 'created',
          action_notes: `User created by admin`,
          new_status: 'active',
          metadata: {
            created_by_admin: true,
            admin_email: user.email
          }
        }
      ])

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        buyer: {
          id: newBuyer.id,
          full_name: newBuyer.full_name,
          email: newBuyer.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Add user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
