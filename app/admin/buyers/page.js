/**
 * Admin Buyers/Users Management Page
 * View and manage all buyers/users with ban, suspend, delete, and add capabilities
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Filter,
  Ban,
  Clock,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  UserPlus,
  RefreshCw,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Activity,
  Download,
  Loader2,
  X,
  ChevronDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    verified: 0
  })

  useEffect(() => {
    fetchBuyers()
  }, [statusFilter, verificationFilter])

  const fetchBuyers = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          query = query.or('account_status.is.null,account_status.eq.active')
                       .eq('is_banned', false)
                       .eq('is_suspended', false)
        } else if (statusFilter === 'suspended') {
          query = query.eq('is_suspended', true)
        } else if (statusFilter === 'banned') {
          query = query.eq('is_banned', true)
        }
      }

      // Apply verification filter
      if (verificationFilter !== 'all') {
        query = query.eq('verification_status', verificationFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Apply search filter client-side
      let filteredData = data || []
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = filteredData.filter(buyer =>
          buyer.full_name?.toLowerCase().includes(query) ||
          buyer.email?.toLowerCase().includes(query) ||
          buyer.phone?.includes(query) ||
          buyer.location?.toLowerCase().includes(query)
        )
      }

      setBuyers(filteredData)

      // Calculate stats from all buyers
      const { data: allBuyers } = await supabase.from('buyers').select('account_status, is_banned, is_suspended, verification_status')

      if (allBuyers) {
        setStats({
          total: allBuyers.length,
          active: allBuyers.filter(b => (!b.account_status || b.account_status === 'active') && !b.is_banned && !b.is_suspended).length,
          suspended: allBuyers.filter(b => b.is_suspended).length,
          banned: allBuyers.filter(b => b.is_banned).length,
          verified: allBuyers.filter(b => b.verification_status === 'verified').length
        })
      }
    } catch (error) {
      console.error('Error fetching buyers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBuyers()
  }

  const handleBanUser = async (buyerId, reason) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, reason })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to ban user')
      }

      await fetchBuyers()
      setShowActionModal(null)
      setSelectedBuyer(null)
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnbanUser = async (buyerId) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unban user')
      }

      await fetchBuyers()
      setShowActionModal(null)
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendUser = async (buyerId, reason, duration) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, reason, duration })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to suspend user')
      }

      await fetchBuyers()
      setShowActionModal(null)
      setSelectedBuyer(null)
    } catch (error) {
      console.error('Error suspending user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnsuspendUser = async (buyerId) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/unsuspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unsuspend user')
      }

      await fetchBuyers()
      setShowActionModal(null)
    } catch (error) {
      console.error('Error unsuspending user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (buyerId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      await fetchBuyers()
      setSelectedBuyer(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddUser = async (userData) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/buyers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add user')
      }

      await fetchBuyers()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (buyer) => {
    if (buyer.is_banned) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>
    }
    if (buyer.is_suspended) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Suspended</span>
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
  }

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Verified</span>
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unverified</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buyers / Users Management</h1>
                <p className="text-sm sm:text-base text-gray-500">Manage all registered buyers and users</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add New User
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
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
                <p className="text-sm text-gray-500">Suspended</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.banned}</p>
                <p className="text-sm text-gray-500">Banned</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 w-full sm:w-auto">Status:</span>
              {['all', 'active', 'suspended', 'banned'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Verification Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Verification:</span>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="unverified">Unverified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchBuyers}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : buyers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {buyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {buyer.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{buyer.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{buyer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3 h-3" />
                          {buyer.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {buyer.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(buyer)}
                    </td>
                    <td className="px-4 py-4">
                      {getVerificationBadge(buyer.verification_status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(buyer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBuyer(buyer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!buyer.is_banned && !buyer.is_suspended && (
                          <button
                            onClick={() => setShowActionModal({ type: 'suspend', buyer })}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspend User"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                        {buyer.is_suspended && !buyer.is_banned && (
                          <button
                            onClick={() => handleUnsuspendUser(buyer.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Unsuspend User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {!buyer.is_banned && (
                          <button
                            onClick={() => setShowActionModal({ type: 'ban', buyer })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {buyer.is_banned && (
                          <button
                            onClick={() => handleUnbanUser(buyer.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Unban User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(buyer.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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

      {/* User Detail Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {selectedBuyer.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedBuyer.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedBuyer)}
                      {getVerificationBadge(selectedBuyer.verification_status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBuyer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedBuyer.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedBuyer.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedBuyer.location || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Joined {new Date(selectedBuyer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Status Info */}
              {(selectedBuyer.is_banned || selectedBuyer.is_suspended) && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">
                    {selectedBuyer.is_banned ? 'Ban Information' : 'Suspension Information'}
                  </h4>
                  <div className="text-sm text-red-600 space-y-1">
                    {selectedBuyer.is_banned && (
                      <>
                        <p><strong>Banned At:</strong> {new Date(selectedBuyer.banned_at).toLocaleString()}</p>
                        <p><strong>Reason:</strong> {selectedBuyer.ban_reason || 'No reason provided'}</p>
                      </>
                    )}
                    {selectedBuyer.is_suspended && (
                      <>
                        <p><strong>Suspended At:</strong> {new Date(selectedBuyer.suspended_at).toLocaleString()}</p>
                        {selectedBuyer.suspended_until && (
                          <p><strong>Until:</strong> {new Date(selectedBuyer.suspended_until).toLocaleString()}</p>
                        )}
                        <p><strong>Reason:</strong> {selectedBuyer.suspend_reason || 'No reason provided'}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Verification Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium">{selectedBuyer.verification_status || 'unverified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tier</p>
                      <p className="font-medium">{selectedBuyer.verification_tier || 'basic'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lead Score</p>
                      <p className="font-medium">{selectedBuyer.lead_score || 'low'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Budget Range</p>
                      <p className="font-medium">{selectedBuyer.budget_range || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedBuyer.admin_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Admin Notes</h4>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{selectedBuyer.admin_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {!selectedBuyer.is_banned && !selectedBuyer.is_suspended && (
                  <button
                    onClick={() => {
                      setSelectedBuyer(null)
                      setShowActionModal({ type: 'suspend', buyer: selectedBuyer })
                    }}
                    className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Suspend User
                  </button>
                )}

                {selectedBuyer.is_suspended && !selectedBuyer.is_banned && (
                  <button
                    onClick={() => {
                      handleUnsuspendUser(selectedBuyer.id)
                      setSelectedBuyer(null)
                    }}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Unsuspend User
                  </button>
                )}

                {!selectedBuyer.is_banned && (
                  <button
                    onClick={() => {
                      setSelectedBuyer(null)
                      setShowActionModal({ type: 'ban', buyer: selectedBuyer })
                    }}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                )}

                {selectedBuyer.is_banned && (
                  <button
                    onClick={() => {
                      handleUnbanUser(selectedBuyer.id)
                      setSelectedBuyer(null)
                    }}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Unban User
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeleteUser(selectedBuyer.id)
                  }}
                  className="px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Ban/Suspend) */}
      {showActionModal && (
        <ActionModal
          type={showActionModal.type}
          buyer={showActionModal.buyer}
          onClose={() => setShowActionModal(null)}
          onBan={handleBanUser}
          onSuspend={handleSuspendUser}
          loading={actionLoading}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

// Action Modal Component
function ActionModal({ type, buyer, onClose, onBan, onSuspend, loading }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('7')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (type === 'ban') {
      onBan(buyer.id, reason)
    } else {
      onSuspend(buyer.id, reason, parseInt(duration))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {type === 'ban' ? (
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {type === 'ban' ? 'Ban User' : 'Suspend User'}
              </h3>
              <p className="text-sm text-gray-500">{buyer.full_name} ({buyer.email})</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={type === 'ban' ? 'Reason for banning this user...' : 'Reason for suspending this user...'}
            />
          </div>

          {type === 'suspend' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className={`flex-1 py-2.5 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                type === 'ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {type === 'ban' ? 'Ban User' : 'Suspend User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add User Modal Component
function AddUserModal({ onClose, onAdd, loading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <p className="text-sm text-gray-500">Create a new buyer account</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Lagos, Nigeria"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.full_name || !formData.email}
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
