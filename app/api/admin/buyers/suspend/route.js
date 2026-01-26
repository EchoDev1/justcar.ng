/**
 * Admin Suspend Buyer API
 * POST /api/admin/buyers/suspend
 * Suspends a buyer for a specified duration
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { buyerId, reason, duration } = body

    // Validation
    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
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

    // Check if banned
    if (buyer.is_banned) {
      return NextResponse.json(
        { error: 'Cannot suspend a banned user' },
        { status: 400 }
      )
    }

    // Check if already suspended
    if (buyer.is_suspended) {
      return NextResponse.json(
        { error: 'User is already suspended' },
        { status: 400 }
      )
    }

    // Calculate suspension end date
    const durationDays = parseInt(duration) || 7
    const suspendedUntil = new Date()
    suspendedUntil.setDate(suspendedUntil.getDate() + durationDays)

    // Suspend the user
    const { error: updateError } = await serviceSupabase
      .from('buyers')
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_until: suspendedUntil.toISOString(),
        suspend_reason: reason,
        suspended_by: admin.id,
        account_status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', buyerId)

    if (updateError) {
      console.error('Error suspending buyer:', updateError)
      return NextResponse.json(
        { error: 'Failed to suspend user: ' + updateError.message },
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
          action_type: 'suspend',
          action_reason: reason,
          action_notes: `Suspended for ${durationDays} days`,
          previous_status: buyer.account_status || 'active',
          new_status: 'suspended',
          metadata: { duration_days: durationDays, suspended_until: suspendedUntil.toISOString() }
        }
      ])

    return NextResponse.json(
      {
        success: true,
        message: `User suspended for ${durationDays} days`,
        suspended_until: suspendedUntil.toISOString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
