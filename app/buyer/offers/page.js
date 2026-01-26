'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Tag,
  ChevronLeft,
  Clock,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Pending Response', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  viewed: { label: 'Dealer Viewed', color: 'bg-blue-100 text-blue-800', icon: Clock },
  counter: { label: 'Counter Offer', color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: Check },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: X },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: Clock },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: X },
  converted: { label: 'Converted to Sale', color: 'bg-green-100 text-green-800', icon: Check }
}

export default function BuyerOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [processingOffer, setProcessingOffer] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('car_offers')
        .select(`
          *,
          car:cars(
            id, make, model, year, price, status,
            car_images(image_url, is_primary)
          ),
          dealer:dealers(id, name, location)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setOffers(data || [])
    } catch (err) {
      console.error('Error loading offers:', err)
      setError('Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawOffer = async (offerId) => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return

    try {
      setProcessingOffer(offerId)
      const { error } = await supabase
        .from('car_offers')
        .update({ status: 'withdrawn' })
        .eq('id', offerId)

      if (error) throw error
      setSuccess('Offer withdrawn successfully')
      loadOffers()
    } catch (err) {
      console.error('Error withdrawing offer:', err)
      setError('Failed to withdraw offer')
    } finally {
      setProcessingOffer(null)
    }
  }

  const handleRespondToCounter = async (offerId, response, amount = null) => {
    try {
      setProcessingOffer(offerId)

      const updateData = {
        buyer_counter_response: response,
        buyer_counter_at: new Date().toISOString()
      }

      if (response === 'accepted') {
        // Accept counter offer
        updateData.status = 'accepted'
        const offer = offers.find(o => o.id === offerId)
        if (offer) {
          updateData.final_agreed_price = offer.counter_amount
        }
      } else if (response === 'rejected') {
        updateData.status = 'rejected'
      } else if (response === 'counter' && amount) {
        updateData.buyer_counter_amount = amount
        // This would need dealer to respond again
      }

      const { error } = await supabase
        .from('car_offers')
        .update(updateData)
        .eq('id', offerId)

      if (error) throw error

      setSuccess(response === 'accepted' ? 'Counter offer accepted!' : 'Response sent')
      loadOffers()
    } catch (err) {
      console.error('Error responding to counter:', err)
      setError('Failed to respond to counter offer')
    } finally {
      setProcessingOffer(null)
    }
  }

  const activeOffers = offers.filter(o => ['pending', 'viewed', 'counter'].includes(o.status))
  const completedOffers = offers.filter(o => ['accepted', 'rejected', 'expired', 'withdrawn', 'converted'].includes(o.status))

  const displayOffers = activeTab === 'active' ? activeOffers : completedOffers

  const getTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffMs = expires - now

    if (diffMs <= 0) return 'Expired'

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h remaining`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <Link href="/buyer" className="text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Tag size={32} />
                <span>My Offers</span>
              </h1>
              <p className="text-white/80 mt-1">Manage your offers and negotiations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="mr-2" size={20} />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active Offers ({activeOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Completed ({completedOffers.length})
          </button>
        </div>

        {/* Offers List */}
        {displayOffers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Tag className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'active' ? 'No Active Offers' : 'No Completed Offers'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active'
                ? 'Make an offer on a car to start negotiating.'
                : 'Your completed offers will appear here.'}
            </p>
            <Link href="/cars">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
                Browse Cars
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOffers.map((offer) => {
              const car = offer.car
              if (!car) return null
              const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
              const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'
              const statusConfig = STATUS_CONFIG[offer.status]
              const StatusIcon = statusConfig?.icon || Clock

              return (
                <div key={offer.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Car Image */}
                    <Link href={`/cars/${car.id}`} className="md:w-64 shrink-0">
                      <div className="relative h-48 md:h-full">
                        <Image
                          src={imageUrl}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Offer Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link href={`/cars/${car.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                              {car.year} {car.make} {car.model}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500">{offer.dealer?.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig?.color}`}>
                          <StatusIcon size={14} />
                          {statusConfig?.label}
                        </span>
                      </div>

                      {/* Price Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Asking Price</p>
                          <p className="font-semibold text-gray-900">{formatNaira(offer.original_price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Your Offer</p>
                          <p className="font-bold text-green-600">{formatNaira(offer.offer_amount)}</p>
                        </div>
                        {offer.counter_amount && (
                          <div>
                            <p className="text-xs text-gray-500">Counter Offer</p>
                            <p className="font-bold text-purple-600">{formatNaira(offer.counter_amount)}</p>
                          </div>
                        )}
                        {offer.final_agreed_price && (
                          <div>
                            <p className="text-xs text-gray-500">Agreed Price</p>
                            <p className="font-bold text-blue-600">{formatNaira(offer.final_agreed_price)}</p>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {offer.message && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          <p className="text-xs text-gray-500 mb-1">Your message:</p>
                          {offer.message}
                        </div>
                      )}

                      {/* Counter Offer Response Section */}
                      {offer.status === 'counter' && offer.counter_amount && (
                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="font-medium text-purple-800 mb-2">
                            Dealer Counter Offer: {formatNaira(offer.counter_amount)}
                          </p>
                          {offer.counter_message && (
                            <p className="text-sm text-purple-700 mb-3">{offer.counter_message}</p>
                          )}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleRespondToCounter(offer.id, 'accepted')}
                              disabled={processingOffer === offer.id}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              {processingOffer === offer.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check size={18} />
                                  Accept
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRespondToCounter(offer.id, 'rejected')}
                              disabled={processingOffer === offer.id}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <X size={18} />
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          {offer.status === 'pending' && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {getTimeRemaining(offer.expires_at)}
                            </span>
                          )}
                          {offer.status !== 'pending' && (
                            <span>
                              Submitted {new Date(offer.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {['pending', 'viewed'].includes(offer.status) && (
                            <button
                              onClick={() => handleWithdrawOffer(offer.id)}
                              disabled={processingOffer === offer.id}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                            >
                              Withdraw
                            </button>
                          )}
                          {offer.status === 'accepted' && (
                            <Link href={`/buyer/escrow/${car.id}`}>
                              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                                Proceed to Purchase
                                <ArrowRight size={16} />
                              </button>
                            </Link>
                          )}
                          <Link href={`/cars/${car.id}`}>
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                              View Car
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
