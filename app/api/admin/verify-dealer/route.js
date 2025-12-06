/**
 * Admin Verify Dealer API
 * POST /api/admin/verify-dealer
 * Allows admin to verify pending dealers
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Helper function to generate setup token
function generateSetupToken() {
  return crypto.randomBytes(32).toString('base64url')
}

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

    const supabase = await createClient()

    // Check if admin is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      )
    }

    // Get admin record
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 403 }
      )
    }

    // Get dealer
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealerId)
      .maybeSingle()

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if dealer is already verified or active
    if (dealer.status === 'verified' || dealer.status === 'active') {
      return NextResponse.json(
        { error: 'Dealer is already verified' },
        { status: 400 }
      )
    }

    // Generate setup token for password creation
    const setupToken = generateSetupToken()
    const setupTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Update dealer status to verified and generate setup token
    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        status: 'verified',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by_admin_id: admin.id,
        verification_notes: notes || null,
        setup_token: setupToken,
        setup_token_expires_at: setupTokenExpiresAt.toISOString()
      })
      .eq('id', dealerId)

    if (updateError) {
      console.error('Error verifying dealer:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify dealer: ' + updateError.message },
        { status: 500 }
      )
    }

    // Log the verification
    await supabase
      .from('dealer_auth_logs')
      .insert([
        {
          dealer_id: dealerId,
          dealer_email: dealer.email,
          event_type: 'verification_by_admin',
          success: true,
          admin_id: admin.id,
          admin_notes: notes
        }
      ])

    // Generate setup link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const setupLink = `${baseUrl}/dealer/setup?email=${encodeURIComponent(dealer.email)}&token=${setupToken}`

    return NextResponse.json(
      {
        success: true,
        message: 'Dealer verified successfully',
        dealer: {
          id: dealer.id,
          business_name: dealer.business_name || dealer.name,
          email: dealer.email,
          status: 'verified'
        },
        setupLink,
        setupToken
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Dealer verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification' },
      { status: 500 }
    )
  }
}
