/**
 * Edit Dealer Page
 * Form to edit an existing dealer
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DealerForm from '@/components/admin/DealerForm'

export default function EditDealerPage() {
  const router = useRouter()
  const params = useParams()
  const dealerId = params.id

  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {
    fetchDealer()
  }, [dealerId])

  const fetchDealer = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .single()

      if (error) {
        console.error('Error fetching dealer:', error)
        alert('Error loading dealer data')
        router.push('/admin/dealers')
        return
      }

      setDealer(data)
    } catch (error) {
      console.error('Error fetching dealer:', error)
      alert('Error loading data')
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (formData) => {
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('dealers')
        .update(formData)
        .eq('id', dealerId)

      if (error) throw error

      alert('Dealer updated successfully!')
      router.push('/admin/dealers')
    } catch (error) {
      console.error('Error updating dealer:', error)
      alert('Error updating dealer: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dealer data...</p>
        </div>
      </div>
    )
  }

  if (!dealer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Dealer not found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Dealer</h1>
        <p className="text-gray-600 mt-2">Update dealer profile details</p>
      </div>

      <DealerForm
        onSubmit={handleSubmit}
        loading={loading}
        initialData={dealer}
        isEdit={true}
      />
    </div>
  )
}
