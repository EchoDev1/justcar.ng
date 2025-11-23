/**
 * Dealer Form Component for Admin
 * Create and edit dealer profiles
 */

'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { NIGERIAN_STATES } from '@/lib/utils'

export default function DealerForm({ initialData, onSubmit, loading }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    address: '',
    is_verified: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Dealer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Dealer Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Premium Motors Ltd"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="dealer@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            required
          />

          <Input
            label="WhatsApp Number"
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            required
          />

          <Select
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            options={NIGERIAN_STATES}
            placeholder="Select location"
            required
          />

          <div className="md:col-span-2">
            <Input
              label="Address"
              type="textarea"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address of the dealership..."
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_verified"
            checked={formData.is_verified}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Verified Dealer</span>
            <p className="text-xs text-gray-500">Mark this dealer as verified and trusted</p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Dealer' : 'Create Dealer'}
        </Button>
      </div>
    </form>
  )
}
