'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  ChevronLeft,
  Plus,
  Check,
  AlertCircle,
  Clock,
  Car,
  FileText,
  X,
  Loader2
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

const INSURANCE_TYPES = [
  {
    value: 'third_party',
    label: 'Third Party',
    description: 'Basic coverage for damage to other vehicles and property',
    priceRange: '₦15,000 - ₦30,000/year'
  },
  {
    value: 'third_party_plus',
    label: 'Third Party Fire & Theft',
    description: 'Third party coverage plus protection against fire and theft',
    priceRange: '₦35,000 - ₦60,000/year'
  },
  {
    value: 'comprehensive',
    label: 'Comprehensive',
    description: 'Full coverage including damage to your own vehicle',
    priceRange: '3-5% of car value/year'
  }
]

const ADDITIONAL_COVERAGE = [
  { id: 'roadside_assistance', label: 'Roadside Assistance', price: '₦10,000/year' },
  { id: 'windscreen_cover', label: 'Windscreen Cover', price: '₦5,000/year' },
  { id: 'excess_buyback', label: 'Excess Buyback', price: '₦15,000/year' },
  { id: 'personal_accident', label: 'Personal Accident Cover', price: '₦8,000/year' }
]

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Getting Quotes', color: 'bg-blue-100 text-blue-800', icon: Loader2 },
  quoted: { label: 'Quotes Available', color: 'bg-green-100 text-green-800', icon: Check },
  selected: { label: 'Quote Selected', color: 'bg-purple-100 text-purple-800', icon: FileText },
  purchased: { label: 'Purchased', color: 'bg-green-100 text-green-800', icon: Shield },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: Clock }
}

