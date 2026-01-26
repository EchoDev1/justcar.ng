'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Car,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Eye,
  Loader2,
  Settings,
  Mail,
  MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ALERT_TYPES = {
  low_stock: { label: 'Low Stock Alert', icon: AlertTriangle, color: 'text-orange-600 bg-orange-100' },
  price_drop: { label: 'Price Drop Reminder', icon: TrendingDown, color: 'text-red-600 bg-red-100' },
  listing_expiry: { label: 'Listing Expiry', icon: Calendar, color: 'text-yellow-600 bg-yellow-100' },
  no_views: { label: 'Low Views Alert', icon: Eye, color: 'text-purple-600 bg-purple-100' },
  inquiry_reminder: { label: 'Unanswered Inquiry', icon: MessageSquare, color: 'text-blue-600 bg-blue-100' }
}

export default function InventoryAlertsPage() {
  const [loading, setLoading] = useState(true)
  const [dealer, setDealer] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [settings, setSettings] = useState({
    low_stock_threshold: 5,
    days_before_expiry: 7,
    low_views_threshold: 10,
    inquiry_reminder_hours: 24,
    email_notifications: true,
    push_notifications: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDealerAndAlerts()
  }, [])

  const fetchDealerAndAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dealer/me')
      if (!response.ok) throw new Error('Not authenticated')
      const { dealer: dealerData } = await response.json()
      setDealer(dealerData)

      const supabase = createClient()

      // Fetch dealer's inventory stats
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id, title, views, created_at, status, price')
        .eq('dealer_id', dealerData.id)

      if (carsError && carsError.code !== 'PGRST116') {
        console.error('Error fetching cars:', carsError)
      }

      // Fetch unanswered inquiries
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('car_inquiries')
        .select('id, car_id, created_at')
        .eq('dealer_id', dealerData.id)
        .eq('status', 'new')

      // Generate active alerts based on inventory
      const generatedAlerts = []
      const inventory = cars || []
      const activeInventory = inventory.filter(c => c.status === 'active')

      // Low stock alert
      if (activeInventory.length <= settings.low_stock_threshold) {
        generatedAlerts.push({
          id: 'low_stock',
          type: 'low_stock',
          title: 'Low Inventory Alert',
          message: `You only have ${activeInventory.length} active listings. Consider adding more vehicles.`,
          priority: 'high',
          created_at: new Date().toISOString()
        })
      }

      // Low views alerts
      inventory.forEach(car => {
        if (car.views < settings.low_views_threshold && car.status === 'active') {
          const daysSinceCreated = Math.floor((new Date() - new Date(car.created_at)) / (1000 * 60 * 60 * 24))
          if (daysSinceCreated > 7) {
            generatedAlerts.push({
              id: `low_views_${car.id}`,
              type: 'no_views',
              title: 'Low Views on Listing',
              message: `"${car.title}" has only ${car.views} views in ${daysSinceCreated} days. Consider updating the listing.`,
              priority: 'medium',
              car_id: car.id,
              created_at: new Date().toISOString()
            })
          }
        }
      })

      // Unanswered inquiries
      const pendingInquiries = inquiries || []
      pendingInquiries.forEach(inquiry => {
        const hoursSinceCreated = Math.floor((new Date() - new Date(inquiry.created_at)) / (1000 * 60 * 60))
        if (hoursSinceCreated >= settings.inquiry_reminder_hours) {
          generatedAlerts.push({
            id: `inquiry_${inquiry.id}`,
            type: 'inquiry_reminder',
            title: 'Unanswered Inquiry',
            message: `You have an inquiry waiting for ${hoursSinceCreated} hours. Quick responses improve conversions!`,
            priority: 'high',
            inquiry_id: inquiry.id,
            created_at: inquiry.created_at
          })
        }
      })

      setActiveAlerts(generatedAlerts)

      // Fetch saved alert preferences
      const { data: savedSettings } = await supabase
        .from('dealer_alert_settings')
        .select('*')
        .eq('dealer_id', dealerData.id)
        .single()

      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings.settings }))
      }

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('dealer_alert_settings')
        .upsert({
          dealer_id: dealer.id,
          settings: settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'dealer_id' })

      if (error) throw error

      setShowModal(false)
      fetchDealerAndAlerts()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const dismissAlert = (alertId) => {
    setActiveAlerts(activeAlerts.filter(a => a.id !== alertId))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      default: return 'border-l-blue-500 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-7 sm:w-8 h-7 sm:h-8 text-blue-600 flex-shrink-0" />
            Inventory Alerts
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Stay on top of your inventory with smart alerts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full sm:w-auto justify-center"
        >
          <Settings className="w-5 h-5" />
          Alert Settings
        </button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{activeAlerts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {activeAlerts.filter(a => a.priority === 'high').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Notifications</p>
              <p className="text-3xl font-bold text-green-600">
                {settings.email_notifications ? 'On' : 'Off'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Types Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Alert Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(ALERT_TYPES).map(([key, value]) => {
            const Icon = value.icon
            const count = activeAlerts.filter(a => a.type === key).length
            return (
              <div key={key} className="text-center">
                <div className={`inline-flex p-3 rounded-lg ${value.color} mb-2`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">{value.label}</p>
                <p className="text-lg font-bold text-gray-700">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>

        {activeAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">
              No active alerts. Your inventory is in good shape.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const alertType = ALERT_TYPES[alert.type]
            const Icon = alertType?.icon || Bell
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${alertType?.color || 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Customize your alert thresholds</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={settings.low_stock_threshold}
                  onChange={(e) => setSettings({ ...settings, low_stock_threshold: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when inventory drops below this number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Before Expiry Warning
                </label>
                <input
                  type="number"
                  value={settings.days_before_expiry}
                  onChange={(e) => setSettings({ ...settings, days_before_expiry: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Views Threshold
                </label>
                <input
                  type="number"
                  value={settings.low_views_threshold}
                  onChange={(e) => setSettings({ ...settings, low_views_threshold: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when listing views are below this after 7 days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Reminder (hours)
                </label>
                <input
                  type="number"
                  value={settings.inquiry_reminder_hours}
                  onChange={(e) => setSettings({ ...settings, inquiry_reminder_hours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Notification Channels</h4>
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.push_notifications}
                    onChange={(e) => setSettings({ ...settings, push_notifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Push Notifications</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
