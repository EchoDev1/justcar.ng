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

      // Get image paths to delete from storage
      const { data: images } = await supabase
        .from('car_images')
        .select('image_url')
        .eq('car_id', carId)

      // Get video paths to delete from storage
      const { data: videos } = await supabase
        .from('car_videos')
        .select('video_url')
        .eq('car_id', carId)

      // Delete images from storage
      if (images && images.length > 0) {
        const imagePaths = images
          .map(img => {
            const url = img.image_url
            const match = url.match(/car-images\/(.+)$/)
            return match ? match[1] : null
          })
          .filter(Boolean)

        if (imagePaths.length > 0) {
          await supabase.storage.from('car-images').remove(imagePaths)
        }
      }

      // Delete videos from storage
      if (videos && videos.length > 0) {
        const videoPaths = videos
          .map(vid => {
            const url = vid.video_url
            const match = url.match(/car-videos\/(.+)$/)
            return match ? match[1] : null
          })
          .filter(Boolean)

        if (videoPaths.length > 0) {
          await supabase.storage.from('car-videos').remove(videoPaths)
        }
      }

      // Delete car images from database
      await supabase
        .from('car_images')
        .delete()
        .eq('car_id', carId)

      // Delete car videos from database
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
