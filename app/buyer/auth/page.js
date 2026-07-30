/**
 * Buyer Registration & Login Page
 * Stunning authentication page that appears after car selection
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Car, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

function BuyerAuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const carId = searchParams.get('carId')
  const action = searchParams.get('action') // 'buy', 'chat', 'save'

  const supabase = createClient()

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Registration form
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (carId) {
      fetchCarDetails()
    }
  }, [carId])

  const fetchCarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          dealer:dealers(name),
          car_images(image_url, is_primary)
        `)
        .eq('id', carId)
        .single()

      if (error) throw error

      setSelectedCar(data)
    } catch (error) {
      console.error('Error fetching car:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (error) throw error

      // Check if user is a buyer
      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (buyerError && buyerError.code !== 'PGRST116') {
        throw buyerError
      }

      if (!buyerData) {
        // User exists but not as buyer, create buyer profile
        const { error: insertError } = await supabase
          .from('buyers')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 'Buyer',
            phone: data.user.user_metadata?.phone || ''
          })

        if (insertError) throw insertError
      }

      setSuccess('Login successful! Redirecting...')

      // Redirect based on action
      setTimeout(() => {
        if (action === 'buy' && carId) {
          router.push(`/buyer/checkout/${carId}`)
        } else if (action === 'chat' && carId) {
          router.push(`/buyer/chats?carId=${carId}`)
        } else if (action === 'save' && carId) {
          router.push(`/cars/${carId}`)
        } else {
          router.push('/buyer/saved')
        }
      }, 1500)
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Use custom registration API with Resend email
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          fullName: registerData.fullName,
          phone: registerData.phone,
          location: registerData.location
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Show success message about email verification
      setSuccess(data.message || 'Account created! Please check your email to verify your account.')
      setRegistrationComplete(true)
      setRegisteredEmail(registerData.email)

      // Clear form
      setRegisterData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle resend verification email
  const handleResendVerification = async () => {
    const emailToUse = registeredEmail || registerData.email
    if (!emailToUse) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailToUse })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || 'Verification email sent! Please check your inbox.')
      } else {
        setError(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset registration state
  const handleBackToRegister = () => {
    setRegistrationComplete(false)
    setRegisteredEmail('')
    setSuccess('')
    setError('')
  }

  const primaryImage = selectedCar?.car_images?.find(img => img.is_primary) || selectedCar?.car_images?.[0]
  const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Car Preview */}
            {selectedCar && (
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="text-white mb-6">
                    <h2 className="text-3xl font-bold mb-2">
                      {action === 'buy' && 'Complete your purchase'}
                      {action === 'chat' && 'Chat with dealer'}
                      {action === 'save' && 'Save this car'}
                      {!action && 'You\'re interested in'}
                    </h2>
                    <p className="text-white/80">Just one step away!</p>
                  </div>

                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl mb-4">
                    <div className="relative h-64">
                      <Image
                        src={imageUrl}
                        alt={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCar.year} {selectedCar.make} {selectedCar.model}
                      </h3>
                      <p className="text-3xl font-bold text-blue-600 mb-3">
                        ₦{selectedCar.price?.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{selectedCar.location}</span>
                        <span>{selectedCar.dealer?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-white/90 text-sm">
                    <CheckCircle size={20} className="text-green-400" />
                    <span>Verified dealer • Secure transaction • Fast delivery</span>
                  </div>
                </div>
              </div>
            )}

            {/* Right Side - Auth Form */}
            <div className={`${selectedCar ? '' : 'lg:col-span-2 max-w-md mx-auto w-full'}`}>
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Car className="text-white" size={40} />
                    <span className="text-4xl font-bold text-white">
                      JustCars<span className="text-blue-300">.ng</span>
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back!' : 'Join JustCars'}
                  </h1>
                  <p className="text-white/80">
                    {isLogin ? 'Sign in to continue' : 'Create your account to get started'}
                  </p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex bg-white/10 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      isLogin
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      !isLogin
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="mb-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {success && !registrationComplete && (
                  <div className="mb-4 bg-green-500/20 border border-green-500/50 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-center space-x-2">
                    <CheckCircle size={20} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Registration Complete - Email Verification Required */}
                {registrationComplete && (
                  <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 backdrop-blur-sm text-white p-6 rounded-xl">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                        <Mail size={24} className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">Check Your Email</h3>
                        <p className="text-white/80 text-sm">
                          We've sent a verification link to <strong>{registeredEmail}</strong>
                        </p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-4">
                      Click the link in the email to verify your account. The link expires in 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <span>Sending...</span>
                        ) : (
                          <>
                            <Mail size={16} />
                            <span>Resend Email</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBackToRegister}
                        className="flex-1 bg-transparent border border-white/30 hover:border-white/50 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all"
                      >
                        Use Different Email
                      </button>
                    </div>
                    <p className="text-white/50 text-xs mt-4 text-center">
                      Didn't receive the email? Check your spam folder or click "Resend Email"
                    </p>
                  </div>
                )}

                {/* Login Form */}
                {isLogin && !registrationComplete ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          placeholder="you@example.com"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="Enter your password"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                ) : !registrationComplete ? (
                  // Registration Form
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type="text"
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                          placeholder="John Doe"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          placeholder="you@example.com"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                          <input
                            type="tel"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                            placeholder="080xxxxxxxx"
                            required
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                          <input
                            type="text"
                            value={registerData.location}
                            onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                            placeholder="Lagos"
                            required
                            style={{ color: '#111827', backgroundColor: '#ffffff' }}
                            className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          placeholder="Minimum 6 characters"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          placeholder="Re-enter password"
                          required
                          style={{ color: '#111827', backgroundColor: '#ffffff' }}
                          className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                ) : null}

                {/* Back to home */}
                <div className="mt-6 text-center">
                  <a href="/" className="text-white/80 hover:text-white transition-colors">
                    ← Back to Homepage
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-20px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(30px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function BuyerAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <BuyerAuthContent />
    </Suspense>
  )
}
