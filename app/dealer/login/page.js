/**
 * FUTURISTIC Dealer Login Page
 * Mind-blowing UI with glassmorphism, 3D effects, and advanced animations
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle, Zap, Shield, TrendingUp, Sparkles } from 'lucide-react'

export default function FuturisticDealerLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    setMounted(true)
    // Clear form on mount for security
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError('')
  }, [])

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
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.status === 'pending') {
          throw new Error('Your account is pending verification by our admin team.')
        } else if (data.status === 'suspended') {
          throw new Error('Your account has been suspended. Please contact support.')
        } else if (data.remainingAttempts !== undefined) {
          throw new Error(`Invalid credentials. ${data.remainingAttempts} attempt(s) remaining.`)
        }
        throw new Error(data.error || 'Login failed. Please try again.')
      }

      // Success animation before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/dealer')
      router.refresh()

    } catch (error) {
      setError(error.message || 'An unexpected error occurred.')
      // Clear password on error for security
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dealer-login-futuristic">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`login-container ${mounted ? 'mounted' : ''}`}>
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-glow"></div>
            <Car className="logo-icon" />
          </div>
          <h1 className="brand-name">
            <span className="text-gradient">JustCars</span>.ng
          </h1>
          <p className="tagline">Dealer Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-card">
          <div className="card-glow"></div>

          {/* Header */}
          <div className="card-header">
            <h2 className="welcome-text">Welcome Back</h2>
            <p className="subtitle">Access your dealer dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field */}
            <div className={`input-group ${focusedField === 'email' ? 'focused' : ''}`}>
              <label className="input-label">
                <Mail className="label-icon" />
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="futuristic-input"
                  placeholder="dealer@example.com"
                  required
                  autoComplete="off"
                />
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className={`input-group ${focusedField === 'password' ? 'focused' : ''}`}>
              <label className="input-label">
                <Lock className="label-icon" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="futuristic-input"
                  placeholder="••••••••"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                <AlertCircle className="error-icon" />
                <p>{error}</p>
              </div>
            )}

            {/* Options */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-btn">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap className="btn-icon" />
                  <span>Login to Dashboard</span>
                  <div className="btn-shine"></div>
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="features-grid">
            <div className="feature-item">
              <Shield size={16} />
              <span>Secure</span>
            </div>
            <div className="feature-item">
              <TrendingUp size={16} />
              <span>Analytics</span>
            </div>
            <div className="feature-item">
              <Sparkles size={16} />
              <span>Premium</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="register-section">
            <p>New dealer?</p>
            <a href="/dealer/register" className="register-link">
              Register your dealership →
            </a>
          </div>
        </div>

        {/* Back Link */}
        <a href="/" className="back-link">
          ← Back to Main Site
        </a>
      </div>

      <style jsx>{`
        .dealer-login-futuristic {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: #0a0e27;
        }

        /* Animated Background */
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
          animation-delay: 0s;
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

        /* Particles */
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

        /* Main Container */
        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .login-container.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* Logo Section */
        .logo-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
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
          width: 64px;
          height: 64px;
          color: white;
          filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.8));
        }

        .brand-name {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
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
          font-size: 1.125rem;
          font-weight: 500;
        }

        /* Glass Card */
        .glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow:
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .card-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg,
            rgba(102, 126, 234, 0.5),
            rgba(118, 75, 162, 0.5)
          );
          border-radius: 24px;
          filter: blur(20px);
          opacity: 0.3;
          z-index: -1;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .welcome-text {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
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

        .label-icon {
          width: 16px;
          height: 16px;
          color: #667eea;
        }

        .input-wrapper {
          position: relative;
        }

        .futuristic-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .futuristic-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .futuristic-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: #667eea;
        }

        .input-group.focused .input-glow {
          opacity: 1;
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
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        /* Error Alert */
        .error-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.875rem;
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #667eea;
        }

        .link-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .link-btn:hover {
          color: #764ba2;
        }

        /* Submit Button */
        .submit-btn {
          position: relative;
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Features Grid */
        .features-grid {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .feature-item svg {
          color: #667eea;
        }

        /* Register Section */
        .register-section {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .register-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .register-link:hover {
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
        @media (max-width: 640px) {
          .dealer-login-futuristic {
            padding: 1rem;
          }

          .glass-card {
            padding: 2rem 1.5rem;
          }

          .brand-name {
            font-size: 2.5rem;
          }

          .features-grid {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
