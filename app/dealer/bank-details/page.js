/**
 * Dealer Bank Details Page
 * Allows dealers to manage their bank account information
 * Used for receiving payments and payouts
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Building2, User, Hash, CheckCircle, AlertCircle, Loader2, Save, Trash2, Shield } from 'lucide-react'

export default function BankDetailsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    bank_code: '',
    account_type: 'savings'
  })

  // List of Nigerian banks
  const banks = [
    { name: 'Access Bank', code: '044' },
    { name: 'Citibank', code: '023' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank (FCMB)', code: '214' },
    { name: 'Globus Bank', code: '00103' },
    { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Kuda Bank', code: '50211' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank for Africa (UBA)', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' }
  ]

  useEffect(() => {
    fetchBankDetails()
  }, [])

  const fetchBankDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dealer/bank-details')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/dealer/login')
          return
        }
        throw new Error('Failed to fetch bank details')
      }

      const data = await response.json()

      if (data.bankDetails) {
        setBankDetails(data.bankDetails)
        setFormData({
          account_name: data.bankDetails.account_name || '',
          account_number: data.bankDetails.account_number || '',
          bank_name: data.bankDetails.bank_name || '',
          bank_code: data.bankDetails.bank_code || '',
          account_type: data.bankDetails.account_type || 'savings'
        })
      }
    } catch (err) {
      console.error('Error fetching bank details:', err)
      setError('Failed to load bank details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const response = await fetch('/api/dealer/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank details')
      }

      setBankDetails(data.bankDetails)
      setSuccess('Bank details saved successfully!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      console.error('Error saving bank details:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your bank details?')) {
      return
    }

    setError(null)
    setSuccess(null)
    setDeleting(true)

    try {
      const response = await fetch('/api/dealer/bank-details', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete bank details')
      }

      setBankDetails(null)
      setFormData({
        account_name: '',
        account_number: '',
        bank_name: '',
        bank_code: '',
        account_type: 'savings'
      })
      setSuccess('Bank details deleted successfully')
    } catch (err) {
      console.error('Error deleting bank details:', err)
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleBankChange = (e) => {
    const selectedBank = banks.find(b => b.name === e.target.value)
    setFormData({
      ...formData,
      bank_name: e.target.value,
      bank_code: selectedBank?.code || ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading bank details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bank Account Details</h1>
          <p className="text-gray-400">
            Manage your bank account information for receiving payments
          </p>
        </div>

        {/* Verification Status */}
        {bankDetails && (
          <div className={`mb-6 p-4 rounded-lg border ${
            bankDetails.is_verified
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-yellow-500/10 border-yellow-500/50'
          }`}>
            <div className="flex items-center gap-3">
              {bankDetails.is_verified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-400 font-medium">
                    Your bank account has been verified by admin
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-400 font-medium">
                    Pending admin verification
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-400">{success}</span>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">Security Notice</h3>
              <p className="text-gray-400 text-sm">
                Your bank details are encrypted and only accessible to you and platform administrators.
                This information is used solely for payment processing.
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-2xl">
          {/* Account Name */}
          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Account Name
            </label>
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter account holder name"
              required
            />
          </div>

          {/* Bank Name */}
          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Bank Name
            </label>
            <select
              value={formData.bank_name}
              onChange={handleBankChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Account Number
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter 10-digit account number"
              maxLength="10"
              pattern="\d{10}"
              required
            />
          </div>

          {/* Account Type */}
          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Account Type
            </label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="savings">Savings Account</option>
              <option value="current">Current Account</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Bank Details
                </>
              )}
            </button>

            {bankDetails && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dealer')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
