'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Filter,
  Calendar,
  User,
  Car,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DealerReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [filter, setFilter] = useState('all')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDealerAndReviews()
  }, [filter])

  const fetchDealerAndReviews = async () => {
    setLoading(true)
    try {
      // Get dealer info
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      // Fetch reviews for this dealer
      const supabase = createClient()
      let query = supabase
        .from('dealer_reviews')
        .select('*')
        .eq('dealer_id', dealerData.id)
        .order('created_at', { ascending: false })

      if (filter === 'responded') {
        query = query.not('dealer_response', 'is', null)
      } else if (filter === 'pending') {
        query = query.is('dealer_response', null)
      } else if (filter === 'positive') {
        query = query.gte('rating', 4)
      } else if (filter === 'negative') {
        query = query.lte('rating', 2)
      }

      const { data: reviewsData, error } = await query

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reviews:', error)
      }

      const allReviews = reviewsData || []
      setReviews(allReviews)

      // Calculate stats
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
        const responded = allReviews.filter(r => r.dealer_response).length
        const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        allReviews.forEach(r => {
          if (ratingsCount[r.rating] !== undefined) {
            ratingsCount[r.rating]++
          }
        })

        setStats({
          totalReviews: allReviews.length,
          averageRating: (totalRating / allReviews.length).toFixed(1),
          responseRate: Math.round((responded / allReviews.length) * 100),
          ratings: ratingsCount
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('dealer_reviews')
        .update({
          dealer_response: replyText,
          dealer_response_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('dealer_id', dealer.id)

      if (error) throw error

      setReplyingTo(null)
      setReplyText('')
      fetchDealerAndReviews()
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert('Failed to submit reply')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500" />
          Reviews & Ratings
        </h1>
        <p className="text-gray-600 mt-2">
          View and respond to customer feedback about your dealership
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-gray-900">{stats.averageRating}</span>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.responseRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Replies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {reviews.filter(r => !r.dealer_response).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratings[rating] || 0
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
        {[
          { value: 'all', label: 'All Reviews' },
          { value: 'pending', label: 'Pending Reply' },
          { value: 'responded', label: 'Responded' },
          { value: 'positive', label: '4-5 Stars' },
          { value: 'negative', label: '1-2 Stars' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">
              When customers leave reviews for your dealership, they'll appear here.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.reviewer_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {!review.dealer_response ? (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Reply
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Responded
                  </span>
                )}
              </div>

              {/* Review Content */}
              <div className="mb-4">
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                )}
                <p className="text-gray-600">{review.content}</p>
              </div>

              {/* Car Reference if available */}
              {review.car_id && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 p-2 bg-gray-50 rounded-lg">
                  <Car className="w-4 h-4" />
                  <span>Review for: {review.car_title || 'Vehicle'}</span>
                </div>
              )}

              {/* Dealer Response */}
              {review.dealer_response ? (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-blue-900">Your Response</span>
                    <span className="text-xs text-blue-600">
                      {review.dealer_response_at && formatDate(review.dealer_response_at)}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.dealer_response}</p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a professional and courteous response..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      Tip: Thank the reviewer and address any concerns professionally
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={submitting || !replyText.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Write a Response
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
