/**
 * Admin Approve Dealer API
 * POST /api/admin/approve-dealer
 * Simple one-click approval - changes status from 'pending' to 'active'
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { dealerId, notes } = body

    // Validation
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      )
    }

    // Use regular client for auth check
    const supabase = await createClient()

    // Check if admin is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      )
    }

    // CRITICAL: Use service role client to get admin record (bypass RLS)
    const serviceSupabase = createServiceRoleClient()

    let { data: admin, error: adminError } = await serviceSupabase
      .from('admins')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (adminError) {
      console.error('Error fetching admin:', adminError)
      return NextResponse.json(
        { error: 'Error verifying admin status: ' + adminError.message },
        { status: 500 }
      )
    }

    if (!admin) {
      // No admin record found - create one automatically for logged-in admin
      console.log('No admin record found, creating one for user:', user.id)

      const { data: newAdmin, error: createError } = await serviceSupabase
        .from('admins')
        .insert([
          {
            auth_id: user.id,
            email: user.email,
            role: 'admin',
            is_active: true
          }
        ])
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating admin record:', createError)
        return NextResponse.json(
          { error: 'Could not create admin record: ' + createError.message },
          { status: 500 }
        )
      }

      admin = newAdmin
      console.log('Admin record created successfully:', admin.id)
    }

    // Get dealer (already using service role client from above)
    const { data: dealer, error: dealerError } = await serviceSupabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .maybeSingle()

    if (dealerError || !dealer) {
      console.error('Error fetching dealer:', dealerError)
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if dealer is pending
    if (dealer.status !== 'pending') {
      return NextResponse.json(
        { error: `Dealer status is already '${dealer.status}'. Only pending dealers can be approved.` },
        { status: 400 }
      )
    }

    // Check if dealer has password set
    if (!dealer.password_hash) {
      return NextResponse.json(
        { error: 'Dealer has not completed registration (no password set)' },
        { status: 400 }
      )
    }

    // Approve dealer - change status to active (use service role client)
    const { error: updateError } = await serviceSupabase
      .from('dealers')
      .update({
        status: 'active',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by_admin_id: admin.id,
        verification_notes: notes || null
      })
      .eq('id', dealerId)

    if (updateError) {
      console.error('Error approving dealer:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve dealer: ' + updateError.message },
        { status: 500 }
      )
    }

    // Log the approval (use service role client)
    await serviceSupabase
      .from('dealer_auth_logs')
      .insert([
        {
          dealer_id: dealerId,
          dealer_email: dealer.email,
          event_type: 'verification_by_admin',
          success: true,
          admin_id: admin.id,
          admin_notes: notes || 'Dealer approved by admin'
        }
      ])

    return NextResponse.json(
      {
        success: true,
        message: 'Dealer approved successfully! They can now login.',
        dealer: {
          id: dealer.id,
          business_name: dealer.business_name || dealer.name,
          email: dealer.email,
          status: 'active'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dealer approval error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during approval' },
      { status: 500 }
    )
  }
}
