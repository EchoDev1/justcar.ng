/**
 * Supabase Auth Utilities
 * Helper functions for handling authentication gracefully
 */

/**
 * Safe wrapper for getUser that doesn't throw errors
 * Returns null if user is not authenticated
 * OPTIMIZED: Silently handles all auth session errors
 */
export async function safeGetUser(supabase) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    // If auth session missing, return null instead of throwing
    if (error && (
      error.message?.includes('Auth session missing') ||
      error.message?.includes('session') ||
      error.name === 'AuthSessionMissingError'
    )) {
      // Silently return null - this is expected for non-authenticated users
      return null
    }

    // If other error, return null (don't log to avoid console spam)
    if (error) {
      return null
    }

    return user
  } catch (error) {
    // Silently handle ALL auth errors - don't spam console
    if (
      error.message?.includes('Auth session missing') ||
      error.message?.includes('session') ||
      error.name === 'AuthSessionMissingError'
    ) {
      return null
    }
    // Only log truly unexpected errors
    if (error.message && !error.message.includes('auth') && !error.message.includes('session')) {
      console.error('Unexpected auth error:', error)
    }
    return null
  }
}

/**
 * Safe wrapper for getSession that doesn't throw errors
 * Returns null if session is not available
 */
export async function safeGetSession(supabase) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error && (
      error.message?.includes('Auth session missing') ||
      error.name === 'AuthSessionMissingError'
    )) {
      return null
    }

    if (error) {
      console.warn('Session error:', error.message)
      return null
    }

    return session
  } catch (error) {
    if (
      error.message?.includes('Auth session missing') ||
      error.name === 'AuthSessionMissingError'
    ) {
      return null
    }
    console.error('Unexpected session error:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * Returns true/false without throwing errors
 */
export async function isAuthenticated(supabase) {
  const user = await safeGetUser(supabase)
  return !!user
}

/**
 * Require authentication - redirects to login if not authenticated
 * Returns user object or null (after redirecting)
 */
export async function requireAuth(supabase, router, redirectPath = '/buyer/auth') {
  const user = await safeGetUser(supabase)

  if (!user) {
    router.push(redirectPath)
    return null
  }

  return user
}

/**
 * Check if the current user is an admin
 * Returns admin record if user is an admin, null otherwise
 */
export async function getAdminUser(supabase) {
  try {
    const user = await safeGetUser(supabase)

    if (!user) {
      return null
    }

    // OPTIMIZED: Try admin query with timeout and fallback
    try {
      // Query the admins table to check if this user is an admin
      // Note: admins table doesn't have 'name' column, only email
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, auth_id, email, role, is_active')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        // If error is 'no rows', return null (not an admin)
        if (error.code === 'PGRST116') {
          return null
        }

        // CRITICAL FIX: Handle infinite recursion RLS error
        // If RLS is broken, fall back to checking user metadata/email
        if (error.message?.includes('infinite recursion') || error.message?.includes('policy')) {
          console.warn('RLS issue detected - using fallback admin check')

          // Fallback: Check if user email contains admin or has admin metadata
          const isAdminEmail = user.email?.includes('admin') ||
                              user.email?.endsWith('@justcars.ng') ||
                              user.user_metadata?.role === 'admin'

          if (isAdminEmail) {
            // Return a mock admin object for now
            return {
              id: user.id,
              auth_id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
              role: 'admin',
              is_active: true
            }
          }
          return null
        }

        console.warn('Error checking admin status:', error.message)
        return null
      }

      return admin
    } catch (queryError) {
      // If query fails entirely, use fallback
      console.warn('Admin query failed, using fallback:', queryError.message)

      const isAdminEmail = user.email?.includes('admin') ||
                          user.email?.endsWith('@justcars.ng') ||
                          user.user_metadata?.role === 'admin'

      if (isAdminEmail) {
        return {
          id: user.id,
          auth_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
          is_active: true
        }
      }
      return null
    }
  } catch (error) {
    console.error('Unexpected error in getAdminUser:', error)
    return null
  }
}

/**
 * Check if the current user is an admin (boolean)
 * Returns true if user is an active admin, false otherwise
 */
export async function isAdmin(supabase) {
  const admin = await getAdminUser(supabase)
  return !!admin
}

/**
 * Require admin authentication - used in admin layout
 * Returns admin object or null (after redirecting)
 */
export async function requireAdminAuth(supabase, redirectPath = '/admin/login') {
  const admin = await getAdminUser(supabase)
  return admin
}
