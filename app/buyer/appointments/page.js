'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Check,
  X,
  AlertCircle,
  Car,
  Phone,
  User
} from 'lucide-react'
import { formatNaira } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Pending Confirmation', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: Check },
  rescheduled: { label: 'Rescheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: Check },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-800', icon: X },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: X },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: Clock }
}

export default function BuyerAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/buyer/auth')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('test_drive_appointments')
        .select(`
          *,
          car:cars(
            id, make, model, year, price,
            car_images(image_url, is_primary)
          ),
          dealer:dealers(id, name, location, phone)
        `)
        .eq('buyer_id', user.id)
        .order('preferred_date', { ascending: true })

      if (fetchError) throw fetchError
      setAppointments(data || [])
    } catch (err) {
      console.error('Error loading appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this test drive?')) return

    try {
      const { error } = await supabase
        .from('test_drive_appointments')
        .update({
          status: 'cancelled',
          cancelled_by: 'buyer',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) throw error
      setSuccess('Appointment cancelled')
      loadAppointments()
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setError('Failed to cancel appointment')
    }
  }

  const upcomingAppointments = appointments.filter(a =>
    ['pending', 'confirmed', 'rescheduled'].includes(a.status) &&
    new Date(a.confirmed_date || a.preferred_date) >= new Date(new Date().setHours(0,0,0,0))
  )

  const pastAppointments = appointments.filter(a =>
    ['completed', 'no_show', 'cancelled', 'expired'].includes(a.status) ||
    new Date(a.confirmed_date || a.preferred_date) < new Date(new Date().setHours(0,0,0,0))
  )

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <Link href="/buyer" className="text-white/80 hover:text-white">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Calendar size={32} />
                <span>Test Drive Appointments</span>
              </h1>
              <p className="text-white/80 mt-1">Manage your scheduled test drives</p>
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
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Past ({pastAppointments.length})
          </button>
        </div>

        {/* Appointments List */}
        {displayAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No Upcoming Test Drives' : 'No Past Appointments'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming'
                ? 'Book a test drive to see a car in person before buying.'
                : 'Your past test drives will appear here.'}
            </p>
            <Link href="/cars">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
                Browse Cars
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppointments.map((appointment) => {
              const car = appointment.car
              if (!car) return null
              const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0]
              const imageUrl = primaryImage?.image_url || '/images/placeholder-car.jpg'
              const statusConfig = STATUS_CONFIG[appointment.status]
              const StatusIcon = statusConfig?.icon || Clock
              const appointmentDate = appointment.confirmed_date || appointment.preferred_date

              return (
                <div key={appointment.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Car Image */}
                    <Link href={`/cars/${car.id}`} className="md:w-64 shrink-0">
                      <div className="relative h-48 md:h-full">
                        <Image
                          src={imageUrl}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Appointment Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link href={`/cars/${car.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                              {car.year} {car.make} {car.model}
                            </h3>
                          </Link>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatNaira(car.price)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig?.color}`}>
                          <StatusIcon size={14} />
                          {statusConfig?.label}
                        </span>
                      </div>

                      {/* Date/Time/Location */}
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={18} className="text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">{formatDate(appointmentDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={18} className="text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="font-medium">
                              {appointment.confirmed_time || appointment.preferred_time || 'To be confirmed'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={18} className="text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium capitalize">
                              {appointment.location_type === 'dealer'
                                ? appointment.dealer?.location || 'Dealer Location'
                                : appointment.location_address || 'TBD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dealer Info */}
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User size={18} className="text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">{appointment.dealer?.name}</p>
                              <p className="text-sm text-gray-500">{appointment.dealer?.location}</p>
                            </div>
                          </div>
                          {appointment.dealer?.phone && (
                            <a
                              href={`tel:${appointment.dealer.phone}`}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                              <Phone size={18} />
                              <span className="text-sm">{appointment.dealer.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Requested on {new Date(appointment.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          {['pending', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          <Link href={`/cars/${car.id}`}>
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                              View Car
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
