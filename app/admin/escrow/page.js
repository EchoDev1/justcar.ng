/**
 * Admin Escrow Dashboard
 * Oversee all escrow transactions, handle disputes, manage releases/refunds
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, TrendingUp, Clock, AlertCircle, DollarSign, Users, CheckCircle, XCircle, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/payments'
import Loading from '@/components/ui/Loading'
import { handleAuthError } from '@/lib/auth/session-handler'

export default function AdminEscrowDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('') // 'release', 'refund', 'dispute'
  const [actionNote, setActionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    escrow_account_number: '',
    escrow_bank_name: '',
    payment_reference: '',
    payment_method: '',
    payment_date: '',
    dealer_payment_reference: '',
    refund_reference: '',
    admin_notes: ''
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, filterStatus, searchTerm])

  const loadTransactions = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      // Handle auth errors
      if (authError) {
        const wasHandled = await handleAuthError(authError, supabase, router)
        if (wasHandled) return
      }

      if (!user) {
        router.push('/admin/login')
        return
      }

      // SECURITY NOTE: Admin role verification should be implemented
      // For production, add middleware or RLS policies to verify user has admin privileges
      // Current implementation only checks authentication, not authorization

      // Get all escrow transactions
      const { data: transactionsData, error } = await supabase
        .from('escrow_transactions')
        .select(`
          *,
          cars (
            id,
            make,
            model,
            year,
            trim,
            price
          ),
          buyers (
            id,
            full_name,
            email,
            phone
          ),
          dealers (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTransactions(transactionsData || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading transactions:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })

      // Handle potential auth errors
      const wasHandled = await handleAuthError(error, supabase, router)
      if (!wasHandled) {
        // Check if it's a database error
        if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
          console.warn('Database table might not exist. Using empty data.')
          setTransactions([])
        } else {
          alert(`Failed to load transactions: ${error?.message || 'Unknown error'}. Please check console for details.`)
        }
      }

      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.escrow_status === filterStatus)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t =>
        t.cars?.make?.toLowerCase().includes(term) ||
        t.cars?.model?.toLowerCase().includes(term) ||
        t.buyers?.full_name?.toLowerCase().includes(term) ||
        t.dealers?.name?.toLowerCase().includes(term) ||
        t.id?.toLowerCase().includes(term)
      )
    }

    setFilteredTransactions(filtered)
  }

  const calculateStats = () => {
    const totalVolume = transactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
    const totalFees = transactions.filter(t => t.escrow_status === 'released').reduce((sum, t) => sum + parseFloat(t.escrow_fee || 0), 0)
    const activeCount = transactions.filter(t => ['funded', 'inspection_scheduled', 'inspection_completed', 'approved'].includes(t.escrow_status)).length
    const disputedCount = transactions.filter(t => t.escrow_status === 'disputed').length

    return { totalVolume, totalFees, activeCount, disputedCount }
  }

  const handleAction = (transaction, action) => {
    setSelectedTransaction(transaction)
    setActionType(action)
    setShowActionModal(true)
    setActionNote('')
  }

  const submitAction = async () => {
    try {
      setSubmitting(true)

      let updateData = {
        admin_notes: actionNote
      }

      if (actionType === 'release') {
        updateData.escrow_status = 'released'
        updateData.released_at = new Date().toISOString()
        updateData.released_by_admin = true
      } else if (actionType === 'refund') {
        updateData.escrow_status = 'refunded'
        updateData.refunded_at = new Date().toISOString()
        updateData.refunded_by_admin = true
      } else if (actionType === 'dispute') {
        updateData.escrow_status = 'disputed'
        updateData.disputed_at = new Date().toISOString()
      } else if (actionType === 'resolve_dispute') {
        updateData.escrow_status = 'approved' // or could be refunded based on resolution
        updateData.dispute_resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('escrow_transactions')
        .update(updateData)
        .eq('id', selectedTransaction.id)

      if (error) throw error

      // Reload transactions
      await loadTransactions()

      setShowActionModal(false)
      setSelectedTransaction(null)
      setSubmitting(false)

      alert(`Transaction ${actionType === 'release' ? 'released' : actionType === 'refund' ? 'refunded' : 'updated'} successfully!`)
    } catch (error) {
      console.error('Error submitting action:', error)
      alert('Failed to perform action. Please try again.')
      setSubmitting(false)
    }
  }

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction)
    setEditFormData({
      escrow_account_number: transaction.escrow_account_number || '',
      escrow_bank_name: transaction.escrow_bank_name || '',
      payment_reference: transaction.payment_reference || '',
      payment_method: transaction.payment_method || 'bank_transfer',
      payment_date: transaction.payment_date ? new Date(transaction.payment_date).toISOString().split('T')[0] : '',
      dealer_payment_reference: transaction.dealer_payment_reference || '',
      refund_reference: transaction.refund_reference || '',
      admin_notes: transaction.admin_notes || ''
    })
    setShowEditModal(true)
  }

  const submitEdit = async () => {
    try {
      setSubmitting(true)

      const updateData = {
        escrow_account_number: editFormData.escrow_account_number,
        escrow_bank_name: editFormData.escrow_bank_name,
        payment_reference: editFormData.payment_reference,
        payment_method: editFormData.payment_method,
        payment_date: editFormData.payment_date ? new Date(editFormData.payment_date).toISOString() : null,
        dealer_payment_reference: editFormData.dealer_payment_reference,
        refund_reference: editFormData.refund_reference,
        admin_notes: editFormData.admin_notes,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('escrow_transactions')
        .update(updateData)
        .eq('id', selectedTransaction.id)

      if (error) throw error

      // Reload transactions
      await loadTransactions()

      setShowEditModal(false)
      setSelectedTransaction(null)
      setSubmitting(false)

      alert('Escrow details updated successfully!')
    } catch (error) {
      console.error('Error updating escrow details:', error)
      alert('Failed to update escrow details. Please try again.')
      setSubmitting(false)
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      initiated: { color: 'blue', label: 'Initiated' },
      funded: { color: 'green', label: 'Funded' },
      inspection_scheduled: { color: 'purple', label: 'Inspection Scheduled' },
      inspection_completed: { color: 'indigo', label: 'Inspection Complete' },
      approved: { color: 'emerald', label: 'Approved' },
      released: { color: 'green', label: 'Released' },
      rejected: { color: 'red', label: 'Rejected' },
      refunded: { color: 'gray', label: 'Refunded' },
      disputed: { color: 'orange', label: 'Disputed' },
      cancelled: { color: 'gray', label: 'Cancelled' }
    }
    return statusMap[status] || statusMap.initiated
  }

  if (loading) {
    return <Loading text="Loading escrow dashboard..." />
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-4">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
                <p className="text-gray-600">Oversee all escrow transactions</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Total Volume</p>
                <DollarSign className="text-blue-500" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalVolume)}</p>
              <p className="text-xs text-gray-500 mt-1">All transactions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Fees Collected</p>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalFees)}</p>
              <p className="text-xs text-gray-500 mt-1">1.5% platform fee</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Active</p>
                <Clock className="text-blue-500" size={20} />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.activeCount}</p>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 text-sm">Disputed</p>
                <AlertCircle className="text-orange-500" size={20} />
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.disputedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by car, buyer, dealer, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                {['all', 'funded', 'approved', 'disputed', 'released', 'refunded'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                      filterStatus === status
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    ({status === 'all' ? transactions.length : transactions.filter(t => t.escrow_status === status).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Transactions Found</h2>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No escrow transactions yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Car
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const statusInfo = getStatusInfo(transaction.escrow_status)

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs text-gray-500">ID: {transaction.id.substring(0, 8)}...</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {transaction.cars.year} {transaction.cars.make} {transaction.cars.model}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.cars.trim}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{transaction.buyers.full_name}</p>
                          <p className="text-xs text-gray-500">{transaction.buyers.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{transaction.dealers.name}</p>
                          <p className="text-xs text-gray-500">{transaction.dealers.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{formatCurrency(transaction.car_price)}</p>
                          <p className="text-xs text-green-600">Fee: {formatCurrency(transaction.escrow_fee)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              title="Edit account details"
                            >
                              Edit
                            </button>
                            {['approved', 'funded', 'inspection_completed'].includes(transaction.escrow_status) && (
                              <button
                                onClick={() => handleAction(transaction, 'release')}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                title="Release payment to dealer"
                              >
                                Release
                              </button>
                            )}
                            {['funded', 'inspection_completed', 'approved'].includes(transaction.escrow_status) && (
                              <button
                                onClick={() => handleAction(transaction, 'refund')}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                title="Refund buyer"
                              >
                                Refund
                              </button>
                            )}
                            {transaction.escrow_status === 'disputed' && (
                              <button
                                onClick={() => handleAction(transaction, 'resolve_dispute')}
                                className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                                title="Resolve dispute"
                              >
                                Resolve
                              </button>
                            )}
                            {!['disputed', 'released', 'refunded', 'cancelled'].includes(transaction.escrow_status) && (
                              <button
                                onClick={() => handleAction(transaction, 'dispute')}
                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                                title="Mark as disputed"
                              >
                                Dispute
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {actionType === 'release' ? 'Release Payment' :
               actionType === 'refund' ? 'Refund Buyer' :
               actionType === 'dispute' ? 'Mark as Disputed' :
               'Resolve Dispute'}
            </h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Transaction Details:</p>
              <p className="font-semibold text-gray-900">
                {selectedTransaction.cars.year} {selectedTransaction.cars.make} {selectedTransaction.cars.model}
              </p>
              <p className="text-sm text-gray-600">
                Buyer: {selectedTransaction.buyers.full_name}
              </p>
              <p className="text-sm text-gray-600">
                Dealer: {selectedTransaction.dealers.name}
              </p>
              <p className="text-lg font-bold text-green-600 mt-2">
                Amount: {formatCurrency(selectedTransaction.car_price)}
              </p>
            </div>

            {actionType === 'release' && (
              <p className="text-sm text-gray-700 mb-4">
                This will release <strong>{formatCurrency(selectedTransaction.car_price)}</strong> to the dealer.
                The transaction will be marked as complete.
              </p>
            )}

            {actionType === 'refund' && (
              <p className="text-sm text-gray-700 mb-4">
                This will refund <strong>{formatCurrency(selectedTransaction.total_amount)}</strong> to the buyer.
                Make sure payment processing is handled separately.
              </p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes (Required)
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Provide a reason for this action..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setSelectedTransaction(null)
                }}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting || !actionNote.trim()}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 ${
                  actionType === 'release' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                  actionType === 'refund' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                  'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                }`}
              >
                {submitting ? 'Processing...' : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1).replace('_', ' ')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Escrow Details Modal */}
      {showEditModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Escrow Account Details
            </h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Transaction:</p>
              <p className="font-semibold text-gray-900">
                {selectedTransaction.cars.year} {selectedTransaction.cars.make} {selectedTransaction.cars.model}
              </p>
              <p className="text-sm text-gray-600">ID: {selectedTransaction.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Escrow Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Escrow Account Number
                </label>
                <input
                  type="text"
                  value={editFormData.escrow_account_number}
                  onChange={(e) => setEditFormData({ ...editFormData, escrow_account_number: e.target.value })}
                  placeholder="e.g., 1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Escrow Bank Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={editFormData.escrow_bank_name}
                  onChange={(e) => setEditFormData({ ...editFormData, escrow_bank_name: e.target.value })}
                  placeholder="e.g., GTBank"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={editFormData.payment_method}
                  onChange={(e) => setEditFormData({ ...editFormData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="monnify">Monnify</option>
                </select>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={editFormData.payment_date}
                  onChange={(e) => setEditFormData({ ...editFormData, payment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={editFormData.payment_reference}
                  onChange={(e) => setEditFormData({ ...editFormData, payment_reference: e.target.value })}
                  placeholder="e.g., PAY-123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Dealer Payment Reference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dealer Payment Reference
                </label>
                <input
                  type="text"
                  value={editFormData.dealer_payment_reference}
                  onChange={(e) => setEditFormData({ ...editFormData, dealer_payment_reference: e.target.value })}
                  placeholder="Reference for payment to dealer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Refund Reference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Reference
                </label>
                <input
                  type="text"
                  value={editFormData.refund_reference}
                  onChange={(e) => setEditFormData({ ...editFormData, refund_reference: e.target.value })}
                  placeholder="Reference for refund to buyer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={editFormData.admin_notes}
                onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                placeholder="Add notes about this transaction..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedTransaction(null)
                }}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:from-blue-600 hover:to-blue-700"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
