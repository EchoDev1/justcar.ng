/**
 * Supabase Admin Client
 * Uses service role key for admin operations
 * WARNING: Only use this in API routes or server-side code
 * Never expose service role key to the client
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
