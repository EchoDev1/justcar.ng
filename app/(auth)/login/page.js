/**
 * Admin Login Page
 * Handles admin authentication with Supabase
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide user-friendly error messages based on error type
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
        } else if (error.message.includes('User not found')) {
          throw new Error('No account found with this email address. Please sign up first.')
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.')
        } else if (error.message.includes('Network')) {
          throw new Error('Network error. Please check your internet connection and try again.')
        } else {
          throw error
        }
      }

      // Redirect to admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (error) {
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background Animated Grids & Gradients matching home page */}
      <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="text-accent-blue icon-animated" size={44} />
            <span className="text-4xl font-bold text-white">
              JustCars<span className="text-accent-blue">.ng</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-muted mt-2">Sign in to manage your car marketplace</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-accent-blue" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@justcars.ng"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-accent-blue" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-blue text-white placeholder-gray-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Forgot your password?{' '}
              <a href="#" className="text-accent-blue hover:underline font-medium">
                Reset it here
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a href="/" className="text-white/60 hover:text-white transition-colors">
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
