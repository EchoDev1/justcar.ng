/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'buyer' or 'admin'
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Check active session using secure getUser() method
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Error getting user:', error)
          setUser(null)
          setUserRole(null)
        } else if (user) {
          setUser(user)
          await determineUserRole(user.id)
        } else {
          setUser(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await determineUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const determineUserRole = async (userId) => {
    try {
      // Check if user is a buyer
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('id')
        .eq('id', userId)
        .single()

      if (buyerData) {
        setUserRole('buyer')
        return
      }

      // Check if user is admin (you might have an admins table or use user_metadata)
      // For now, we'll check user metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role === 'admin' || user?.email?.includes('admin')) {
        setUserRole('admin')
        return
      }

      // Default to buyer role
      setUserRole('buyer')
    } catch (error) {
      console.error('Error determining user role:', error)
      setUserRole('buyer') // Default to buyer
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Signout error:', error)
        throw error
      }
      setUser(null)
      setUserRole(null)
      console.log('Signout successful, redirecting...')
      router.push('/')
      setTimeout(() => {
        window.location.href = '/' // Force full page reload
      }, 100)
    } catch (error) {
      console.error('Error signing out:', error)
      // Force reload anyway to clear state
      window.location.href = '/'
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signOut,
    isAuthenticated: !!user,
    isBuyer: userRole === 'buyer',
    isAdmin: userRole === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
