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

      const { error } = await supabase
        .from('dealers')
        .insert([formData])

      if (error) throw error

      alert('Dealer created successfully!')
      router.push('/admin/dealers')
    } catch (error) {
      console.error('Error creating dealer:', error)
      alert('Error creating dealer: ' + error.message)
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
