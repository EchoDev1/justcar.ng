/**
 * NIN Verification API
 * POST /api/verification/dojah/nin
 * Verify dealer's National Identification Number
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyNIN, lookupNIN, validateNIN, isDojahConfigured } from '@/lib/verification/dojah'

export async function POST(request) {
  console.log('🔵 [NIN VERIFY] Request received')

  try {
    // Check if Dojah is configured
    if (!isDojahConfigured()) {
      console.log('⚠️ [NIN VERIFY] Dojah API not configured')
      return NextResponse.json(
        { error: 'Verification service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { dealerId, nin, firstName, lastName } = body

    console.log('📝 [NIN VERIFY] Dealer ID:', dealerId)

    // Validation
    if (!dealerId || !nin || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, nin, firstName, lastName' },
        { status: 400 }
      )
    }

    // Validate NIN format
    if (!validateNIN(nin)) {
      return NextResponse.json(
        { error: 'Invalid NIN format. Must be 11 digits.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if dealer exists
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, name, email, nin_verified')
      .eq('id', dealerId)
      .maybeSingle()

    if (dealerError || !dealer) {
      console.log('❌ [NIN VERIFY] Dealer not found:', dealerError?.message)
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (dealer.nin_verified) {
      return NextResponse.json(
        { error: 'NIN already verified for this dealer' },
        { status: 400 }
      )
    }

    console.log('🔍 [NIN VERIFY] Verifying NIN with Dojah...')

    // Call Dojah API to verify NIN
    const result = await verifyNIN(nin, firstName, lastName)

    // Log API call
    await supabase.from('dojah_api_logs').insert({
      entity_type: 'dealer',
      entity_id: dealerId,
      api_endpoint: '/api/v1/kyc/nin',
      verification_type: 'nin_verify',
      request_payload: { nin: nin.substring(0, 3) + '****' + nin.substring(7), firstName, lastName },
      response_payload: result.success ? { verified: result.data?.verification?.verified } : { error: result.error },
      response_status: result.status || (result.success ? 200 : 400),
      success: result.success && result.data?.verification?.verified,
      error_message: result.success ? null : result.error,
      error_code: result.errorCode,
      api_cost_units: 1
    })

    if (!result.success) {
      console.log('❌ [NIN VERIFY] Dojah API error:', result.error)
      return NextResponse.json(
        { error: result.error || 'NIN verification failed' },
        { status: 400 }
      )
    }

    const ninData = result.data
    const verification = ninData.verification
    const verified = verification?.verified || false

    console.log('📝 [NIN VERIFY] Verification result:', { verified, nameMatchScore: verification?.nameMatchScore })

    // Update or create dealer verification tier
    const { data: existingTier } = await supabase
      .from('dealer_verification_tiers')
      .select('id')
      .eq('dealer_id', dealerId)
      .maybeSingle()

    const verificationData = {
      nin_number: nin,
      nin_verified: verified,
      nin_verified_at: verified ? new Date().toISOString() : null,
      nin_dojah_reference: result.data?.reference || null,
      nin_first_name: ninData.first_name || ninData.firstName || null,
      nin_last_name: ninData.last_name || ninData.lastName || ninData.surname || null,
      nin_middle_name: ninData.middle_name || ninData.middleName || null,
      nin_date_of_birth: ninData.date_of_birth || ninData.birthdate || null,
      nin_gender: ninData.gender || null,
      nin_photo_url: ninData.photo || ninData.image || null,
      nin_data: ninData,
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
          nin_verified: true
        })
        .eq('id', dealerId)
    }

    console.log('✅ [NIN VERIFY] Verification complete')

    return NextResponse.json({
      success: true,
      verified,
      message: verified ? 'NIN verified successfully' : 'NIN verification failed - name mismatch',
      data: {
        firstName: ninData.first_name || ninData.firstName,
        lastName: ninData.last_name || ninData.lastName || ninData.surname,
        middleName: ninData.middle_name || ninData.middleName,
        gender: ninData.gender,
        dateOfBirth: ninData.date_of_birth || ninData.birthdate,
        nameMatchScore: verification?.nameMatchScore
      }
    })

  } catch (error) {
    console.error('NIN verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during NIN verification' },
      { status: 500 }
    )
  }
}
