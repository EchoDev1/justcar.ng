/**
 * Admin Unsuspend Buyer API
 * POST /api/admin/buyers/unsuspend
 * Removes suspension from a buyer
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { buyerId } = body

    // Validation
    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required' },
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

    // Get buyer
    const { data: buyer, error: buyerError } = await serviceSupabase
      .from('buyers')
      .select('*')
      .eq('id', buyerId)
      .maybeSingle()

    if (buyerError || !buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    // Check if actually suspended
    if (!buyer.is_suspended) {
      return NextResponse.json(
        { error: 'User is not suspended' },
        { status: 400 }
      )
    }

    // Unsuspend the user
    const { error: updateError } = await serviceSupabase
      .from('buyers')
      .update({
        is_suspended: false,
        suspended_at: null,
        suspended_until: null,
        suspend_reason: null,
        suspended_by: null,
        account_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', buyerId)

    if (updateError) {
      console.error('Error unsuspending buyer:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsuspend user: ' + updateError.message },
        { status: 500 }
      )
    }

    // Log the action
    await serviceSupabase
      .from('buyer_admin_actions')
      .insert([
        {
          buyer_id: buyerId,
          admin_id: admin.id,
          action_type: 'unsuspend',
          previous_status: 'suspended',
          new_status: 'active'
        }
      ])

    return NextResponse.json(
      {
        success: true,
        message: 'User unsuspended successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Unsuspend user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