export default function BuyerInsurance() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('requests')
  const [buyer, setBuyer] = useState(null)

  const [formData, setFormData] = useState({
    car_make: '',
    car_model: '',
    car_year: '',
    car_value: '',
    insurance_type: 'comprehensive',
    additional_coverage: [],
    notes: ''
  })

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadData()

    // Check if coming from a car page
    const carId = searchParams.get('carId')
    if (carId) {
      loadCarDetails(carId)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Load buyer info
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single()

      setBuyer(buyerData)

      // Load insurance requests
      const { data: requestsData, error: fetchError } = await supabase
        .from('insurance_quote_requests')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setRequests(requestsData || [])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load insurance requests')
    } finally {
      setLoading(false)
    }
  }

  const loadCarDetails = async (carId) => {
    const { data: car } = await supabase
      .from('cars')
      .select('make, model, year, price')
      .eq('id', carId)
      .single()

    if (car) {
      setFormData(prev => ({
        ...prev,
        car_make: car.make,
        car_model: car.model,
        car_year: car.year.toString(),
        car_value: car.price.toString()
      }))
      setShowRequestModal(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.car_make || !formData.car_model || !formData.car_year || !formData.car_value) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: insertError } = await supabase
        .from('insurance_quote_requests')
        .insert({
          buyer_id: user.id,
          requester_name: buyer?.full_name || '',
          requester_email: buyer?.email || '',
          requester_phone: buyer?.phone || '',
          car_make: formData.car_make,
          car_model: formData.car_model,
          car_year: parseInt(formData.car_year),
          car_value: parseFloat(formData.car_value),
          insurance_type: formData.insurance_type,
          additional_coverage: formData.additional_coverage,
          notes: formData.notes || null,
          status: 'pending'
        })

      if (insertError) throw insertError

      setSuccess('Insurance quote request submitted successfully!')
      setShowRequestModal(false)
      setFormData({
        car_make: '',
        car_model: '',
        car_year: '',
        car_value: '',
        insurance_type: 'comprehensive',
        additional_coverage: [],
        notes: ''
      })
      loadData()
    } catch (err) {
      console.error('Error submitting request:', err)
      setError('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAdditionalCoverage = (coverageId) => {
    setFormData(prev => ({
      ...prev,
      additional_coverage: prev.additional_coverage.includes(coverageId)
        ? prev.additional_coverage.filter(id => id !== coverageId)
        : [...prev.additional_coverage, coverageId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/buyer" className="text-white/80 hover:text-white">
                <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <Shield size={32} />
                  <span>Insurance Quotes</span>
                </h1>
                <p className="text-white/80 mt-1">Get insurance estimates for your car</p>
              </div>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={20} />
              <span>New Request</span>
            </button>
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

        {/* Insurance Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {INSURANCE_TYPES.map((type) => (
            <div key={type.value} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">{type.label}</h3>
              <p className="text-sm text-gray-600 mb-3">{type.description}</p>
              <p className="text-teal-600 font-semibold">{type.priceRange}</p>
            </div>
          ))}
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Your Quote Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Quote Requests Yet</h3>
              <p className="text-gray-600 mb-6">
                Request insurance quotes to protect your vehicle.
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Request a Quote
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status]
                const StatusIcon = statusConfig?.icon || Clock

                return (
                  <div key={request.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.car_year} {request.car_make} {request.car_model}
                        </h3>
                        <p className="text-blue-600 font-semibold">
                          Value: {formatNaira(request.car_value)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig?.color}`}>
                        <StatusIcon size={14} className={request.status === 'processing' ? 'animate-spin' : ''} />
                        {statusConfig?.label}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Insurance Type</p>
                        <p className="font-medium capitalize">{request.insurance_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Requested</p>
                        <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                      {request.expires_at && (
                        <div>
                          <p className="text-gray-500">Expires</p>
                          <p className="font-medium">{new Date(request.expires_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Quotes Display */}
                    {request.quotes && request.quotes.length > 0 && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800 mb-3">Available Quotes:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          {request.quotes.map((quote, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border">
                              <p className="font-semibold text-gray-900">{quote.provider}</p>
                              <p className="text-lg font-bold text-teal-600">
                                {formatNaira(quote.annual)}/year
                              </p>
                              <p className="text-sm text-gray-500">
                                or {formatNaira(quote.monthly)}/month
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Request Insurance Quote</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Car Details */}
              <div className="space-y-4">
                <p className="font-medium text-gray-900">Vehicle Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Make *</label>
                    <input
                      type="text"
                      value={formData.car_make}
                      onChange={(e) => setFormData({ ...formData, car_make: e.target.value })}
                      placeholder="e.g., Toyota"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Model *</label>
                    <input
                      type="text"
                      value={formData.car_model}
                      onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                      placeholder="e.g., Camry"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Year *</label>
                    <input
                      type="number"
                      value={formData.car_year}
                      onChange={(e) => setFormData({ ...formData, car_year: e.target.value })}
                      placeholder="e.g., 2022"
                      min="1990"
                      max="2026"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Value (₦) *</label>
                    <input
                      type="number"
                      value={formData.car_value}
                      onChange={(e) => setFormData({ ...formData, car_value: e.target.value })}
                      placeholder="e.g., 15000000"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Type */}
              <div>
                <p className="font-medium text-gray-900 mb-3">Insurance Type</p>
                <div className="space-y-2">
                  {INSURANCE_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.insurance_type === type.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="insurance_type"
                        value={type.value}
                        checked={formData.insurance_type === type.value}
                        onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                        <p className="text-sm text-teal-600 font-medium mt-1">{type.priceRange}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Coverage */}
              <div>
                <p className="font-medium text-gray-900 mb-3">Additional Coverage (Optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  {ADDITIONAL_COVERAGE.map((coverage) => (
                    <label
                      key={coverage.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.additional_coverage.includes(coverage.id)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.additional_coverage.includes(coverage.id)}
                        onChange={() => toggleAdditionalCoverage(coverage.id)}
                        className="mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium">{coverage.label}</p>
                        <p className="text-xs text-teal-600">{coverage.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Shield size={18} />
                      Request Quotes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
