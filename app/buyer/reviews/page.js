'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  ChevronLeft,
  Edit2,
  AlertCircle,
  Check,
  Car,
  Clock,
  User,
  MessageSquare
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

export default function BuyerReviews() {
  const [myReviews, setMyReviews] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Load my reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('dealer_reviews')
        .select(`
          *,
          dealer:dealers(name, location)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError
      setMyReviews(reviews || [])

      // Load completed purchases that haven't been reviewed
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchase_records')
        .select(`
          *,
          dealer:dealers(id, name, location)
        `)
        .eq('buyer_id', user.id)
        .eq('has_reviewed', false)
        .order('purchased_at', { ascending: false })

      if (purchasesError) throw purchasesError
      setPendingReviews(purchases || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReviewModal = (purchase) => {
    setSelectedPurchase(purchase)
    setReviewForm({
      rating: 5,
      title: '',
      content: ''
    })
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedPurchase) return

    try {
      setSubmitting(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get buyer info
      const { data: buyer } = await supabase
        .from('buyers')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      // Create the review
      const { data: review, error: reviewError } = await supabase
        .from('dealer_reviews')
        .insert({
          dealer_id: selectedPurchase.dealer_id,
          reviewer_id: user.id,
          reviewer_name: buyer?.full_name || 'Anonymous',
          reviewer_email: buyer?.email,
          car_id: selectedPurchase.car_id,
          car_title: `${selectedPurchase.car_year} ${selectedPurchase.car_make} ${selectedPurchase.car_model}`,
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content,
          status: 'published',
          is_verified: true
        })
        .select()
        .single()

      if (reviewError) throw reviewError

      // Update purchase record
      const { error: updateError } = await supabase
        .from('purchase_records')
        .update({
          has_reviewed: true,
          review_id: review.id
        })
        .eq('id', selectedPurchase.id)

      if (updateError) throw updateError

      setSuccess('Review submitted successfully!')
      setShowReviewModal(false)
      setSelectedPurchase(null)
      loadData()
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ rating, onChange, interactive = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 32 : 20}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/buyer" className="text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Star size={32} />
                <span>Dealer Reviews</span>
              </h1>
              <p className="text-white/80 mt-1">Rate and review dealers after your purchase</p>
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
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending Reviews ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'submitted'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Reviews ({myReviews.length})
          </button>
        </div>

        {/* Pending Reviews Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Check className="mx-auto text-green-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">
                  You have no pending reviews. Purchase a car to leave a review for the dealer.
                </p>
              </div>
            ) : (
              pendingReviews.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Car className="text-blue-500" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">
                          {purchase.car_year} {purchase.car_make} {purchase.car_model}
                        </h3>
                      </div>
                      <p className="text-lg font-semibold text-blue-600 mb-2">
                        {formatNaira(purchase.purchase_price)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User size={16} />
                          <span>{purchase.dealer_name || purchase.dealer?.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReviewModal(purchase)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Edit2 size={18} />
                      <span>Write Review</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Submitted Reviews Tab */}
        {activeTab === 'submitted' && (
          <div className="space-y-4">
            {myReviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600">
                  Once you complete a purchase, you can leave a review for the dealer.
                </p>
              </div>
            ) : (
              myReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{review.title}</h3>
                      <div className="flex items-center space-x-3">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      review.status === 'published' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{review.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <span>
                      <span className="font-medium">Dealer:</span> {review.dealer?.name}
                    </span>
                    {review.car_title && (
                      <span>
                        <span className="font-medium">Car:</span> {review.car_title}
                      </span>
                    )}
                  </div>

                  {/* Dealer Response */}
                  {review.dealer_response && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">Dealer Response:</p>
                      <p className="text-sm text-blue-700">{review.dealer_response}</p>
                      <p className="text-xs text-blue-500 mt-2">
                        {new Date(review.dealer_response_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
              <p className="text-gray-600 mt-1">
                Share your experience with {selectedPurchase.dealer_name || selectedPurchase.dealer?.name}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              {/* Car Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Purchased Vehicle</p>
                <p className="font-semibold text-gray-900">
                  {selectedPurchase.car_year} {selectedPurchase.car_make} {selectedPurchase.car_model}
                </p>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating
                </label>
                <div className="flex justify-center">
                  <StarRating
                    rating={reviewForm.rating}
                    onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                    interactive
                  />
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {reviewForm.rating === 5 && 'Excellent'}
                  {reviewForm.rating === 4 && 'Very Good'}
                  {reviewForm.rating === 3 && 'Good'}
                  {reviewForm.rating === 2 && 'Fair'}
                  {reviewForm.rating === 1 && 'Poor'}
                </p>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Summarize your experience"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  placeholder="Share details about your experience with this dealer..."
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedPurchase(null)
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
