'use client'

import { useState, useEffect } from 'react'
import {
  MessageCircle,
  Star,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Trash2,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  ThumbsUp,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DealerReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('pending')
  const [selectedReview, setSelectedReview] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('dealer_reviews')
        .select(`
          *,
          dealers (id, name, business_name),
          buyers (id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.limit(100)

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reviews:', error)
      }

      setReviews(data || [])

      // Calculate stats
      const { data: allReviews } = await supabase
        .from('dealer_reviews')
        .select('status')

      if (allReviews) {
        setStats({
          total: allReviews.length,
          pending: allReviews.filter(r => r.status === 'pending').length,
          approved: allReviews.filter(r => r.status === 'approved').length,
          rejected: allReviews.filter(r => r.status === 'rejected').length,
          flagged: allReviews.filter(r => r.status === 'flagged').length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (reviewId, action, notes = '') => {
    setActionLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('dealer_reviews')
        .update({
          status: action,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (error) throw error

      fetchReviews()
      setSelectedReview(null)
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Failed to update review: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const supabase = createClient()
      await supabase.from('dealer_reviews').delete().eq('id', reviewId)
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>
      case 'flagged':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Flagged</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dealer Reviews</h1>
                <p className="text-sm sm:text-base text-gray-500">Moderate and manage buyer reviews of dealers</p>
              </div>
            </div>
            <button
              onClick={fetchReviews}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
                <p className="text-sm text-gray-500">Flagged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-500 w-full sm:w-auto">Filter:</span>
            {['all', 'pending', 'approved', 'rejected', 'flagged'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{review.title || 'No title'}</p>
                        <p className="text-sm text-gray-500 truncate">{review.review_text}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">
                        {review.dealers?.business_name || review.dealers?.name || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">{review.buyers?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{review.buyers?.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(review.id, 'approved')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(review.id, 'rejected')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
                {getStatusBadge(selectedReview.status)}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                {renderStars(selectedReview.rating)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{selectedReview.title || 'No title'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Review</p>
                <p className="text-gray-700">{selectedReview.review_text || 'No review text'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dealer</p>
                  <p className="text-gray-700">{selectedReview.dealers?.business_name || selectedReview.dealers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="text-gray-700">{selectedReview.buyers?.full_name}</p>
                </div>
              </div>
              {selectedReview.is_verified_purchase && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Verified Purchase</span>
                </div>
              )}

              {selectedReview.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAction(selectedReview.id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(selectedReview.id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selectedReview.id, 'flagged')}
                    disabled={actionLoading}
                    className="px-4 py-2.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 flex items-center justify-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedReview(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
