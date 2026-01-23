/**
 * Email Verification API
 * POST /api/auth/verify-email
 * Verifies email using the token sent via email
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('[VERIFY-EMAIL] Verification request received')

  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Find buyer with this verification token
    const { data: buyer, error: findError } = await supabase
      .from('buyers')
      .select('id, email, full_name, verification_token_expires_at, email_verified')
      .eq('verification_token', token)
      .maybeSingle()

    if (findError || !buyer) {
      console.log('[VERIFY-EMAIL] Invalid token or buyer not found')
      return NextResponse.json(
        { error: 'Invalid or expired verification link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if already verified
    if (buyer.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can login now.',
        alreadyVerified: true
      })
    }

    // Check if token has expired
    const now = new Date()
    const expiryDate = new Date(buyer.verification_token_expires_at)

    if (now > expiryDate) {
      console.log('[VERIFY-EMAIL] Token expired for:', buyer.email)
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update buyer as verified
    const { error: updateError } = await supabase
      .from('buyers')
      .update({
        email_verified: true,
        verified: true,
        verification_token: null,
        verification_token_expires_at: null
      })
      .eq('id', buyer.id)

    if (updateError) {
      console.error('[VERIFY-EMAIL] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email. Please try again.' },
        { status: 500 }
      )
    }

    // Also update the auth user's email_confirmed_at
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      buyer.id,
      { email_confirm: true }
    )

    if (authUpdateError) {
      console.error('[VERIFY-EMAIL] Auth update error:', authUpdateError)
      // Don't fail - the buyer profile is already updated
    }

    console.log('[VERIFY-EMAIL] Email verified successfully for:', buyer.email)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.',
      user: {
        email: buyer.email,
        name: buyer.full_name
      }
    })

  } catch (error) {
    console.error('[VERIFY-EMAIL] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification' },
      { status: 500 }
    )
  }
}

// GET endpoint for direct link verification
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/buyer/auth?error=missing_token', request.url))
  }

  // Redirect to the verification page with the token
  return NextResponse.redirect(new URL(`/verify-email?token=${token}`, request.url))
}
