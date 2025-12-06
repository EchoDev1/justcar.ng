/**
 * Get Current Dealer API
 * Returns the currently logged-in dealer
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('dealer_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // CRITICAL: Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    // Get session from database
    const { data: session, error: sessionError } = await supabase
      .from('dealer_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Get dealer data
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, business_name, name, email, phone, whatsapp, location, address, status, badge_type, is_verified, created_at')
      .eq('id', session.dealer_id)
      .eq('status', 'active')
      .maybeSingle()

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: 'Dealer account not found or not active' },
        { status: 404 }
      )
    }

    // Update last active time
    await supabase
      .from('dealer_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', session.id)

    return NextResponse.json(
      {
        success: true,
        dealer: {
          id: dealer.id,
          business_name: dealer.business_name || dealer.name,
          email: dealer.email,
          phone: dealer.phone,
          whatsapp: dealer.whatsapp,
          location: dealer.location,
          address: dealer.address,
          status: dealer.status,
          badge_type: dealer.badge_type,
          is_verified: dealer.is_verified
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get current dealer error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
