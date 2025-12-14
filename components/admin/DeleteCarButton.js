/**
 * Delete Car Button Component
 * Allows admin to delete cars with confirmation
 */

'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteCarButton({ carId, carName }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${carName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Delete car images first (cascade should handle this, but being explicit)
      await supabase
        .from('car_images')
        .delete()
        .eq('car_id', carId)

      // Delete car videos
      await supabase
        .from('car_videos')
        .delete()
        .eq('car_id', carId)

      // Delete the car
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting car:', error)
      alert('Failed to delete car. It may have related data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Car"
    >
      {loading ? (
        <div className="w-[18px] h-[18px] border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  )
}
