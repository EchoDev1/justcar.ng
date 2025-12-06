/**
 * Dealer Login Page
 * Simple authentication for dealers
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function DealerLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('login') // 'login', 'check-email', 'set-password'

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/dealer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle different error cases
        if (data.status === 'pending') {
          throw new Error('Your account is pending verification by our admin team. You will receive an email once your account is verified.')
        } else if (data.status === 'verified' && data.needsPasswordSetup) {
          // Redirect to setup page
          throw new Error('Please set up your password first. Check your email for the setup link.')
        } else if (data.status === 'suspended') {
          throw new Error('Your account has been suspended. Please contact support for assistance.')
        } else if (data.lockedUntil) {
          throw new Error('Your account is temporarily locked due to too many failed login attempts. Please try again later.')
        } else if (data.remainingAttempts !== undefined) {
          throw new Error(`Invalid email or password. ${data.remainingAttempts} attempt(s) remaining before account lock.`)
        }
        throw new Error(data.error || 'Login failed. Please try again.')
      }

      // Successful login - redirect to dealer dashboard
      console.log('Dealer login successful:', data.dealer.email)
      router.push('/dealer')
      router.refresh()

    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'check-email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-xl text-gray-600">We've sent you a verification link</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Email Sent!
              </h2>

              <p className="text-gray-600 mb-6">
                We've sent a verification link to:
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900 font-semibold">{email}</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Next Steps:</strong>
                </p>
                <ol className="text-sm text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the verification link</li>
                  <li>Create your password</li>
                  <li>Login to your dealer dashboard</li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <button
                onClick={() => {
                  setStep('login')
                  setEmail('')
                  setPassword('')
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Car className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">JustCars.ng</h1>
          <p className="text-xl text-gray-600">Dealer Portal Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">Login to manage your dealership</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                First time? <a href="/dealer/register" className="text-blue-600 hover:text-blue-700 font-semibold">Register here</a>
              </p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New dealer?{' '}
              <a href="/dealer/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Register your dealership
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600 mb-4">Quick Access</p>
            <div className="flex justify-center">
              <a
                href="/"
                className="text-center py-2 px-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
              >
                Back to Main Site
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 JustCars.ng. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Secure dealer portal · SSL encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
