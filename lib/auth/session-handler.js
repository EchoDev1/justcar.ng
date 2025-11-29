/**
 * Auth Session Handler
 * Handles authentication errors and session management
 */

export const handleAuthError = async (error, supabase, router) => {
  // Check if it's a refresh token error
  if (error?.message?.includes('Refresh Token') ||
      error?.message?.includes('Invalid') ||
      error?.status === 401) {

    console.warn('Authentication session expired or invalid. Clearing session...')

    try {
      // Sign out to clear the invalid session
      await supabase.auth.signOut()

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }

      // Redirect to login
      if (router) {
        router.push('/admin/login')
      }

      return true
    } catch (signOutError) {
      console.error('Error clearing session:', signOutError)

      // Force clear storage even if signOut fails
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()

        // Force redirect
        if (router) {
          router.push('/admin/login')
        } else {
          window.location.href = '/admin/login'
        }
      }

      return true
    }
  }

  return false
}

export const refreshSession = async (supabase) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session refresh error:', error)
      return null
    }

    if (!session) {
      console.warn('No active session found')
      return null
    }

    // Session is valid
    return session
  } catch (error) {
    console.error('Error refreshing session:', error)
    return null
  }
}

export const checkAuthStatus = async (supabase) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth check error:', error)
      return { authenticated: false, user: null, error }
    }

    return { authenticated: !!user, user, error: null }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { authenticated: false, user: null, error }
  }
}
