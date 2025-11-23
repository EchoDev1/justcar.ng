/**
 * Add New Car Page
 * Form to create a new car listing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CarForm from '@/components/admin/CarForm'

export default function NewCarPage() {
  const router = useRouter()
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDealers()
  }, [])

  const fetchDealers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('dealers')
      .select('id, name')
      .order('name')
    setDealers(data || [])
  }

  const handleSubmit = async ({ formData, images, videoFile }) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Create car record
      const { data: car, error: carError } = await supabase
        .from('cars')
        .insert([{
          dealer_id: formData.dealer_id,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseFloat(formData.price),
          mileage: parseInt(formData.mileage),
          condition: formData.condition,
          body_type: formData.body_type,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          color: formData.color,
          location: formData.location,
          description: formData.description,
          features: formData.features,
          is_verified: formData.is_verified,
          is_featured: formData.is_featured,
          inspection_report: formData.inspection_report
        }])
        .select()
        .single()

      if (carError) throw carError

      // 2. Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          const fileExt = image.file.name.split('.').pop()
          const fileName = `${car.id}/${Date.now()}_${i}.${fileExt}`

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(fileName, image.file)

          if (uploadError) throw uploadError

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(fileName)

          // Insert image record
          await supabase
            .from('car_images')
            .insert([{
              car_id: car.id,
              image_url: publicUrl,
              is_primary: image.is_primary,
              display_order: i
            }])
        }
      }

      // 3. Upload video if exists
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop()
        const fileName = `${car.id}/video_${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('car-videos')
          .upload(fileName, videoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('car-videos')
          .getPublicUrl(fileName)

        await supabase
          .from('car_videos')
          .insert([{
            car_id: car.id,
            video_url: publicUrl
          }])
      }

      alert('Car created successfully!')
      router.push('/admin/cars')
    } catch (error) {
      console.error('Error creating car:', error)
      alert('Error creating car: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
        <p className="text-gray-600 mt-2">Create a new car listing</p>
      </div>

      <CarForm
        dealers={dealers}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
