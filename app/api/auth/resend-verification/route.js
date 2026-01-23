/**
 * Resend Verification Email API
 * POST /api/auth/resend-verification
 * Resends verification email to unverified users
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmailConfirmation } from '@/lib/email/resend'
import crypto from 'crypto'

export async function POST(request) {
  console.log('[RESEND-VERIFICATION] Request received')

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Find buyer with this email
    const { data: buyer, error: findError } = await supabase
      .from('buyers')
      .select('id, email, full_name, email_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (findError || !buyer) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link will be sent.'
      })
    }

    // Check if already verified
    if (buyer.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Your email is already verified. You can login now.',
        alreadyVerified: true
      })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update buyer with new token
    const { error: updateError } = await supabase
      .from('buyers')
      .update({
        verification_token: verificationToken,
        verification_token_expires_at: tokenExpiry.toISOString()
      })
      .eq('id', buyer.id)

    if (updateError) {
      console.error('[RESEND-VERIFICATION] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate verification link. Please try again.' },
        { status: 500 }
      )
    }

    // Send verification email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    const emailResult = await sendEmailConfirmation({
      userEmail: buyer.email,
      userName: buyer.full_name,
      confirmationUrl,
      userType: 'buyer'
    })

    if (!emailResult.success) {
      console.error('[RESEND-VERIFICATION] Email send error:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('[RESEND-VERIFICATION] Verification email resent to:', buyer.email)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    })

  } catch (error) {
    console.error('[RESEND-VERIFICATION] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
