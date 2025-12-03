/**
 * Admin Login Page
 * Secure login for admin users
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, AlertCircle, LogIn } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Clear any existing invalid sessions first
      await supabase.auth.signOut()

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // Provide user-friendly error messages based on error type
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
        } else if (signInError.message.includes('User not found')) {
          throw new Error('No admin account found with this email address. Please contact support.')
        } else if (signInError.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.')
        } else if (signInError.message.includes('Network')) {
          throw new Error('Network error. Please check your internet connection and try again.')
        } else {
          throw signInError
        }
      }

      if (data?.user) {
        // Successful login
        console.log('Login successful:', data.user.email)
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again or clear your session.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSession = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      setError('')
      alert('Session cleared successfully. Please log in again.')
    } catch (err) {
      console.error('Error clearing session:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-2xl">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">JustCars.ng</h1>
          <p className="text-blue-200 text-lg">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In to Continue
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-semibold mb-1">Login Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@justcars.ng"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Clear Session Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleClearSession}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              Having trouble? Clear session and try again
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm">
            Secure Admin Access • JustCars.ng © 2025
          </p>
        </div>
      </div>
    </div>
  )
}
