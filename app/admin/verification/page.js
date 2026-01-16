'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  ShieldCheck,
  Award,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VerificationTierBadge } from '@/components/verification/VerificationTierBadge'

export default function AdminVerificationDashboard() {
  const router = useRouter()
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, verified, trusted_seller
  const [search, setSearch] = useState('')
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    trusted_seller: 0
  })

  useEffect(() => {
    fetchDealers()
  }, [filter])

  const fetchDealers = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('dealers')
        .select(`
          *,
          dealer_verification_tiers (*)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_tier', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setDealers(data || [])

      // Calculate stats
      const allDealers = data || []
      setStats({
        total: allDealers.length,
        pending: allDealers.filter(d => d.verification_tier === 'basic' || !d.verification_tier).length,
        verified: allDealers.filter(d => d.verification_tier === 'verified').length,
        trusted_seller: allDealers.filter(d => d.verification_tier === 'trusted_seller').length
      })
    } catch (error) {
      console.error('Error fetching dealers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (dealerId, tier, notes = '') => {
    setActionLoading(true)
    try {
      const supabase = createClient()

      // Calculate score based on tier
      let score = 0
      let ninVerified = false
      let bvnVerified = false
      let cacVerified = false

      if (tier === 'verified') {
        score = 35
        ninVerified = true
      } else if (tier === 'trusted_seller') {
        score = 95
        ninVerified = true
        bvnVerified = true
        cacVerified = true
      }

      // Update dealer
      const { error: dealerError } = await supabase
        .from('dealers')
        .update({
          verification_tier: tier,
          verification_score: score,
          nin_verified: ninVerified,
          bvn_verified: bvnVerified,
          cac_verified: cacVerified,
          is_verified: tier !== 'basic'
        })
        .eq('id', dealerId)

      if (dealerError) throw dealerError

      // Update or insert verification tier record
      const { data: existing } = await supabase
        .from('dealer_verification_tiers')
        .select('id')
        .eq('dealer_id', dealerId)
        .maybeSingle()

      const tierData = {
        dealer_id: dealerId,
        tier,
        verification_score: score,
        nin_verified: ninVerified,
        bvn_verified: bvnVerified,
        cac_verified: cacVerified,
        admin_verified: true,
        admin_verified_at: new Date().toISOString(),
        admin_notes: notes,
        updated_at: new Date().toISOString()
      }

      if (existing) {
        await supabase
          .from('dealer_verification_tiers')
          .update(tierData)
          .eq('dealer_id', dealerId)
      } else {
        await supabase
          .from('dealer_verification_tiers')
          .insert(tierData)
      }

      // Refresh dealers
      await fetchDealers()
      setSelectedDealer(null)

    } catch (error) {
      console.error('Error verifying dealer:', error)
      alert('Failed to verify dealer: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredDealers = dealers.filter(dealer => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      dealer.name?.toLowerCase().includes(searchLower) ||
      dealer.business_name?.toLowerCase().includes(searchLower) ||
      dealer.email?.toLowerCase().includes(searchLower) ||
      dealer.location?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verification Dashboard</h1>
                <p className="text-gray-500">Manage dealer verification and trust tiers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Dealers</p>
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
                <p className="text-sm text-gray-500">Pending/Basic</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.trusted_seller}</p>
                <p className="text-sm text-gray-500">Trusted Sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dealers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'basic', label: 'Basic' },
                { value: 'verified', label: 'Verified' },
                { value: 'trusted_seller', label: 'Trusted' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === tab.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dealers Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading dealers...</p>
            </div>
          ) : filteredDealers.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No dealers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{dealer.business_name || dealer.name}</p>
                        <p className="text-sm text-gray-500">{dealer.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {dealer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {dealer.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <VerificationTierBadge tier={dealer.verification_tier || 'basic'} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">{dealer.verification_score || 0}</span>
                      <span className="text-gray-400">/100</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedDealer(dealer)}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dealer Modal */}
      {selectedDealer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDealer.business_name || selectedDealer.name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedDealer.email}</p>
                </div>
                <VerificationTierBadge tier={selectedDealer.verification_tier || 'basic'} />
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Dealer Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{selectedDealer.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedDealer.location || 'No location'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="w-5 h-5" />
                  <span>{selectedDealer.business_registration_number || 'No registration number'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Joined {new Date(selectedDealer.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Current Verification</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded text-center text-sm ${selectedDealer.nin_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    NIN {selectedDealer.nin_verified ? '✓' : '✗'}
                  </div>
                  <div className={`p-2 rounded text-center text-sm ${selectedDealer.bvn_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    BVN {selectedDealer.bvn_verified ? '✓' : '✗'}
                  </div>
                  <div className={`p-2 rounded text-center text-sm ${selectedDealer.cac_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    CAC {selectedDealer.cac_verified ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Set Verification Tier</h4>

                <button
                  onClick={() => handleVerify(selectedDealer.id, 'basic')}
                  disabled={actionLoading}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 disabled:opacity-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Basic</p>
                      <p className="text-sm text-gray-500">Unverified account</p>
                    </div>
                  </div>
                  {selectedDealer.verification_tier === 'basic' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </button>

                <button
                  onClick={() => handleVerify(selectedDealer.id, 'verified')}
                  disabled={actionLoading}
                  className="w-full p-3 border border-blue-300 bg-blue-50 rounded-lg text-left hover:bg-blue-100 disabled:opacity-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">Verified</p>
                      <p className="text-sm text-blue-600">Identity confirmed (+35 points)</p>
                    </div>
                  </div>
                  {selectedDealer.verification_tier === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </button>

                <button
                  onClick={() => handleVerify(selectedDealer.id, 'trusted_seller')}
                  disabled={actionLoading}
                  className="w-full p-3 border border-amber-300 bg-amber-50 rounded-lg text-left hover:bg-amber-100 disabled:opacity-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-amber-900">Trusted Seller</p>
                      <p className="text-sm text-amber-600">Full verification (+95 points)</p>
                    </div>
                  </div>
                  {selectedDealer.verification_tier === 'trusted_seller' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedDealer(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
