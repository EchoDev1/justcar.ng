'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Tag, X, Loader2, Check, AlertCircle } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

/**
 * Make Offer Button Component
 * Allows buyers to submit offers on cars
 */
export default function MakeOfferButton({ car, dealer, variant = 'secondary' }) {
  const [showModal, setShowModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [existingOffer, setExistingOffer] = useState(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkExistingOffer()
  }, [car.id])

  const checkExistingOffer = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: offer } = await supabase
      .from('car_offers')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('car_id', car.id)
      .in('status', ['pending', 'viewed', 'counter'])
      .single()

    setExistingOffer(offer)
  }

  const handleOpenModal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/buyer/auth?action=offer&carId=${car.id}`)
      return
    }

    // Set default offer amount (10% below asking price)
    const suggestedOffer = Math.round(car.price * 0.9)
    setOfferAmount(suggestedOffer.toString())
    setShowModal(true)
  }

  const handleSubmitOffer = async (e) => {
    e.preventDefault()
    setError('')

    const amount = parseFloat(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid offer amount')
      return
    }

    if (amount > car.price) {
      setError('Offer cannot be higher than the asking price')
      return
    }

    if (amount < car.price * 0.5) {
      setError('Offer must be at least 50% of the asking price')
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const discountPercent = ((car.price - amount) / car.price) * 100

      const { data, error: insertError } = await supabase
        .from('car_offers')
        .insert({
          buyer_id: user.id,
          dealer_id: dealer.id,
          car_id: car.id,
          offer_amount: amount,
          original_price: car.price,
          discount_percent: discountPercent.toFixed(2),
          message: message || null,
          status: 'pending',
          expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 hours
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSuccess(true)
      setExistingOffer(data)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Error submitting offer:', err)
      setError('Failed to submit offer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const buttonClasses = {
    primary: 'w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg',
    secondary: 'w-full bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-purple-200',
    outline: 'w-full border-2 border-green-500 text-green-600 hover:bg-green-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2'
  }

  // Show different button if offer exists
  if (existingOffer) {
    return (
      <button
        onClick={() => router.push('/buyer/offers')}
        className={buttonClasses[variant]}
      >
        <Tag size={20} />
        View Your Offer ({existingOffer.status})
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={buttonClasses[variant]}
      >
        <Tag size={20} />
        Make an Offer
      </button>

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Offer Submitted!</h3>
                <p className="text-gray-600">
                  The dealer will be notified and can respond within 72 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="p-6 space-y-6">
                {/* Car Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    Asking Price: {formatNaira(car.price)}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* Offer Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Offer Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Enter your offer"
                      required
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  {offerAmount && parseFloat(offerAmount) < car.price && (
                    <p className="text-sm text-green-600 mt-2">
                      {((1 - parseFloat(offerAmount) / car.price) * 100).toFixed(1)}% below asking price
                    </p>
                  )}
                </div>

                {/* Quick Offer Buttons */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Quick offers:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.95, 0.90, 0.85].map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        onClick={() => setOfferAmount(Math.round(car.price * percent).toString())}
                        className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                      >
                        {(percent * 100).toFixed(0)}% ({formatNaira(car.price * percent)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Dealer (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain why you're making this offer..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Info */}
                <div className="text-sm text-gray-500">
                  <p>• The dealer has 72 hours to respond</p>
                  <p>• You'll be notified when they respond</p>
                  <p>• You can withdraw your offer at any time</p>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Tag size={18} />
                        Submit Offer
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
