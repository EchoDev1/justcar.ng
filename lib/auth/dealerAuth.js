/**
 * Dealer Authentication Helper
 * Handles dealer session validation
 */

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Get current dealer from session (server-side)
 */
export async function getCurrentDealer() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('dealer_session')?.value

  if (!sessionToken) {
    return { dealer: null, session: null }
  }

  const supabase = await createClient()

  // Get session from database
  const { data: session, error: sessionError } = await supabase
    .from('dealer_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (sessionError || !session) {
    return { dealer: null, session: null }
  }

  // Get dealer data
  const { data: dealer, error: dealerError } = await supabase
    .from('dealers')
    .select('*')
    .eq('id', session.dealer_id)
    .eq('status', 'active')
    .maybeSingle()

  if (dealerError || !dealer) {
    return { dealer: null, session: null }
  }

  // Update last active time
  await supabase
    .from('dealer_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', session.id)

  return { dealer, session }
}

/**
 * Get current dealer from session (client-side)
 */
export async function getCurrentDealerClient() {
  const response = await fetch('/api/dealer/me', {
    credentials: 'include'
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.dealer
}

/**
 * Require dealer authentication (server-side)
 * Redirects to login if not authenticated
 */
export async function requireDealerAuth() {
  const { dealer } = await getCurrentDealer()

  if (!dealer) {
    return {
      redirect: {
        destination: '/dealer/login',
        permanent: false
      }
    }
  }

  return { dealer }
}
