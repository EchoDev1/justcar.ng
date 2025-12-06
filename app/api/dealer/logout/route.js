/**
 * Dealer Logout API
 * POST /api/dealer/logout
 * Logs out dealer and destroys session
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('dealer_session')?.value

    if (sessionToken) {
      // CRITICAL: Use service role client to bypass RLS
      const supabase = createServiceRoleClient()

      // Delete session from database
      await supabase
        .from('dealer_sessions')
        .delete()
        .eq('session_token', sessionToken)
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    )

    // Clear session cookie
    response.cookies.delete('dealer_session')

    return response

  } catch (error) {
    console.error('Dealer logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    )
  }
}
