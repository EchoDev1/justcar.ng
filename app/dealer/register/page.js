/**
 * FUTURISTIC Dealer Registration Page
 * Mind-blowing multi-step wizard with glassmorphism and 3D effects
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Car, Mail, Phone, MapPin, Building, FileText, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Sparkles, Shield,
  Zap, TrendingUp, Users, Award
} from 'lucide-react'
import { NIGERIAN_STATES } from '@/lib/utils'

export default function FuturisticDealerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    address: '',
    business_registration_number: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const steps = [
    {
      id: 1,
      title: 'Business Info',
      icon: Building,
      description: 'Tell us about your dealership'
    },
    {
      id: 2,
      title: 'Contact Details',
      icon: Phone,
      description: 'How can buyers reach you?'
    },
    {
      id: 3,
      title: 'Security',
      icon: Lock,
      description: 'Secure your account'
    }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.business_name) return 'Business name is required'
        if (!formData.email) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format'
        break
      case 2:
        if (!formData.phone) return 'Phone number is required'
        if (!formData.location) return 'Location is required'
        if (!formData.address) return 'Address is required'
        break
      case 3:
        if (!formData.password) return 'Password is required'
        if (formData.password.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(formData.password)) return 'Password must contain uppercase letter'
        if (!/[a-z]/.test(formData.password)) return 'Password must contain lowercase letter'
        if (!/\d/.test(formData.password)) return 'Password must contain a number'
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
        break
    }
    return null
  }

  const nextStep = () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }

    setCompletedSteps(prev => [...new Set([...prev, currentStep])])
    setError('')
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateStep(3)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/dealer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(true)

      // Redirect after success animation
      setTimeout(() => {
        router.push('/dealer/login')
      }, 3000)

    } catch (error) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="dealer-register-futuristic">
        <div className="animated-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="success-container">
          <div className="success-icon-wrapper">
            <CheckCircle className="success-icon" />
            <div className="success-pulse"></div>
          </div>
          <h1 className="success-title">Registration Successful!</h1>
          <p className="success-message">
            Your account is pending admin verification. You'll receive an email once approved.
          </p>
          <div className="success-redirect">
            Redirecting to login...
          </div>
        </div>

        <style jsx>{`
          .success-container {
            position: relative;
            z-index: 10;
            text-align: center;
            animation: fadeInUp 0.8s ease;
          }

          .success-icon-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 2rem;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            color: #10b981;
            filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.6));
            animation: checkmark 0.8s ease;
          }

          @keyframes checkmark {
            0% { transform: scale(0) rotate(-180deg); }
            50% { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }

          .success-pulse {
            position: absolute;
            inset: -20px;
            background: #10b981;
            border-radius: 50%;
            opacity: 0.3;
            animation: pulse 2s ease infinite;
          }

          .success-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
            margin-bottom: 1rem;
          }

          .success-message {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.125rem;
            max-width: 500px;
            margin: 0 auto 2rem;
          }

          .success-redirect {
            color: #667eea;
            font-size: 0.875rem;
            animation: fadeInOut 2s ease infinite;
          }

          @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="dealer-register-futuristic">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`register-container ${mounted ? 'mounted' : ''}`}>
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-glow"></div>
            <Car className="logo-icon" />
          </div>
          <h1 className="brand-name">
            <span className="text-gradient">JustCars</span>.ng
          </h1>
          <p className="tagline">Join Our Dealer Network</p>
        </div>

        {/* Progress Steps */}
        <div className="steps-indicator">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = completedSteps.includes(step.id)

            return (
              <div key={step.id} className="step-wrapper">
                <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="step-icon-wrapper">
                    {isCompleted ? (
                      <CheckCircle className="step-icon" />
                    ) : (
                      <Icon className="step-icon" />
                    )}
                  </div>
                  <div className="step-info">
                    <div className="step-title">{step.title}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`}></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Registration Card */}
        <div className="glass-card">
          <div className="card-glow"></div>

          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <div className="step-content">
                <h2 className="step-heading">
                  <Building className="heading-icon" />
                  Business Information
                </h2>

                <div className="form-grid">
                  <div className="input-group full-width">
                    <label className="input-label">
                      <Building size={16} />
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      className="futuristic-input"
                      placeholder="Your Dealership Name"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className="input-group full-width">
                    <label className="input-label">
                      <Mail size={16} />
                      Business Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="futuristic-input"
                      placeholder="dealer@example.com"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className="input-group full-width">
                    <label className="input-label">
                      <FileText size={16} />
                      Registration Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={handleChange}
                      className="futuristic-input"
                      placeholder="CAC Registration Number"
                    />
                    <div className="input-glow"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="step-content">
                <h2 className="step-heading">
                  <Phone className="heading-icon" />
                  Contact Information
                </h2>

                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="futuristic-input"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <Phone size={16} />
                      WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="futuristic-input"
                      placeholder="+234 XXX XXX XXXX"
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className="input-group full-width">
                    <label className="input-label">
                      <MapPin size={16} />
                      Location (State)
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="futuristic-input"
                      required
                    >
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <div className="input-glow"></div>
                  </div>

                  <div className="input-group full-width">
                    <label className="input-label">
                      <MapPin size={16} />
                      Full Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="futuristic-input textarea"
                      placeholder="Street address, city, postal code"
                      rows="3"
                      required
                    ></textarea>
                    <div className="input-glow"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <div className="step-content">
                <h2 className="step-heading">
                  <Lock className="heading-icon" />
                  Account Security
                </h2>

                <div className="form-grid">
                  <div className="input-group full-width">
                    <label className="input-label">
                      <Lock size={16} />
                      Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="futuristic-input"
                        placeholder="Create strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="input-glow"></div>
                    <div className="password-requirements">
                      <p>Password must contain:</p>
                      <ul>
                        <li className={formData.password.length >= 8 ? 'met' : ''}>
                          At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                          One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                          One lowercase letter
                        </li>
                        <li className={/\d/.test(formData.password) ? 'met' : ''}>
                          One number
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label className="input-label">
                      <Lock size={16} />
                      Confirm Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="futuristic-input"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="input-glow"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                <AlertCircle className="error-icon" />
                <p>{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="button-group">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-btn secondary"
                >
                  <ArrowLeft size={20} />
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-btn primary"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="nav-btn primary submit"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Complete Registration
                    </>
                  )}
                  <div className="btn-shine"></div>
                </button>
              )}
            </div>
          </form>

          {/* Benefits Preview */}
          <div className="benefits-section">
            <h3 className="benefits-title">Why Join JustCars.ng?</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <Users size={18} />
                <span>Access Thousands of Buyers</span>
              </div>
              <div className="benefit-item">
                <Shield size={18} />
                <span>Verified & Trusted</span>
              </div>
              <div className="benefit-item">
                <TrendingUp size={18} />
                <span>Boost Your Sales</span>
              </div>
              <div className="benefit-item">
                <Award size={18} />
                <span>Premium Tools</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="login-section">
            <p>Already have an account?</p>
            <a href="/dealer/login" className="login-link">
              Login to Dashboard →
            </a>
          </div>
        </div>

        {/* Back Link */}
        <a href="/" className="back-link">
          ← Back to Main Site
        </a>
      </div>

      <style jsx>{`
        /* Base Styles - Same as login page */
        .dealer-register-futuristic {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: #0a0e27;
        }

        .animated-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -250px;
          right: -250px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -200px;
          left: -200px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -100px) scale(1.1); }
          66% { transform: translate(-100px, 100px) scale(0.9); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
          animation: particleFloat linear infinite;
        }

        @keyframes particleFloat {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }

        .register-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 800px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .register-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* Logo Section */
        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .logo-glow {
          position: absolute;
          inset: -20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.5;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .logo-icon {
          position: relative;
          width: 48px;
          height: 48px;
          color: white;
          filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.8));
        }

        .brand-name {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .tagline {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Progress Steps */
        .steps-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }

        .step-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .step-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .step-item.active {
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }

        .step-item.completed {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
        }

        .step-icon-wrapper {
          flex-shrink: 0;
        }

        .step-icon {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.5);
        }

        .step-item.active .step-icon {
          color: #667eea;
          animation: iconPulse 2s ease infinite;
        }

        .step-item.completed .step-icon {
          color: #10b981;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .step-info {
          flex: 1;
          min-width: 0;
        }

        .step-title {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .step-description {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .step-connector {
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .step-connector.completed::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #10b981, #667eea);
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        /* Glass Card */
        .glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .card-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5));
          border-radius: 24px;
          filter: blur(20px);
          opacity: 0.3;
          z-index: -1;
        }

        /* Form Content */
        .step-content {
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-heading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .heading-icon {
          color: #667eea;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-group.full-width {
          grid-column: 1 / -1;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .futuristic-input {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .futuristic-input.textarea {
          resize: vertical;
          font-family: inherit;
        }

        .futuristic-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .futuristic-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #667eea;
        }

        .futuristic-input option {
          background: #1a1e3a;
          color: white;
        }

        .input-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          pointer-events: none;
        }

        .futuristic-input:focus ~ .input-glow {
          opacity: 1;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: color 0.3s ease;
          z-index: 2;
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .password-requirements {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .password-requirements p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .password-requirements ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .password-requirements li {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          padding: 0.25rem 0;
          transition: color 0.3s ease;
        }

        .password-requirements li.met {
          color: #10b981;
        }

        .password-requirements li::before {
          content: '○ ';
          margin-right: 0.5rem;
        }

        .password-requirements li.met::before {
          content: '✓ ';
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          margin-top: 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.875rem;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Navigation Buttons */
        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .nav-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .nav-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .nav-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .nav-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .nav-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Benefits Section */
        .benefits-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .benefits-title {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 1rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .benefit-item svg {
          color: #667eea;
          flex-shrink: 0;
        }

        /* Login Section */
        .login-section {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .login-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .login-link:hover {
          color: #764ba2;
          transform: translateX(4px);
        }

        /* Back Link */
        .back-link {
          display: inline-block;
          margin-top: 2rem;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: white;
          transform: translateX(-4px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dealer-register-futuristic {
            padding: 1rem;
          }

          .glass-card {
            padding: 2rem 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .steps-indicator {
            flex-direction: column;
            gap: 0.5rem;
          }

          .step-wrapper {
            flex-direction: column;
          }

          .step-connector {
            width: 2px;
            height: 20px;
            margin: 0;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
