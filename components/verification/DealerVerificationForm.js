'use client'

import { useState } from 'react'
import {
  Shield,
  ShieldCheck,
  Award,
  CreditCard,
  Building2,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { VerificationStatusCard } from './VerificationTierBadge'

/**
 * Dealer Verification Form Component
 * Multi-step wizard for NIN, BVN, and CAC verification
 */

export default function DealerVerificationForm({
  dealerId,
  dealerName,
  currentTier = 'basic',
  ninVerified = false,
  bvnVerified = false,
  cacVerified = false,
  verificationScore = 0,
  onVerificationComplete
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form data
  const [ninData, setNinData] = useState({ nin: '', firstName: '', lastName: '' })
  const [bvnData, setBvnData] = useState({ bvn: '', firstName: '', lastName: '' })
  const [cacData, setCacData] = useState({ rcNumber: '', businessName: '' })

  // Visibility toggles
  const [showNin, setShowNin] = useState(false)
  const [showBvn, setShowBvn] = useState(false)

  // Verification results
  const [ninResult, setNinResult] = useState(null)
  const [bvnResult, setBvnResult] = useState(null)
  const [cacResult, setCacResult] = useState(null)

  const steps = [
    {
      id: 'nin',
      label: 'NIN Verification',
      description: 'Verify your National Identification Number',
      icon: User,
      points: 35,
      verified: ninVerified,
      required: true
    },
    {
      id: 'bvn',
      label: 'BVN Verification',
      description: 'Verify your Bank Verification Number',
      icon: CreditCard,
      points: 35,
      verified: bvnVerified,
      required: false
    },
    {
      id: 'cac',
      label: 'CAC Verification',
      description: 'Verify your business registration',
      icon: Building2,
      points: 25,
      verified: cacVerified,
      required: false
    }
  ]

  const handleNinVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/verification/dojah/nin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          nin: ninData.nin,
          firstName: ninData.firstName,
          lastName: ninData.lastName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'NIN verification failed')
      }

      setNinResult(data)

      if (data.verified) {
        setSuccess('NIN verified successfully!')
        setTimeout(() => {
          setActiveStep(1)
          setSuccess(null)
        }, 2000)
      } else {
        setError('NIN verification failed - name mismatch. Please check your details.')
      }

      if (onVerificationComplete) {
        onVerificationComplete('nin', data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBvnVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/verification/dojah/bvn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          bvn: bvnData.bvn,
          firstName: bvnData.firstName,
          lastName: bvnData.lastName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'BVN verification failed')
      }

      setBvnResult(data)

      if (data.verified) {
        setSuccess('BVN verified successfully!')
        setTimeout(() => {
          setActiveStep(2)
          setSuccess(null)
        }, 2000)
      } else {
        setError('BVN verification failed - name mismatch. Please check your details.')
      }

      if (onVerificationComplete) {
        onVerificationComplete('bvn', data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCacVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/verification/dojah/cac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId,
          rcNumber: cacData.rcNumber,
          businessName: cacData.businessName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'CAC verification failed')
      }

      setCacResult(data)

      if (data.verified) {
        setSuccess('CAC verified successfully! You are now a Trusted Seller!')
      } else {
        setError('CAC verification failed - business name mismatch.')
      }

      if (onVerificationComplete) {
        onVerificationComplete('cac', data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status Card */}
      <VerificationStatusCard
        tier={currentTier}
        ninVerified={ninVerified || ninResult?.verified}
        bvnVerified={bvnVerified || bvnResult?.verified}
        cacVerified={cacVerified || cacResult?.verified}
        score={verificationScore}
        className="mb-8"
      />

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = index === activeStep
          const isCompleted = step.verified ||
            (step.id === 'nin' && ninResult?.verified) ||
            (step.id === 'bvn' && bvnResult?.verified) ||
            (step.id === 'cac' && cacResult?.verified)

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveStep(index)}
                className={`flex flex-col items-center ${isActive ? '' : 'opacity-60'}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-400">+{step.points} pts</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Verification Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* NIN Step */}
        {activeStep === 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">NIN Verification</h3>
                <p className="text-gray-500 text-sm">Verify your National Identification Number</p>
              </div>
            </div>

            {ninVerified || ninResult?.verified ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-green-700">NIN Verified</h4>
                <p className="text-gray-500">Your NIN has been successfully verified</p>
                <button
                  onClick={() => setActiveStep(1)}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Continue to BVN
                </button>
              </div>
            ) : (
              <form onSubmit={handleNinVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    National Identification Number (NIN)
                  </label>
                  <div className="relative">
                    <input
                      type={showNin ? 'text' : 'password'}
                      value={ninData.nin}
                      onChange={(e) => setNinData({ ...ninData, nin: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      placeholder="Enter 11-digit NIN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={11}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNin(!showNin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{ninData.nin.length}/11 digits</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={ninData.firstName}
                      onChange={(e) => setNinData({ ...ninData, firstName: e.target.value })}
                      placeholder="As on NIN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={ninData.lastName}
                      onChange={(e) => setNinData({ ...ninData, lastName: e.target.value })}
                      placeholder="As on NIN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Your data is encrypted and securely transmitted</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || ninData.nin.length !== 11}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Verify NIN
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* BVN Step */}
        {activeStep === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">BVN Verification</h3>
                <p className="text-gray-500 text-sm">Verify your Bank Verification Number (optional)</p>
              </div>
            </div>

            {bvnVerified || bvnResult?.verified ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-green-700">BVN Verified</h4>
                <p className="text-gray-500">Your BVN has been successfully verified</p>
                <button
                  onClick={() => setActiveStep(2)}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Continue to CAC
                </button>
              </div>
            ) : (
              <form onSubmit={handleBvnVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Verification Number (BVN)
                  </label>
                  <div className="relative">
                    <input
                      type={showBvn ? 'text' : 'password'}
                      value={bvnData.bvn}
                      onChange={(e) => setBvnData({ ...bvnData, bvn: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      placeholder="Enter 11-digit BVN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={11}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowBvn(!showBvn)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showBvn ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{bvnData.bvn.length}/11 digits</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={bvnData.firstName}
                      onChange={(e) => setBvnData({ ...bvnData, firstName: e.target.value })}
                      placeholder="As on BVN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={bvnData.lastName}
                      onChange={(e) => setBvnData({ ...bvnData, lastName: e.target.value })}
                      placeholder="As on BVN"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Your data is encrypted and securely transmitted</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={loading || bvnData.bvn.length !== 11}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Verify BVN
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* CAC Step */}
        {activeStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 rounded-full">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">CAC Verification</h3>
                <p className="text-gray-500 text-sm">Verify your business registration to become a Trusted Seller</p>
              </div>
            </div>

            {cacVerified || cacResult?.verified ? (
              <div className="text-center py-8">
                <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-amber-700">CAC Verified - Trusted Seller!</h4>
                <p className="text-gray-500">Your business has been successfully verified</p>
                <p className="text-sm text-amber-600 mt-2">You now have the highest trust badge!</p>
              </div>
            ) : (
              <form onSubmit={handleCacVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RC Number
                  </label>
                  <input
                    type="text"
                    value={cacData.rcNumber}
                    onChange={(e) => setCacData({ ...cacData, rcNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g., RC1234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your CAC registration number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={cacData.businessName}
                    onChange={(e) => setCacData({ ...cacData, businessName: e.target.value })}
                    placeholder="As registered with CAC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-700">Complete this step to become a Trusted Seller</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !cacData.rcNumber}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5" />
                        Verify CAC
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
