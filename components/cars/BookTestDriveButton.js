'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, X, Loader2, Check, AlertCircle, MapPin, Clock, Phone, Mail } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

/**
 * Book Test Drive Button Component
 * Allows buyers to schedule test drives
 */
export default function BookTestDriveButton({ car, dealer, variant = 'outline' }) {
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [existingAppointment, setExistingAppointment] = useState(null)
  const [buyer, setBuyer] = useState(null)

  const [formData, setFormData] = useState({
    preferred_date: '',
    preferred_time: '',
    alternate_date: '',
    alternate_time: '',
    location_type: 'dealer',
    location_address: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkExistingAppointment()
    loadBuyerInfo()
  }, [car.id])

  const loadBuyerInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: buyerData } = await supabase
      .from('buyers')
      .select('full_name, phone, email')
      .eq('id', user.id)
      .single()

    if (buyerData) {
      setBuyer(buyerData)
      setFormData(prev => ({
        ...prev,
        contact_name: buyerData.full_name || '',
        contact_phone: buyerData.phone || '',
        contact_email: buyerData.email || ''
      }))
    }
  }

  const checkExistingAppointment = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: appointment } = await supabase
      .from('test_drive_appointments')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('car_id', car.id)
      .in('status', ['pending', 'confirmed'])
      .single()

    setExistingAppointment(appointment)
  }

  const handleOpenModal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/buyer/auth?action=testdrive&carId=${car.id}`)
      return
    }

    // Set minimum date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData(prev => ({
      ...prev,
      preferred_date: tomorrow.toISOString().split('T')[0]
    }))

    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.preferred_date) {
      setError('Please select a preferred date')
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: insertError } = await supabase
        .from('test_drive_appointments')
        .insert({
          buyer_id: user.id,
          dealer_id: dealer.id,
          car_id: car.id,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time || null,
          alternate_date: formData.alternate_date || null,
          alternate_time: formData.alternate_time || null,
          location_type: formData.location_type,
          location_address: formData.location_type !== 'dealer' ? formData.location_address : null,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSuccess(true)
      setExistingAppointment(data)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Error booking test drive:', err)
      setError('Failed to book test drive. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const buttonClasses = {
    primary: 'w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg',
    secondary: 'w-full bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-orange-200',
    outline: 'w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2'
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 17) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  // Show different button if appointment exists
  if (existingAppointment) {
    return (
      <button
        onClick={() => router.push('/buyer/appointments')}
        className={buttonClasses[variant]}
      >
        <Calendar size={20} />
        View Appointment ({existingAppointment.status})
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={buttonClasses[variant]}
      >
        <Calendar size={20} />
        Book Test Drive
      </button>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Book Test Drive</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600">
                  The dealer will confirm your test drive appointment soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Car Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {car.year} {car.make} {car.model}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatNaira(car.price)}
                  </p>
                  <p className="text-sm text-gray-500">at {dealer.name}</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* Preferred Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <select
                      value={formData.preferred_time}
                      onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Any time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alternate Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.alternate_date}
                      onChange={(e) => setFormData({ ...formData, alternate_date: e.target.value })}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Time
                    </label>
                    <select
                      value={formData.alternate_time}
                      onChange={(e) => setFormData({ ...formData, alternate_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Any time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Drive Location
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { value: 'dealer', label: 'Dealer Location' },
                      { value: 'buyer_location', label: 'My Location' },
                      { value: 'neutral', label: 'Neutral Location' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, location_type: option.value })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium ${
                          formData.location_type === option.value
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formData.location_type !== 'dealer' && (
                    <input
                      type="text"
                      value={formData.location_address}
                      onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                      placeholder="Enter address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">Your Contact Information</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Calendar size={18} />
                        Request Test Drive
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
