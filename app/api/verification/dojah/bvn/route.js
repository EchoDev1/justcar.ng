/**
 * BVN Verification API
 * POST /api/verification/dojah/bvn
 * Verify dealer's Bank Verification Number
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyBVN, validateBVN, isDojahConfigured } from '@/lib/verification/dojah'

export async function POST(request) {
  console.log('🔵 [BVN VERIFY] Request received')

  try {
    // Check if Dojah is configured
    if (!isDojahConfigured()) {
      console.log('⚠️ [BVN VERIFY] Dojah API not configured')
      return NextResponse.json(
        { error: 'Verification service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { dealerId, bvn, firstName, lastName } = body

    console.log('📝 [BVN VERIFY] Dealer ID:', dealerId)

    // Validation
    if (!dealerId || !bvn || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, bvn, firstName, lastName' },
        { status: 400 }
      )
    }

    // Validate BVN format
    if (!validateBVN(bvn)) {
      return NextResponse.json(
        { error: 'Invalid BVN format. Must be 11 digits.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if dealer exists
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, name, email, bvn_verified')
      .eq('id', dealerId)
      .maybeSingle()

    if (dealerError || !dealer) {
      console.log('❌ [BVN VERIFY] Dealer not found:', dealerError?.message)
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (dealer.bvn_verified) {
      return NextResponse.json(
        { error: 'BVN already verified for this dealer' },
        { status: 400 }
      )
    }

    console.log('🔍 [BVN VERIFY] Verifying BVN with Dojah...')

    // Call Dojah API to verify BVN
    const result = await verifyBVN(bvn, firstName, lastName)

    // Log API call
    await supabase.from('dojah_api_logs').insert({
      entity_type: 'dealer',
      entity_id: dealerId,
      api_endpoint: '/api/v1/kyc/bvn',
      verification_type: 'bvn_verify',
      request_payload: { bvn: bvn.substring(0, 3) + '****' + bvn.substring(7), firstName, lastName },
      response_payload: result.success ? { verified: result.data?.verification?.verified } : { error: result.error },
      response_status: result.status || (result.success ? 200 : 400),
      success: result.success && result.data?.verification?.verified,
      error_message: result.success ? null : result.error,
      error_code: result.errorCode,
      api_cost_units: 1
    })

    if (!result.success) {
      console.log('❌ [BVN VERIFY] Dojah API error:', result.error)
      return NextResponse.json(
        { error: result.error || 'BVN verification failed' },
        { status: 400 }
      )
    }

    const bvnData = result.data
    const verification = bvnData.verification
    const verified = verification?.verified || false

    console.log('📝 [BVN VERIFY] Verification result:', { verified, nameMatchScore: verification?.nameMatchScore })

    // Update or create dealer verification tier
    const { data: existingTier } = await supabase
      .from('dealer_verification_tiers')
      .select('id')
      .eq('dealer_id', dealerId)
      .maybeSingle()

    const verificationData = {
      bvn_number: bvn,
      bvn_verified: verified,
      bvn_verified_at: verified ? new Date().toISOString() : null,
      bvn_dojah_reference: result.data?.reference || null,
      bvn_first_name: bvnData.first_name || bvnData.firstName || null,
      bvn_last_name: bvnData.last_name || bvnData.lastName || bvnData.surname || null,
      bvn_phone_number: bvnData.phone_number || bvnData.phoneNumber || bvnData.phone || null,
      bvn_data: bvnData,
      updated_at: new Date().toISOString()
    }

    if (existingTier) {
      await supabase
        .from('dealer_verification_tiers')
        .update(verificationData)
        .eq('dealer_id', dealerId)
    } else {
      await supabase
        .from('dealer_verification_tiers')
        .insert({
          dealer_id: dealerId,
          ...verificationData
        })
    }

    // Update dealer record
    if (verified) {
      await supabase
        .from('dealers')
        .update({
          bvn_verified: true
        })
        .eq('id', dealerId)
    }

    console.log('✅ [BVN VERIFY] Verification complete')

    return NextResponse.json({
      success: true,
      verified,
      message: verified ? 'BVN verified successfully' : 'BVN verification failed - name mismatch',
      data: {
        firstName: bvnData.first_name || bvnData.firstName,
        lastName: bvnData.last_name || bvnData.lastName || bvnData.surname,
        phoneNumber: bvnData.phone_number || bvnData.phoneNumber,
        nameMatchScore: verification?.nameMatchScore
      }
    })

  } catch (error) {
    console.error('BVN verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during BVN verification' },
      { status: 500 }
    )
  }
}
