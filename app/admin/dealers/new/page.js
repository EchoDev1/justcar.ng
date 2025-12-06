/**
 * Add New Dealer Page
 * Form to create a new dealer
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DealerForm from '@/components/admin/DealerForm'

export default function NewDealerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // Check if email already exists
      const { data: existingDealer } = await supabase
        .from('dealers')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existingDealer) {
        alert(`A dealer with email "${formData.email}" already exists. Please use a different email.`)
        setLoading(false)
        return
      }

      // Add default status for new auth system
      const dealerData = {
        ...formData,
        status: 'pending',
        business_name: formData.name
      }

      const { error } = await supabase
        .from('dealers')
        .insert([dealerData])

      if (error) {
        if (error.code === '23505') {
          throw new Error('A dealer with this email already exists')
        }
        throw error
      }

      alert('Dealer created successfully! Status: Pending. The dealer can register using their email.')
      router.push('/admin/dealers')
      router.refresh()
    } catch (error) {
      console.error('Error creating dealer:', error)
      alert('Error creating dealer: ' + (error.message || 'Unknown error occurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Dealer</h1>
        <p className="text-gray-600 mt-2">Create a new dealer profile</p>
      </div>

      <DealerForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
