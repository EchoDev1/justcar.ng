/**
 * Admin - Dealer Bank Details Page
 * View and verify all dealer bank account information
 * Admin-only access for payment processing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard, Building2, User, Hash, CheckCircle, XCircle, Loader2, Search, Filter, Eye
} from 'lucide-react'

export default function AdminDealerBankDetailsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bankDetails, setBankDetails] = useState([])
  const [filteredDetails, setFilteredDetails] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, verified, unverified
  const [verifying, setVerifying] = useState(null)

  useEffect(() => {
    fetchBankDetails()
  }, [])

  useEffect(() => {
    filterBankDetails()
  }, [bankDetails, searchTerm, filterStatus])

  const fetchBankDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dealer-bank-details')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch bank details')
      }

      const data = await response.json()
      setBankDetails(data.bankDetails || [])
    } catch (error) {
      console.error('Error fetching bank details:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBankDetails = () => {
    let filtered = [...bankDetails]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(detail =>
        detail.dealers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.account_number?.includes(searchTerm)
      )
    }

    // Status filter
    if (filterStatus === 'verified') {
      filtered = filtered.filter(detail => detail.is_verified)
    } else if (filterStatus === 'unverified') {
      filtered = filtered.filter(detail => !detail.is_verified)
    }

    setFilteredDetails(filtered)
  }

  const handleVerify = async (id, currentStatus) => {
    try {
      setVerifying(id)

      const response = await fetch('/api/admin/dealer-bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          is_verified: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update verification status')
      }

      // Refresh data
      await fetchBankDetails()
    } catch (error) {
      console.error('Error verifying bank details:', error)
      alert('Failed to update verification status')
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bank details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dealer Bank Details</h1>
              <p className="text-gray-600">View and verify dealer payment information</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{bankDetails.length}</p>
                </div>
                <CreditCard className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Verified</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bankDetails.filter(d => d.is_verified).length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Verification</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {bankDetails.filter(d => !d.is_verified).length}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by dealer, account name, bank, or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bank Details Table */}
        {filteredDetails.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No bank details found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Dealers have not added their bank details yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDetails.map((detail) => (
                    <tr key={detail.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {detail.dealers?.name || 'Unknown Dealer'}
                          </div>
                          <div className="text-sm text-gray-500">{detail.dealers?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{detail.account_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{detail.bank_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-gray-900">{detail.account_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                          {detail.account_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {detail.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleVerify(detail.id, detail.is_verified)}
                          disabled={verifying === detail.id}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            detail.is_verified
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {verifying === detail.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : detail.is_verified ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
