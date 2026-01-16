/**
 * Vehicle Verification API
 * POST /api/verification/dojah/vehicle
 * Verify vehicle plate number and check stolen vehicle database
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyVehicle, validatePlateNumber, isDojahConfigured } from '@/lib/verification/dojah'

export async function POST(request) {
  console.log('🔵 [VEHICLE VERIFY] Request received')

  try {
    // Check if Dojah is configured
    if (!isDojahConfigured()) {
      console.log('⚠️ [VEHICLE VERIFY] Dojah API not configured')
      return NextResponse.json(
        { error: 'Verification service not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { carId, dealerId, plateNumber, vin, expectedMake, expectedModel, expectedYear, expectedColor } = body

    console.log('📝 [VEHICLE VERIFY] Car ID:', carId)
    console.log('📝 [VEHICLE VERIFY] Plate Number:', plateNumber)

    // Validation
    if (!carId || !dealerId) {
      return NextResponse.json(
        { error: 'Missing required fields: carId, dealerId' },
        { status: 400 }
      )
    }

    if (!plateNumber && !vin) {
      return NextResponse.json(
        { error: 'Either plate number or VIN is required' },
        { status: 400 }
      )
    }

    // Validate plate number format if provided
    if (plateNumber && !validatePlateNumber(plateNumber)) {
      return NextResponse.json(
        { error: 'Invalid plate number format' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if car exists
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, make, model, year, color, dealer_id, vehicle_verified')
      .eq('id', carId)
      .maybeSingle()

    if (carError || !car) {
      console.log('❌ [VEHICLE VERIFY] Car not found:', carError?.message)
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Verify dealer owns this car
    if (car.dealer_id !== dealerId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only verify your own cars' },
        { status: 403 }
      )
    }

    // Check if already verified
    if (car.vehicle_verified) {
      return NextResponse.json(
        { error: 'Vehicle already verified' },
        { status: 400 }
      )
    }

    console.log('🔍 [VEHICLE VERIFY] Verifying vehicle with Dojah...')

    // Build expected details from car record or request
    const expectedDetails = {
      make: expectedMake || car.make,
      model: expectedModel || car.model,
      year: expectedYear || car.year,
      color: expectedColor || car.color
    }

    // Call Dojah API to verify vehicle
    const result = await verifyVehicle(plateNumber, expectedDetails)

    // Log API call
    await supabase.from('dojah_api_logs').insert({
      entity_type: 'car',
      entity_id: carId,
      api_endpoint: '/api/v1/kyc/vehicle',
      verification_type: 'vehicle_plate_check',
      request_payload: { plateNumber, expectedDetails },
      response_payload: result.success ? {
        plateVerified: result.data?.verification?.plateVerified,
        stolenCheckPassed: result.data?.verification?.stolenCheckPassed
      } : { error: result.error },
      response_status: result.status || (result.success ? 200 : 400),
      success: result.success,
      error_message: result.success ? null : result.error,
      error_code: result.errorCode,
      api_cost_units: 2 // Plate lookup + stolen check
    })

    if (!result.success) {
      console.log('❌ [VEHICLE VERIFY] Dojah API error:', result.error)
      return NextResponse.json(
        { error: result.error || 'Vehicle verification failed' },
        { status: 400 }
      )
    }

    const vehicleData = result.data
    const verification = vehicleData.verification

    const plateVerified = verification?.plateVerified || false
    const stolenCheckPassed = verification?.stolenCheckPassed !== false // Default to true if not checked
    const stolenReportFound = verification?.stolenReportFound || false

    console.log('📝 [VEHICLE VERIFY] Verification result:', {
      plateVerified,
      stolenCheckPassed,
      stolenReportFound
    })

    // Determine overall status
    let status = 'pending'
    let flaggedReason = null

    if (stolenReportFound) {
      status = 'flagged'
      flaggedReason = 'Vehicle found in stolen vehicle database'
    } else if (plateVerified && stolenCheckPassed) {
      status = 'verified'
    } else if (!plateVerified) {
      status = 'failed'
      flaggedReason = 'Plate number verification failed'
    }

    // Create or update vehicle verification record
    const { data: existingVerification } = await supabase
      .from('vehicle_verifications')
      .select('id')
      .eq('car_id', carId)
      .maybeSingle()

    const verificationRecord = {
      car_id: carId,
      dealer_id: dealerId,
      plate_number: plateNumber ? plateNumber.replace(/[\s\-]/g, '').toUpperCase() : null,
      vin_number: vin || null,
      plate_verified: plateVerified,
      plate_verified_at: plateVerified ? new Date().toISOString() : null,
      plate_owner_name: vehicleData.owner_name || vehicleData.registered_owner || null,
      plate_vehicle_make: vehicleData.make || vehicleData.vehicle_make || null,
      plate_vehicle_model: vehicleData.model || vehicleData.vehicle_model || null,
      plate_vehicle_year: vehicleData.year || vehicleData.year_of_manufacture || null,
      plate_vehicle_color: vehicleData.color || vehicleData.vehicle_color || null,
      plate_data: vehicleData,
      stolen_check_passed: stolenCheckPassed,
      stolen_check_date: new Date().toISOString(),
      stolen_report_found: stolenReportFound,
      stolen_report_details: vehicleData.stolenCheck || {},
      status,
      flagged_reason: flaggedReason,
      updated_at: new Date().toISOString()
    }

    if (existingVerification) {
      await supabase
        .from('vehicle_verifications')
        .update(verificationRecord)
        .eq('car_id', carId)
    } else {
      await supabase
        .from('vehicle_verifications')
        .insert(verificationRecord)
    }

    // Update car record
    await supabase
      .from('cars')
      .update({
        vehicle_verified: status === 'verified',
        stolen_check_passed: stolenCheckPassed
      })
      .eq('id', carId)

    // If stolen, create fraud flag
    if (stolenReportFound) {
      await supabase.from('fraud_flags').insert({
        entity_type: 'car',
        entity_id: carId,
        flag_type: 'stolen_vehicle',
        severity: 'critical',
        status: 'pending',
        description: 'Vehicle found in stolen vehicle database during verification',
        detection_data: {
          plateNumber,
          vin,
          stolenReport: vehicleData.stolenCheck
        },
        confidence_score: 100,
        detection_algorithm: 'dojah_stolen_check',
        related_dealer_id: dealerId
      })
    }

    console.log('✅ [VEHICLE VERIFY] Verification complete')

    return NextResponse.json({
      success: true,
      verified: status === 'verified',
      status,
      message: status === 'verified'
        ? 'Vehicle verified successfully'
        : status === 'flagged'
          ? 'Vehicle flagged - found in stolen database'
          : 'Vehicle verification failed',
      data: {
        plateNumber: plateNumber,
        ownerName: vehicleData.owner_name || vehicleData.registered_owner,
        vehicleMake: vehicleData.make || vehicleData.vehicle_make,
        vehicleModel: vehicleData.model || vehicleData.vehicle_model,
        vehicleYear: vehicleData.year || vehicleData.year_of_manufacture,
        vehicleColor: vehicleData.color || vehicleData.vehicle_color,
        verification: {
          plateVerified,
          stolenCheckPassed,
          stolenReportFound,
          makeMatch: verification?.makeMatch,
          modelMatch: verification?.modelMatch,
          yearMatch: verification?.yearMatch,
          colorMatch: verification?.colorMatch
        }
      },
      flaggedReason
    })

  } catch (error) {
    console.error('Vehicle verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during vehicle verification' },
      { status: 500 }
    )
  }
}
