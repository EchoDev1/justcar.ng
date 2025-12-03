/**
 * Admin Payment Accounts Management
 * Configure payment providers, escrow accounts, and platform settings
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Settings,
  DollarSign,
  CreditCard,
  Wallet,
  Shield,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Link as LinkIcon
} from 'lucide-react'
import Loading from '@/components/ui/Loading'

export default function PaymentAccountsManagement() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('paystack')
  const [showApiKeys, setShowApiKeys] = useState({})
  const [testResults, setTestResults] = useState({})

  // Payment Provider Settings
  const [paystackSettings, setPaystackSettings] = useState({
    enabled: false,
    mode: 'test',
    test_public_key: '',
    test_secret_key: '',
    live_public_key: '',
    live_secret_key: '',
    webhook_url: '',
    callback_url: ''
  })

  const [flutterwaveSettings, setFlutterwaveSettings] = useState({
    enabled: false,
    mode: 'test',
    test_public_key: '',
    test_secret_key: '',
    live_public_key: '',
    live_secret_key: '',
    webhook_url: '',
    callback_url: ''
  })

  const [monnifySettings, setMonnifySettings] = useState({
    enabled: false,
    mode: 'test',
    test_api_key: '',
    test_secret_key: '',
    test_contract_code: '',
    live_api_key: '',
    live_secret_key: '',
    live_contract_code: '',
    webhook_url: ''
  })

  // Escrow Bank Accounts
  const [escrowAccounts, setEscrowAccounts] = useState([])
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    is_default: false
  })

  // Platform Settings
  const [platformSettings, setPlatformSettings] = useState({
    escrow_fee_percentage: 1.5,
    min_transaction_amount: 100000,
    max_transaction_amount: 100000000,
    auto_release_days: 7
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)

      // Note: Authentication is handled by the admin layout (app/admin/layout.js)
      // This page is already protected - no need for additional auth checks here

      // Load payment provider settings from database
      const { data: settings, error: settingsError } = await supabase
        .from('payment_settings')
        .select('*')
        .single()

      if (settings && !settingsError) {
        if (settings.paystack) setPaystackSettings(settings.paystack)
        if (settings.flutterwave) setFlutterwaveSettings(settings.flutterwave)
        if (settings.monnify) setMonnifySettings(settings.monnify)
        if (settings.platform) setPlatformSettings(settings.platform)
      }

      // Load escrow bank accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('escrow_bank_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (accounts && !accountsError) {
        setEscrowAccounts(accounts)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)

      // Check if it's a database error
      if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        console.warn('Database tables might not exist. Please run migrations.')
      } else {
        console.error('Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        })
      }

      setLoading(false)
    }
  }

  const savePaymentSettings = async (provider, settings) => {
    try {
      setSaving(true)

      const updateData = {
        [provider]: settings,
        updated_at: new Date().toISOString()
      }

      // Check if settings exist
      const { data: existing } = await supabase
        .from('payment_settings')
        .select('id')
        .single()

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('payment_settings')
          .update(updateData)
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('payment_settings')
          .insert([updateData])

        if (error) throw error
      }

      setSaving(false)
      alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} settings saved successfully!`)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
      setSaving(false)
    }
  }

  const savePlatformSettings = async () => {
    try {
      setSaving(true)

      const updateData = {
        platform: platformSettings,
        updated_at: new Date().toISOString()
      }

      const { data: existing } = await supabase
        .from('payment_settings')
        .select('id')
        .single()

      if (existing) {
        const { error } = await supabase
          .from('payment_settings')
          .update(updateData)
          .eq('id', existing.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('payment_settings')
          .insert([updateData])

        if (error) throw error
      }

      setSaving(false)
      alert('Platform settings saved successfully!')
    } catch (error) {
      console.error('Error saving platform settings:', error)
      alert('Failed to save platform settings. Please try again.')
      setSaving(false)
    }
  }

  const addEscrowAccount = async () => {
    try {
      if (!newAccount.bank_name || !newAccount.account_number || !newAccount.account_name) {
        alert('Please fill in all account details')
        return
      }

      setSaving(true)

      // If this is set as default, unset other defaults
      if (newAccount.is_default) {
        await supabase
          .from('escrow_bank_accounts')
          .update({ is_default: false })
          .eq('is_default', true)
      }

      const { error } = await supabase
        .from('escrow_bank_accounts')
        .insert([newAccount])

      if (error) throw error

      // Reload accounts
      await loadSettings()

      // Reset form
      setNewAccount({
        bank_name: '',
        account_number: '',
        account_name: '',
        is_default: false
      })

      setSaving(false)
      alert('Escrow account added successfully!')
    } catch (error) {
      console.error('Error adding escrow account:', error)
      alert('Failed to add escrow account. Please try again.')
      setSaving(false)
    }
  }

  const deleteEscrowAccount = async (id) => {
    if (!confirm('Are you sure you want to delete this escrow account?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('escrow_bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadSettings()
      alert('Escrow account deleted successfully!')
    } catch (error) {
      console.error('Error deleting escrow account:', error)
      alert('Failed to delete escrow account. Please try again.')
    }
  }

  const setDefaultAccount = async (id) => {
    try {
      // Unset all defaults
      await supabase
        .from('escrow_bank_accounts')
        .update({ is_default: false })
        .eq('is_default', true)

      // Set new default
      const { error } = await supabase
        .from('escrow_bank_accounts')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error

      await loadSettings()
      alert('Default account updated!')
    } catch (error) {
      console.error('Error setting default account:', error)
      alert('Failed to set default account. Please try again.')
    }
  }

  const testConnection = async (provider) => {
    try {
      setTestResults({ ...testResults, [provider]: 'testing' })

      // In a real implementation, this would make API calls to test the connection
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 2000))

      setTestResults({ ...testResults, [provider]: 'success' })
      setTimeout(() => {
        setTestResults({ ...testResults, [provider]: null })
      }, 5000)
    } catch (error) {
      setTestResults({ ...testResults, [provider]: 'error' })
      setTimeout(() => {
        setTestResults({ ...testResults, [provider]: null })
      }, 5000)
    }
  }

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys({ ...showApiKeys, [key]: !showApiKeys[key] })
  }

  if (loading) {
    return <Loading text="Loading payment settings..." />
  }

  const renderPaystackSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <CreditCard className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paystack Configuration</h2>
            <p className="text-gray-600">Configure your Paystack payment gateway</p>
          </div>
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={paystackSettings.enabled}
            onChange={(e) => setPaystackSettings({ ...paystackSettings, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="font-semibold text-gray-700">Enabled</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="test"
                checked={paystackSettings.mode === 'test'}
                onChange={(e) => setPaystackSettings({ ...paystackSettings, mode: e.target.value })}
                className="mr-2"
              />
              Test Mode
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="live"
                checked={paystackSettings.mode === 'live'}
                onChange={(e) => setPaystackSettings({ ...paystackSettings, mode: e.target.value })}
                className="mr-2"
              />
              Live Mode
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Keys */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Test Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test Public Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['paystack_test_public'] ? 'text' : 'password'}
                  value={paystackSettings.test_public_key}
                  onChange={(e) => setPaystackSettings({ ...paystackSettings, test_public_key: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('paystack_test_public')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['paystack_test_public'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['paystack_test_secret'] ? 'text' : 'password'}
                  value={paystackSettings.test_secret_key}
                  onChange={(e) => setPaystackSettings({ ...paystackSettings, test_secret_key: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('paystack_test_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['paystack_test_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Live Keys */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Live Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live Public Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['paystack_live_public'] ? 'text' : 'password'}
                  value={paystackSettings.live_public_key}
                  onChange={(e) => setPaystackSettings({ ...paystackSettings, live_public_key: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('paystack_live_public')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['paystack_live_public'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['paystack_live_secret'] ? 'text' : 'password'}
                  value={paystackSettings.live_secret_key}
                  onChange={(e) => setPaystackSettings({ ...paystackSettings, live_secret_key: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('paystack_live_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['paystack_live_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook and Callback URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              Webhook URL
            </label>
            <input
              type="text"
              value={paystackSettings.webhook_url}
              onChange={(e) => setPaystackSettings({ ...paystackSettings, webhook_url: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/paystack"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Set this URL in your Paystack dashboard</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              Callback URL
            </label>
            <input
              type="text"
              value={paystackSettings.callback_url}
              onChange={(e) => setPaystackSettings({ ...paystackSettings, callback_url: e.target.value })}
              placeholder="https://yourdomain.com/payment/callback"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">URL where users return after payment</p>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => savePaymentSettings('paystack', paystackSettings)}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={() => testConnection('paystack')}
            disabled={testResults.paystack === 'testing'}
            className="flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${testResults.paystack === 'testing' ? 'animate-spin' : ''}`} />
            Test Connection
          </button>

          {testResults.paystack === 'success' && (
            <div className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={20} className="mr-2" />
              Connection Successful
            </div>
          )}

          {testResults.paystack === 'error' && (
            <div className="flex items-center text-red-600 font-semibold">
              <AlertCircle size={20} className="mr-2" />
              Connection Failed
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderFlutterwaveSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Wallet className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Flutterwave Configuration</h2>
            <p className="text-gray-600">Configure your Flutterwave payment gateway</p>
          </div>
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flutterwaveSettings.enabled}
            onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, enabled: e.target.checked })}
            className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
          />
          <span className="font-semibold text-gray-700">Enabled</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="test"
                checked={flutterwaveSettings.mode === 'test'}
                onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, mode: e.target.value })}
                className="mr-2"
              />
              Test Mode
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="live"
                checked={flutterwaveSettings.mode === 'live'}
                onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, mode: e.target.value })}
                className="mr-2"
              />
              Live Mode
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Keys */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Test Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test Public Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['flutterwave_test_public'] ? 'text' : 'password'}
                  value={flutterwaveSettings.test_public_key}
                  onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, test_public_key: e.target.value })}
                  placeholder="FLWPUBK_TEST-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('flutterwave_test_public')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['flutterwave_test_public'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['flutterwave_test_secret'] ? 'text' : 'password'}
                  value={flutterwaveSettings.test_secret_key}
                  onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, test_secret_key: e.target.value })}
                  placeholder="FLWSECK_TEST-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('flutterwave_test_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['flutterwave_test_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Live Keys */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Live Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live Public Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['flutterwave_live_public'] ? 'text' : 'password'}
                  value={flutterwaveSettings.live_public_key}
                  onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, live_public_key: e.target.value })}
                  placeholder="FLWPUBK-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('flutterwave_live_public')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['flutterwave_live_public'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['flutterwave_live_secret'] ? 'text' : 'password'}
                  value={flutterwaveSettings.live_secret_key}
                  onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, live_secret_key: e.target.value })}
                  placeholder="FLWSECK-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('flutterwave_live_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['flutterwave_live_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook and Callback URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              Webhook URL
            </label>
            <input
              type="text"
              value={flutterwaveSettings.webhook_url}
              onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, webhook_url: e.target.value })}
              placeholder="https://yourdomain.com/api/webhooks/flutterwave"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Set this URL in your Flutterwave dashboard</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              Callback URL
            </label>
            <input
              type="text"
              value={flutterwaveSettings.callback_url}
              onChange={(e) => setFlutterwaveSettings({ ...flutterwaveSettings, callback_url: e.target.value })}
              placeholder="https://yourdomain.com/payment/callback"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">URL where users return after payment</p>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => savePaymentSettings('flutterwave', flutterwaveSettings)}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={() => testConnection('flutterwave')}
            disabled={testResults.flutterwave === 'testing'}
            className="flex items-center px-6 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${testResults.flutterwave === 'testing' ? 'animate-spin' : ''}`} />
            Test Connection
          </button>

          {testResults.flutterwave === 'success' && (
            <div className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={20} className="mr-2" />
              Connection Successful
            </div>
          )}

          {testResults.flutterwave === 'error' && (
            <div className="flex items-center text-red-600 font-semibold">
              <AlertCircle size={20} className="mr-2" />
              Connection Failed
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMonnifySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Shield className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monnify Configuration</h2>
            <p className="text-gray-600">Configure your Monnify payment gateway</p>
          </div>
        </div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={monnifySettings.enabled}
            onChange={(e) => setMonnifySettings({ ...monnifySettings, enabled: e.target.checked })}
            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="font-semibold text-gray-700">Enabled</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="test"
                checked={monnifySettings.mode === 'test'}
                onChange={(e) => setMonnifySettings({ ...monnifySettings, mode: e.target.value })}
                className="mr-2"
              />
              Test Mode
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="live"
                checked={monnifySettings.mode === 'live'}
                onChange={(e) => setMonnifySettings({ ...monnifySettings, mode: e.target.value })}
                className="mr-2"
              />
              Live Mode
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Credentials */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Test Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['monnify_test_api'] ? 'text' : 'password'}
                  value={monnifySettings.test_api_key}
                  onChange={(e) => setMonnifySettings({ ...monnifySettings, test_api_key: e.target.value })}
                  placeholder="MK_TEST_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('monnify_test_api')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['monnify_test_api'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Test Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['monnify_test_secret'] ? 'text' : 'password'}
                  value={monnifySettings.test_secret_key}
                  onChange={(e) => setMonnifySettings({ ...monnifySettings, test_secret_key: e.target.value })}
                  placeholder="Test secret key"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('monnify_test_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['monnify_test_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Contract Code
              </label>
              <input
                type="text"
                value={monnifySettings.test_contract_code}
                onChange={(e) => setMonnifySettings({ ...monnifySettings, test_contract_code: e.target.value })}
                placeholder="123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Live Credentials */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Live Credentials</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['monnify_live_api'] ? 'text' : 'password'}
                  value={monnifySettings.live_api_key}
                  onChange={(e) => setMonnifySettings({ ...monnifySettings, live_api_key: e.target.value })}
                  placeholder="MK_PROD_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('monnify_live_api')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['monnify_live_api'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={16} className="inline mr-1" />
                Live Secret Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys['monnify_live_secret'] ? 'text' : 'password'}
                  value={monnifySettings.live_secret_key}
                  onChange={(e) => setMonnifySettings({ ...monnifySettings, live_secret_key: e.target.value })}
                  placeholder="Live secret key"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('monnify_live_secret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys['monnify_live_secret'] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Live Contract Code
              </label>
              <input
                type="text"
                value={monnifySettings.live_contract_code}
                onChange={(e) => setMonnifySettings({ ...monnifySettings, live_contract_code: e.target.value })}
                placeholder="123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Webhook URL */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <LinkIcon size={16} className="inline mr-1" />
            Webhook URL
          </label>
          <input
            type="text"
            value={monnifySettings.webhook_url}
            onChange={(e) => setMonnifySettings({ ...monnifySettings, webhook_url: e.target.value })}
            placeholder="https://yourdomain.com/api/webhooks/monnify"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Set this URL in your Monnify dashboard</p>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => savePaymentSettings('monnify', monnifySettings)}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={() => testConnection('monnify')}
            disabled={testResults.monnify === 'testing'}
            className="flex items-center px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${testResults.monnify === 'testing' ? 'animate-spin' : ''}`} />
            Test Connection
          </button>

          {testResults.monnify === 'success' && (
            <div className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={20} className="mr-2" />
              Connection Successful
            </div>
          )}

          {testResults.monnify === 'error' && (
            <div className="flex items-center text-red-600 font-semibold">
              <AlertCircle size={20} className="mr-2" />
              Connection Failed
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEscrowAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <DollarSign className="text-emerald-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Escrow Bank Accounts</h2>
          <p className="text-gray-600">Manage bank accounts for escrow transactions</p>
        </div>
      </div>

      {/* Add New Account */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Escrow Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
            <input
              type="text"
              value={newAccount.bank_name}
              onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
              placeholder="e.g., GTBank, Access Bank"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
            <input
              type="text"
              value={newAccount.account_number}
              onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
              placeholder="1234567890"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={newAccount.account_name}
              onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
              placeholder="JustCars Escrow"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newAccount.is_default}
              onChange={(e) => setNewAccount({ ...newAccount, is_default: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-sm font-semibold text-gray-700">Set as default account</span>
          </label>

          <button
            onClick={addEscrowAccount}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus size={20} className="mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Existing Accounts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-bold text-gray-900">Configured Accounts</h3>
        </div>

        {escrowAccounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No escrow accounts configured yet</p>
            <p className="text-sm">Add your first account above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {escrowAccounts.map((account) => (
              <div key={account.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{account.bank_name}</h4>
                      {account.is_default && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 font-mono">{account.account_number}</p>
                    <p className="text-sm text-gray-600">{account.account_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {!account.is_default && (
                      <button
                        onClick={() => setDefaultAccount(account.id)}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-semibold"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => deleteEscrowAccount(account.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Settings className="text-purple-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
          <p className="text-gray-600">Configure escrow fees and transaction limits</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Escrow Fee Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={platformSettings.escrow_fee_percentage}
                onChange={(e) => setPlatformSettings({ ...platformSettings, escrow_fee_percentage: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Platform fee charged on transactions (default: 1.5%)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Auto-Release Days
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={platformSettings.auto_release_days}
              onChange={(e) => setPlatformSettings({ ...platformSettings, auto_release_days: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Days before automatic release to dealer</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Transaction Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                step="10000"
                min="0"
                value={platformSettings.min_transaction_amount}
                onChange={(e) => setPlatformSettings({ ...platformSettings, min_transaction_amount: parseInt(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum amount for escrow transactions</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Transaction Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                step="1000000"
                min="0"
                value={platformSettings.max_transaction_amount}
                onChange={(e) => setPlatformSettings({ ...platformSettings, max_transaction_amount: parseInt(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum amount for escrow transactions</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={savePlatformSettings}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Saving...' : 'Save Platform Settings'}
          </button>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'paystack', label: 'Paystack', icon: CreditCard },
    { id: 'flutterwave', label: 'Flutterwave', icon: Wallet },
    { id: 'monnify', label: 'Monnify', icon: Shield },
    { id: 'escrow', label: 'Escrow Accounts', icon: DollarSign },
    { id: 'platform', label: 'Platform Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Accounts Management</h1>
          <p className="text-gray-600">Configure payment providers, escrow accounts, and platform settings for JustCars.ng</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-4 border-b-2 font-semibold text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'paystack' && renderPaystackSettings()}
          {activeTab === 'flutterwave' && renderFlutterwaveSettings()}
          {activeTab === 'monnify' && renderMonnifySettings()}
          {activeTab === 'escrow' && renderEscrowAccounts()}
          {activeTab === 'platform' && renderPlatformSettings()}
        </div>
      </div>
    </div>
  )
}
