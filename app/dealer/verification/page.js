'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertCircle, Loader2 } from 'lucide-react'
import DealerVerificationForm from '@/components/verification/DealerVerificationForm'

export default function DealerVerificationPage() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDealerData()
  }, [])

  const fetchDealerData = async () => {
    try {
      // Get current dealer session
      const response = await fetch('/api/dealer/me')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dealer data')
      }

      setDealer(data.dealer)

      // Calculate verification tier and score
      const ninVerified = data.dealer.nin_verified || false
      const bvnVerified = data.dealer.bvn_verified || false
      const cacVerified = data.dealer.cac_verified || false

      let score = 0
      if (ninVerified) score += 35
      if (bvnVerified) score += 35
      if (cacVerified) score += 25

      let tier = 'basic'
      if (score >= 70) tier = 'trusted_seller'
      else if (score >= 35) tier = 'verified'

      setVerificationData({
        tier: data.dealer.verification_tier || tier,
        score: data.dealer.verification_score || score,
        ninVerified,
        bvnVerified,
        cacVerified
      })
    } catch (err) {
      console.error('Error fetching dealer data:', err)
      setError(err.message)

      // Redirect to login if not authenticated
      if (err.message.includes('Unauthorized') || err.message.includes('No session')) {
        router.push('/dealer/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = async (type, result) => {
    // Refresh dealer data after verification
    await fetchDealerData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading verification status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Identity Verification</h1>
          </div>
          <p className="text-blue-100">
            Verify your identity to build trust with buyers and unlock premium features
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-amber-800 mb-3">Why Verify Your Identity?</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-amber-900">Build Trust</p>
                <p className="text-sm text-amber-700">Verified badges increase buyer confidence</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-amber-900">Higher Visibility</p>
                <p className="text-sm text-amber-700">Verified listings rank higher in search</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-amber-900">Access Escrow</p>
                <p className="text-sm text-amber-700">Only verified sellers can use escrow payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        {dealer && verificationData && (
          <DealerVerificationForm
            dealerId={dealer.id}
            dealerName={dealer.business_name || dealer.name}
            currentTier={verificationData.tier}
            ninVerified={verificationData.ninVerified}
            bvnVerified={verificationData.bvnVerified}
            cacVerified={verificationData.cacVerified}
            verificationScore={verificationData.score}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-1">Is my data secure?</h4>
              <p className="text-sm text-gray-600">
                Yes, all verification data is encrypted and transmitted securely. We use Dojah,
                a trusted Nigerian identity verification provider, to verify your details.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-1">What is the difference between verification tiers?</h4>
              <p className="text-sm text-gray-600">
                <strong>Basic:</strong> Unverified account. <strong>Verified:</strong> NIN or BVN verified (identity confirmed).
                <strong> Trusted Seller:</strong> Full verification including CAC business registration.
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-1">Can I update my verification later?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can come back anytime to complete additional verification steps and
                upgrade your trust tier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
