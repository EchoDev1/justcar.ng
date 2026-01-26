/**
 * Admin Delete Buyer API
 * DELETE /api/admin/buyers/delete
 * Permanently deletes a buyer
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request) {
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
      .select('id, role')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get buyer before deletion for logging
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

    // Log the action before deletion
    await serviceSupabase
      .from('buyer_admin_actions')
      .insert([
        {
          buyer_id: buyerId,
          admin_id: admin.id,
          action_type: 'delete',
          action_notes: `Deleted user: ${buyer.full_name} (${buyer.email})`,
          previous_status: buyer.account_status || 'active',
          new_status: 'deleted',
          metadata: {
            deleted_user_email: buyer.email,
            deleted_user_name: buyer.full_name,
            deleted_at: new Date().toISOString()
          }
        }
      ])

    // Delete the user
    const { error: deleteError } = await serviceSupabase
      .from('buyers')
      .delete()
      .eq('id', buyerId)

    if (deleteError) {
      console.error('Error deleting buyer:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
