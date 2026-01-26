'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Pause,
  Play,
  Car,
  Filter,
  Mail,
  Smartphone,
  BellRing,
  ChevronLeft,
  X,
  Check,
  AlertCircle
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

// Car makes for dropdown
const CAR_MAKES = [
  'Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Nissan',
  'Hyundai', 'Kia', 'Volkswagen', 'Audi', 'Land Rover', 'Porsche',
  'Jeep', 'Mazda', 'Chevrolet', 'Peugeot', 'Mitsubishi', 'Infiniti'
]

const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Wagon']
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const TRANSMISSIONS = ['Automatic', 'Manual']
const CONDITIONS = ['Brand New', 'Foreign Used', 'Nigerian Used']
const LOCATIONS = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Kaduna', 'Enugu', 'Benin City']

export default function BuyerAlerts() {
  const [alerts, setAlerts] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState(null)
  const [activeTab, setActiveTab] = useState('alerts') // 'alerts' or 'matches'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()
  const router = useRouter()

  // Form state for creating/editing alerts
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    min_year: '',
    max_year: '',
    min_price: '',
    max_price: '',
    body_type: '',
    fuel_type: '',
    transmission: '',
    location: '',
    condition: '',
    notify_email: true,
    notify_push: true,
    notify_in_app: true,
    frequency: 'instant'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      // Load alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('buyer_car_alerts')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (alertsError) throw alertsError
      setAlerts(alertsData || [])

      // Load recent matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('buyer_alert_matches')
        .select(`
          *,
          alert:buyer_car_alerts(name),
          car:cars(
            *,
            dealer:dealers(name),
            car_images(image_url, is_primary)
          )
        `)
        .eq('buyer_id', user.id)
        .order('matched_at', { ascending: false })
        .limit(20)

      if (matchesError) throw matchesError
      setMatches(matchesData || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
      setError('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Build criteria JSON
      const criteria = {}
      if (formData.make) criteria.make = formData.make
      if (formData.model) criteria.model = formData.model
      if (formData.min_year) criteria.min_year = parseInt(formData.min_year)
      if (formData.max_year) criteria.max_year = parseInt(formData.max_year)
      if (formData.min_price) criteria.min_price = parseFloat(formData.min_price)
      if (formData.max_price) criteria.max_price = parseFloat(formData.max_price)
      if (formData.body_type) criteria.body_type = formData.body_type
      if (formData.fuel_type) criteria.fuel_type = formData.fuel_type
      if (formData.transmission) criteria.transmission = formData.transmission
      if (formData.location) criteria.location = formData.location
      if (formData.condition) criteria.condition = formData.condition

      const alertData = {
        buyer_id: user.id,
        name: formData.name || 'My Alert',
        criteria,
        make: formData.make || null,
        model: formData.model || null,
        min_year: formData.min_year ? parseInt(formData.min_year) : null,
        max_year: formData.max_year ? parseInt(formData.max_year) : null,
        min_price: formData.min_price ? parseFloat(formData.min_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        body_type: formData.body_type || null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        location: formData.location || null,
        condition: formData.condition || null,
        notify_email: formData.notify_email,
        notify_push: formData.notify_push,
        notify_in_app: formData.notify_in_app,
        frequency: formData.frequency
      }

      if (editingAlert) {
        const { error } = await supabase
          .from('buyer_car_alerts')
          .update(alertData)
          .eq('id', editingAlert.id)

        if (error) throw error
        setSuccess('Alert updated successfully!')
      } else {
        const { error } = await supabase
          .from('buyer_car_alerts')
          .insert(alertData)

        if (error) throw error
        setSuccess('Alert created successfully!')
      }

      setShowCreateModal(false)
      setEditingAlert(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving alert:', error)
      setError('Failed to save alert')
    }
  }

  const handleDeleteAlert = async (alertId) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const { error } = await supabase
        .from('buyer_car_alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error
      setSuccess('Alert deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting alert:', error)
      setError('Failed to delete alert')
    }
  }

  const handleTogglePause = async (alert) => {
    try {
      const { error } = await supabase
        .from('buyer_car_alerts')
        .update({ is_paused: !alert.is_paused })
        .eq('id', alert.id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const handleEditAlert = (alert) => {
    setFormData({
      name: alert.name || '',
      make: alert.make || '',
      model: alert.model || '',
      min_year: alert.min_year?.toString() || '',
      max_year: alert.max_year?.toString() || '',
      min_price: alert.min_price?.toString() || '',
      max_price: alert.max_price?.toString() || '',
      body_type: alert.body_type || '',
      fuel_type: alert.fuel_type || '',
      transmission: alert.transmission || '',
      location: alert.location || '',
      condition: alert.condition || '',
      notify_email: alert.notify_email ?? true,
      notify_push: alert.notify_push ?? true,
      notify_in_app: alert.notify_in_app ?? true,
      frequency: alert.frequency || 'instant'
    })
    setEditingAlert(alert)
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      min_year: '',
      max_year: '',
      min_price: '',
      max_price: '',
      body_type: '',
      fuel_type: '',
      transmission: '',
      location: '',
      condition: '',
      notify_email: true,
      notify_push: true,
      notify_in_app: true,
      frequency: 'instant'
    })
  }

  const markMatchAsViewed = async (matchId) => {
    try {
      await supabase
        .from('buyer_alert_matches')
        .update({ is_viewed: true, viewed_at: new Date().toISOString() })
        .eq('id', matchId)
    } catch (error) {
      console.error('Error marking as viewed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/buyer" className="text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Bell size={32} />
                <span>Car Alerts</span>
              </h1>
              <p className="text-white/80 mt-1">Get notified when cars matching your criteria are listed</p>
            </div>
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
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Recent Matches ({matches.filter(m => !m.is_viewed).length} new)
          </button>
        </div>

        {/* Create Alert Button */}
        {activeTab === 'alerts' && (
          <button
            onClick={() => {
              resetForm()
              setEditingAlert(null)
              setShowCreateModal(true)
            }}
            className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg"
          >
            <Plus size={20} />
            <span>Create New Alert</span>
          </button>
        )}

        {/* Alerts Tab Content */}
        {activeTab === 'alerts' && (
          <div className="grid gap-4">
            {alerts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Bell className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create an alert to get notified when cars matching your criteria are listed.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Create Your First Alert
                </button>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl shadow-lg p-6 ${alert.is_paused ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{alert.name}</h3>
                        {alert.is_paused && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            Paused
                          </span>
                        )}
                      </div>

                      {/* Criteria Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {alert.make && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {alert.make}
                          </span>
                        )}
                        {alert.model && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {alert.model}
                          </span>
                        )}
                        {(alert.min_year || alert.max_year) && (
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {alert.min_year || 'Any'} - {alert.max_year || 'Any'}
                          </span>
                        )}
                        {(alert.min_price || alert.max_price) && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {alert.min_price ? formatNaira(alert.min_price) : 'Any'} - {alert.max_price ? formatNaira(alert.max_price) : 'Any'}
                          </span>
                        )}
                        {alert.body_type && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                            {alert.body_type}
                          </span>
                        )}
                        {alert.location && (
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {alert.location}
                          </span>
                        )}
                      </div>

                      {/* Notification Methods */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {alert.notify_email && (
                          <span className="flex items-center space-x-1">
                            <Mail size={16} />
                            <span>Email</span>
                          </span>
                        )}
                        {alert.notify_push && (
                          <span className="flex items-center space-x-1">
                            <BellRing size={16} />
                            <span>Push</span>
                          </span>
                        )}
                        <span className="text-gray-400">|</span>
                        <span>{alert.frequency} notifications</span>
                        <span className="text-gray-400">|</span>
                        <span>{alert.matches_found} matches found</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePause(alert)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title={alert.is_paused ? 'Resume' : 'Pause'}
                      >
                        {alert.is_paused ? <Play size={20} /> : <Pause size={20} />}
                      </button>
                      <button
                        onClick={() => handleEditAlert(alert)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Matches Tab Content */}
        {activeTab === 'matches' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center">
                <Car className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Yet</h3>
                <p className="text-gray-600">
                  When cars matching your alerts are listed, they'll appear here.
                </p>
              </div>
            ) : (
              matches.map((match) => {
                const car = match.car
                if (!car) return null
                const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
                const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'

                return (
                  <Link
                    key={match.id}
                    href={`/cars/${car.id}`}
                    onClick={() => markMatchAsViewed(match.id)}
                  >
                    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${!match.is_viewed ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="relative h-48">
                        <img
                          src={imageUrl}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                        {!match.is_viewed && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {car.year} {car.make} {car.model}
                        </h3>
                        <p className="text-xl font-bold text-blue-600 mb-2">
                          {formatNaira(car.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Matched: {match.alert?.name || 'Alert'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(match.matched_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlert(null)
                    resetForm()
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-6">
              {/* Alert Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Toyota Camry under 15M"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make
                  </label>
                  <select
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Make</option>
                    {CAR_MAKES.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Any Model"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Year
                  </label>
                  <input
                    type="number"
                    value={formData.min_year}
                    onChange={(e) => setFormData({ ...formData, min_year: e.target.value })}
                    placeholder="e.g., 2018"
                    min="1990"
                    max="2026"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Year
                  </label>
                  <input
                    type="number"
                    value={formData.max_year}
                    onChange={(e) => setFormData({ ...formData, max_year: e.target.value })}
                    placeholder="e.g., 2024"
                    min="1990"
                    max="2026"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                    placeholder="e.g., 5000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    placeholder="e.g., 15000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Body Type & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type
                  </label>
                  <select
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Body Type</option>
                    {BODY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Condition</option>
                    {CONDITIONS.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Location</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Notification Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Methods
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notify_email}
                      onChange={(e) => setFormData({ ...formData, notify_email: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <Mail size={18} />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notify_push}
                      onChange={(e) => setFormData({ ...formData, notify_push: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <BellRing size={18} />
                    <span>Push</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notify_in_app}
                      onChange={(e) => setFormData({ ...formData, notify_in_app: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <Smartphone size={18} />
                    <span>In-App</span>
                  </label>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="instant">Instant (as soon as listed)</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlert(null)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600"
                >
                  {editingAlert ? 'Save Changes' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
