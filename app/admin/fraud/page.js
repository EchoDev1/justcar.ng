'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Shield,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Copy,
  Car,
  User,
  DollarSign,
  AlertOctagon,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatFlagForDisplay, getRecommendedAction, SEVERITY, FLAG_TYPES } from '@/lib/fraud/detector'

export default function AdminFraudDashboard() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedFlag, setSelectedFlag] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    critical: 0,
    high: 0,
    resolved: 0
  })

  useEffect(() => {
    fetchFlags()
  }, [filter, severityFilter])

  const fetchFlags = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('fraud_flags')
        .select(`
          *,
          cars (id, make, model, year, price, dealer_id),
          dealers (id, name, business_name, email)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error

      setFlags(data || [])

      // Calculate stats from all flags
      const { data: allFlags } = await supabase
        .from('fraud_flags')
        .select('status, severity')

      if (allFlags) {
        setStats({
          total: allFlags.length,
          pending: allFlags.filter(f => f.status === 'pending').length,
          critical: allFlags.filter(f => f.severity === 'critical').length,
          high: allFlags.filter(f => f.severity === 'high').length,
          resolved: allFlags.filter(f => f.status === 'resolved' || f.status === 'dismissed').length
        })
      }
    } catch (error) {
      console.error('Error fetching fraud flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (flagId, action, notes = '') => {
    setActionLoading(true)
    try {
      const supabase = createClient()

      const updateData = {
        status: action,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes,
        action_taken: action === 'confirmed' ? 'Listing blocked' : action === 'dismissed' ? 'False positive' : 'Under review',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('fraud_flags')
        .update(updateData)
        .eq('id', flagId)

      if (error) throw error

      // If confirmed, optionally block the car
      if (action === 'confirmed' && selectedFlag?.entity_type === 'car' && selectedFlag?.entity_id) {
        await supabase
          .from('cars')
          .update({ is_blocked: true })
          .eq('id', selectedFlag.entity_id)
      }

      await fetchFlags()
      setSelectedFlag(null)

    } catch (error) {
      console.error('Error updating flag:', error)
      alert('Failed to update flag: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'reviewing': return 'bg-blue-100 text-blue-700'
      case 'confirmed': return 'bg-red-100 text-red-700'
      case 'dismissed': return 'bg-gray-100 text-gray-500'
      case 'resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFlagIcon = (flagType) => {
    switch (flagType) {
      case 'price_anomaly_low':
      case 'price_anomaly_high':
        return DollarSign
      case 'duplicate_listing':
      case 'duplicate_photos':
        return Copy
      case 'stolen_vehicle':
        return AlertOctagon
      case 'suspicious_dealer':
        return User
      default:
        return AlertTriangle
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fraud Detection Dashboard</h1>
              <p className="text-gray-500">Review and manage flagged listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Flags</p>
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
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertOctagon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
                <p className="text-sm text-gray-500">Critical</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.high}</p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                <p className="text-sm text-gray-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              {['all', 'pending', 'reviewing', 'confirmed', 'dismissed'].map((status) => (
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

            {/* Severity Filter */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-500">Severity:</span>
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    severityFilter === sev
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flags Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading fraud flags...</p>
            </div>
          ) : flags.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">No fraud flags found</p>
              <p className="text-sm text-gray-400">All clear!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flag</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {flags.map((flag) => {
                  const FlagIcon = getFlagIcon(flag.flag_type)
                  return (
                    <tr key={flag.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(flag.severity)}`}>
                            <FlagIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {flag.flag_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500 max-w-xs truncate">{flag.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {flag.entity_type === 'car' && flag.cars
                              ? `${flag.cars.make} ${flag.cars.model} ${flag.cars.year}`
                              : flag.entity_type === 'dealer' && flag.dealers
                                ? flag.dealers.business_name || flag.dealers.name
                                : `${flag.entity_type} ${flag.entity_id?.slice(0, 8)}`
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {flag.entity_type === 'car' && flag.cars?.price
                              ? `₦${flag.cars.price.toLocaleString()}`
                              : flag.entity_type}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(flag.severity)}`}>
                          {flag.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                          {flag.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                flag.confidence_score >= 80 ? 'bg-red-500' :
                                flag.confidence_score >= 60 ? 'bg-orange-500' :
                                flag.confidence_score >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${flag.confidence_score || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{flag.confidence_score || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(flag.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedFlag(flag)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Flag Detail Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(selectedFlag.severity)}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedFlag.flag_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedFlag.status)}`}>
                      {selectedFlag.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-900">{selectedFlag.description}</p>
              </div>

              {/* Detection Data */}
              {selectedFlag.detection_data && Object.keys(selectedFlag.detection_data).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Detection Details</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {Object.entries(selectedFlag.detection_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-gray-900 font-medium">
                          {typeof value === 'number' && key.includes('price')
                            ? `₦${value.toLocaleString()}`
                            : typeof value === 'number' && key.includes('pct')
                              ? `${value}%`
                              : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entity Info */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Flagged Entity</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  {selectedFlag.entity_type === 'car' && selectedFlag.cars && (
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFlag.cars.make} {selectedFlag.cars.model} {selectedFlag.cars.year}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: ₦{selectedFlag.cars.price?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  )}
                  {selectedFlag.entity_type === 'dealer' && selectedFlag.dealers && (
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFlag.dealers.business_name || selectedFlag.dealers.name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedFlag.dealers.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Recommended Action</h4>
                <p className="text-blue-600 text-sm">{getRecommendedAction(selectedFlag)}</p>
              </div>

              {/* Actions */}
              {selectedFlag.status === 'pending' || selectedFlag.status === 'reviewing' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction(selectedFlag.id, 'confirmed')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Confirm & Block
                  </button>

                  <button
                    onClick={() => handleAction(selectedFlag.id, 'dismissed')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Dismiss (False Positive)
                  </button>

                  <button
                    onClick={() => handleAction(selectedFlag.id, 'reviewing')}
                    disabled={actionLoading}
                    className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as Reviewing
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">This flag has been {selectedFlag.status}</p>
                  {selectedFlag.admin_notes && (
                    <p className="text-sm text-gray-400 mt-1">Note: {selectedFlag.admin_notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedFlag(null)}
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
