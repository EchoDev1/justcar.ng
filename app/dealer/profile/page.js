/**
 * Dealer Profile & Settings
 * Manage dealer profile and account settings
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User, Mail, Phone, MapPin, Building, Save, Camera,
  Shield, Bell, Lock, Star, Crown
} from 'lucide-react'

export default function DealerProfilePage() {
  const router = useRouter()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    address: '',
    description: ''
  })

  useEffect(() => {
    loadDealerData()
  }, [])

  const loadDealerData = async () => {
    try {
      // OPTIMIZED: Use custom dealer auth API
      const response = await fetch('/api/dealer/me', {
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/dealer/login')
        return
      }

      const { dealer: dealerData } = await response.json()
      if (!dealerData) {
        router.push('/dealer/login')
        return
      }

      setDealer(dealerData)
      setFormData({
        name: dealerData.name || '',
        email: dealerData.email || '',
        phone: dealerData.phone || '',
        whatsapp: dealerData.whatsapp || '',
        location: dealerData.location || '',
        address: dealerData.address || '',
        description: dealerData.description || ''
      })

      setLoading(false)

    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('dealers')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          location: formData.location,
          address: formData.address,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealer.id)

      if (error) throw error

      alert('Profile updated successfully!')
      await loadDealerData()

    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getTierBadge = () => {
    if (dealer?.subscription_tier === 'luxury') {
      return (
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
          <Crown size={18} className="text-white mr-2" />
          <span className="text-sm font-bold text-white">LUXURY DEALER</span>
        </div>
      )
    } else if (dealer?.subscription_tier === 'premium') {
      return (
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
          <Star size={18} className="text-white mr-2" />
          <span className="text-sm font-bold text-white">PREMIUM DEALER</span>
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center px-4 py-2 bg-gray-600 rounded-full">
          <Shield size={18} className="text-white mr-2" />
          <span className="text-sm font-bold text-white">VERIFIED DEALER</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <User className="mr-3 text-blue-600" size={40} />
          Profile & Settings
        </h1>
        <p className="text-gray-600">Manage your dealership profile</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Account Settings
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Profile Header */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {dealer?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{dealer?.name}</h2>
              {getTierBadge()}
              <button className="mt-3 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center">
                <Camera size={16} className="mr-2" />
                Change Profile Picture
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Building size={16} className="inline mr-2" />
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Lagos, Nigeria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Full Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete business address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Tell buyers about your dealership..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Subscription */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Crown className="mr-3 text-yellow-500" size={24} />
              Subscription
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dealer?.subscription_tier === 'luxury' ? 'Luxury Dealer' :
                   dealer?.subscription_tier === 'premium' ? 'Premium Dealer' :
                   'Verified Dealer'}
                </p>
              </div>
              <a href="/dealer/subscription">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold">
                  Manage Subscription
                </button>
              </a>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Bell className="mr-3 text-blue-600" size={24} />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Email Notifications</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-700">New Message Alerts</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Weekly Performance Report</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="mr-3 text-red-600" size={24} />
              Security
            </h3>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
