/**
 * CAC Verification API
 * POST /api/verification/dojah/cac
 * Verify dealer's Corporate Affairs Commission registration
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyCAC, lookupCACAdvanced, isDojahConfigured } from '@/lib/verification/dojah'

export async function POST(request) {
  console.log('🔵 [CAC VERIFY] Request received')

  try {
    // Check if Dojah is configured
    if (!isDojahConfigured()) {
      console.log('⚠️ [CAC VERIFY] Dojah API not configured')
      return NextResponse.json(
        { error: 'Verification service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { dealerId, rcNumber, businessName } = body

    console.log('📝 [CAC VERIFY] Dealer ID:', dealerId)

    // Validation
    if (!dealerId || !rcNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: dealerId, rcNumber' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if dealer exists
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, name, business_name, email, cac_verified')
      .eq('id', dealerId)
      .maybeSingle()

    if (dealerError || !dealer) {
      console.log('❌ [CAC VERIFY] Dealer not found:', dealerError?.message)
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (dealer.cac_verified) {
      return NextResponse.json(
        { error: 'CAC already verified for this dealer' },
        { status: 400 }
      )
    }

    console.log('🔍 [CAC VERIFY] Verifying CAC with Dojah...')

    // Use the business name provided or from dealer record
    const businessNameToVerify = businessName || dealer.business_name || dealer.name

    // Call Dojah API to verify CAC
    const result = await verifyCAC(rcNumber, businessNameToVerify)

    // Also get advanced CAC info with directors
    let advancedResult = null
    if (result.success) {
      advancedResult = await lookupCACAdvanced(rcNumber)
    }

    // Log API call
    await supabase.from('dojah_api_logs').insert({
      entity_type: 'dealer',
      entity_id: dealerId,
      api_endpoint: '/api/v1/kyc/cac',
      verification_type: 'cac_verify',
      request_payload: { rcNumber, businessName: businessNameToVerify },
      response_payload: result.success ? { verified: result.data?.verification?.verified } : { error: result.error },
      response_status: result.status || (result.success ? 200 : 400),
      success: result.success && result.data?.verification?.verified,
      error_message: result.success ? null : result.error,
      error_code: result.errorCode,
      api_cost_units: advancedResult ? 2 : 1
    })

    if (!result.success) {
      console.log('❌ [CAC VERIFY] Dojah API error:', result.error)
      return NextResponse.json(
        { error: result.error || 'CAC verification failed' },
        { status: 400 }
      )
    }

    const cacData = result.data
    const verification = cacData.verification
    const verified = verification?.verified || false

    // Extract directors from advanced lookup
    const directors = advancedResult?.success
      ? (advancedResult.data?.directors || advancedResult.data?.shareholders || [])
      : []

    console.log('📝 [CAC VERIFY] Verification result:', { verified, nameMatchScore: verification?.nameMatchScore })

    // Update or create dealer verification tier
    const { data: existingTier } = await supabase
      .from('dealer_verification_tiers')
      .select('id, nin_first_name, nin_last_name, bvn_first_name, bvn_last_name')
      .eq('dealer_id', dealerId)
      .maybeSingle()

    // Check if dealer name matches any director
    let ownerNameMatch = false
    let ownerNameMatchScore = 0

    if (directors.length > 0 && existingTier) {
      const dealerFirstName = existingTier.nin_first_name || existingTier.bvn_first_name || ''
      const dealerLastName = existingTier.nin_last_name || existingTier.bvn_last_name || ''
      const dealerFullName = `${dealerFirstName} ${dealerLastName}`.toLowerCase()

      for (const director of directors) {
        const directorName = (director.name || director.full_name || '').toLowerCase()
        if (directorName && dealerFullName) {
          const nameParts = dealerFullName.split(' ')
          const matchingParts = nameParts.filter(part =>
            part.length > 2 && directorName.includes(part)
          )
          if (matchingParts.length >= 2) {
            ownerNameMatch = true
            ownerNameMatchScore = Math.min(100, matchingParts.length * 30)
            break
          }
        }
      }
    }

    const verificationData = {
      cac_number: rcNumber.replace(/^RC/i, '').trim(),
      cac_verified: verified,
      cac_verified_at: verified ? new Date().toISOString() : null,
      cac_dojah_reference: result.data?.reference || null,
      cac_business_name: cacData.company_name || cacData.companyName || cacData.business_name || null,
      cac_registration_date: cacData.registration_date || cacData.date_of_registration || null,
      cac_business_type: cacData.company_type || cacData.type || cacData.classification || null,
      cac_business_address: cacData.address || cacData.business_address || cacData.registered_address || null,
      cac_directors: directors,
      cac_data: cacData,
      owner_name_match: ownerNameMatch,
      owner_name_match_score: ownerNameMatchScore,
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
          cac_verified: true,
          business_registration_number: rcNumber
        })
        .eq('id', dealerId)
    }

    console.log('✅ [CAC VERIFY] Verification complete')

    return NextResponse.json({
      success: true,
      verified,
      message: verified ? 'CAC verified successfully' : 'CAC verification failed - business name mismatch',
      data: {
        businessName: cacData.company_name || cacData.companyName || cacData.business_name,
        rcNumber: rcNumber,
        registrationDate: cacData.registration_date || cacData.date_of_registration,
        businessType: cacData.company_type || cacData.type,
        address: cacData.address || cacData.business_address,
        directors: directors.map(d => ({
          name: d.name || d.full_name,
          designation: d.designation || d.role
        })),
        ownerNameMatch,
        nameMatchScore: verification?.nameMatchScore
      }
    })

  } catch (error) {
    console.error('CAC verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during CAC verification' },
      { status: 500 }
    )
  }
}
