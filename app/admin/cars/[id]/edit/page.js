/**
 * Edit Car Page
 * Form to edit an existing car listing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CarForm from '@/components/admin/CarForm'

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.id

  const [car, setCar] = useState(null)
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {
    fetchData()
  }, [carId])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch dealers
      const { data: dealersData } = await supabase
        .from('dealers')
        .select('id, name')
        .order('name')
      setDealers(dealersData || [])

      // Fetch car data
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (id, image_url, is_primary, display_order),
          car_videos (id, video_url)
        `)
        .eq('id', carId)
        .single()

      if (carError) {
        console.error('Error fetching car:', carError)
        alert('Error loading car data')
        router.push('/admin/cars')
        return
      }

      setCar(carData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error loading data')
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async ({ formData, images, videoFile, deletedImageIds }) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Update car record
      const updateData = {
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
        is_premium_verified: formData.is_premium_verified,
        is_just_arrived: formData.is_just_arrived,
        inspection_report: formData.inspection_report
      }

      // Auto-set just_arrived_date if is_just_arrived is newly set to true
      if (formData.is_just_arrived && !car.is_just_arrived) {
        updateData.just_arrived_date = new Date().toISOString()
      } else if (!formData.is_just_arrived) {
        // Clear just_arrived_date if is_just_arrived is set to false
        updateData.just_arrived_date = null
      }

      const { error: carError } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)

      if (carError) throw carError

      // 2. Delete removed images
      if (deletedImageIds && deletedImageIds.length > 0) {
        for (const imageId of deletedImageIds) {
          // Delete from database
          await supabase
            .from('car_images')
            .delete()
            .eq('id', imageId)
        }
      }

      // 3. Upload new images
      if (images.length > 0) {
        const existingImagesCount = car.car_images?.length || 0

        for (let i = 0; i < images.length; i++) {
          const image = images[i]

          // Skip if this is an existing image (has an id)
          if (image.id) continue

          const fileExt = image.file.name.split('.').pop()
          const fileName = `${carId}/${Date.now()}_${i}.${fileExt}`

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
              car_id: carId,
              image_url: publicUrl,
              is_primary: image.is_primary,
              display_order: existingImagesCount + i
            }])
        }
      }

      // 4. Upload video if new one exists
      if (videoFile) {
        // Delete old video if exists
        if (car.car_videos && car.car_videos.length > 0) {
          await supabase
            .from('car_videos')
            .delete()
            .eq('car_id', carId)
        }

        const fileExt = videoFile.name.split('.').pop()
        const fileName = `${carId}/video_${Date.now()}.${fileExt}`

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
            car_id: carId,
            video_url: publicUrl
          }])
      }

      // Success notification with details
      const carType = []
      if (formData.is_premium_verified) carType.push('Premium Verified')
      if (formData.is_just_arrived) carType.push('Just Arrived')
      if (formData.price >= 150000000) carType.push('Luxury')

      const typeText = carType.length > 0 ? ` as ${carType.join(', ')}` : ''

      alert(`✅ Car updated successfully${typeText}!\n\n` +
            `${formData.year} ${formData.make} ${formData.model}\n` +
            `Price: ₦${parseFloat(formData.price).toLocaleString()}\n\n` +
            `${formData.is_premium_verified ? '⭐ Visible on Premium Verified page\n' : ''}` +
            `${formData.is_just_arrived ? '🆕 Visible on Just Arrived page & Homepage\n' : ''}` +
            `${formData.price >= 150000000 ? '💎 Visible on Luxury page\n' : ''}` +
            `\nUpdates are live now!`)

      // Redirect to the appropriate page based on car type
      if (formData.is_just_arrived) {
        router.push('/admin/just-arrived')
      } else if (formData.is_premium_verified) {
        router.push('/admin/premium-verified')
      } else {
        router.push('/admin/cars')
      }
    } catch (error) {
      console.error('Error updating car:', error)
      alert('Error updating car: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading car data...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Car not found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Car</h1>
        <p className="text-gray-600 mt-2">Update car listing details</p>
      </div>

      <CarForm
        dealers={dealers}
        onSubmit={handleSubmit}
        loading={loading}
        initialData={car}
        isEdit={true}
      />
    </div>
  )
}
