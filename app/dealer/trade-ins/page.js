'use client'

import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Car,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Filter,
  Search,
  Loader2,
  ChevronDown,
  Eye,
  FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TRADE_IN_STATUSES = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  reviewing: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Eye },
  quoted: { label: 'Quote Sent', color: 'bg-purple-100 text-purple-700', icon: DollarSign },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle }
}

export default function TradeInsPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [tradeIns, setTradeIns] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTradeIn, setSelectedTradeIn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTradeIns()
  }, [filter])

  const fetchTradeIns = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()
      let query = supabase
        .from('trade_in_requests')
        .select('*')
        .eq('dealer_id', dealerData.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching trade-ins:', error)
      }

      setTradeIns(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const supabase = createClient()
      await supabase
        .from('trade_in_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('dealer_id', dealer.id)

      fetchTradeIns()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const submitQuote = async () => {
    if (!quoteAmount || !selectedTradeIn) return

    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase
        .from('trade_in_requests')
        .update({
          status: 'quoted',
          quote_amount: parseFloat(quoteAmount),
          quote_notes: quoteNotes,
          quoted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTradeIn.id)
        .eq('dealer_id', dealer.id)

      setShowModal(false)
      setSelectedTradeIn(null)
      setQuoteAmount('')
      setQuoteNotes('')
      fetchTradeIns()
    } catch (error) {
      console.error('Error submitting quote:', error)
      alert('Failed to submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTradeIns = tradeIns.filter(item => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      item.customer_name?.toLowerCase().includes(search) ||
      item.vehicle_make?.toLowerCase().includes(search) ||
      item.vehicle_model?.toLowerCase().includes(search)
    )
  })

  const stats = {
    total: tradeIns.length,
    pending: tradeIns.filter(t => t.status === 'pending').length,
    quoted: tradeIns.filter(t => t.status === 'quoted').length,
    completed: tradeIns.filter(t => t.status === 'completed').length
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
          <RefreshCw className="w-8 h-8 text-blue-600" />
          Trade-In Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Manage customer trade-in requests and send quotes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Quotes Sent</p>
          <p className="text-2xl font-bold text-purple-600">{stats.quoted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          {Object.entries(TRADE_IN_STATUSES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trade-In List */}
      <div className="space-y-4">
        {filteredTradeIns.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trade-in requests</h3>
            <p className="text-gray-500">
              When customers submit trade-in requests, they'll appear here.
            </p>
          </div>
        ) : (
          filteredTradeIns.map((item) => {
            const status = TRADE_IN_STATUSES[item.status] || TRADE_IN_STATUSES.pending
            const StatusIcon = status.icon
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.vehicle_year} {item.vehicle_make} {item.vehicle_model}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{item.vehicle_mileage?.toLocaleString()} km</span>
                        <span>{item.vehicle_condition}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{item.customer_name}</span>
                  </div>
                  {item.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${item.customer_phone}`} className="text-blue-600 hover:underline">
                        {item.customer_phone}
                      </a>
                    </div>
                  )}
                  {item.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${item.customer_email}`} className="text-blue-600 hover:underline">
                        {item.customer_email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Quote Info */}
                {item.quote_amount && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-700 font-medium">Quote Amount</span>
                      <span className="text-2xl font-bold text-purple-700">
                        ₦{item.quote_amount.toLocaleString()}
                      </span>
                    </div>
                    {item.quote_notes && (
                      <p className="text-sm text-purple-600 mt-2">{item.quote_notes}</p>
                    )}
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    <span className="font-medium">Customer Notes:</span> {item.description}
                  </p>
                )}

                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {item.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Trade-in photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, 'reviewing')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Start Review
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'rejected')}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {item.status === 'reviewing' && (
                    <button
                      onClick={() => {
                        setSelectedTradeIn(item)
                        setShowModal(true)
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Send Quote
                    </button>
                  )}
                  {item.status === 'quoted' && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, 'accepted')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Mark Accepted
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTradeIn(item)
                          setQuoteAmount(item.quote_amount?.toString() || '')
                          setQuoteNotes(item.quote_notes || '')
                          setShowModal(true)
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Update Quote
                      </button>
                    </>
                  )}
                  {item.status === 'accepted' && (
                    <button
                      onClick={() => updateStatus(item.id, 'completed')}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    Submitted {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quote Modal */}
      {showModal && selectedTradeIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Trade-In Quote</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedTradeIn.vehicle_year} {selectedTradeIn.vehicle_make} {selectedTradeIn.vehicle_model}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Amount (₦)
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="Enter amount in Naira"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Add any notes about the valuation..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedTradeIn(null)
                  setQuoteAmount('')
                  setQuoteNotes('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitQuote}
                disabled={!quoteAmount || submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
