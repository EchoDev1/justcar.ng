/**
 * Dealer Edit Car Page
 * Edit existing car listing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CarForm from '@/components/admin/CarForm'

export default function DealerEditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.id

  const [car, setCar] = useState(null)
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  useEffect(() => {
    fetchData()
  }, [carId])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/dealer/login')
        return
      }

      // Get dealer profile
      const { data: dealerData } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!dealerData) {
        alert('Dealer profile not found')
        router.push('/')
        return
      }

      setDealer(dealerData)

      // Fetch car data (ensure it belongs to this dealer)
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (id, image_url, is_primary, display_order),
          car_videos (id, video_url)
        `)
        .eq('id', carId)
        .eq('dealer_id', dealerData.id)
        .single()

      if (carError || !carData) {
        alert('Car not found or you don\'t have permission to edit it')
        router.push('/dealer/cars')
        return
      }

      setCar(carData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error loading data')
      router.push('/dealer/cars')
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
        is_just_arrived: formData.is_just_arrived || false,
        inspection_report: formData.inspection_report
        // Note: Dealers cannot set is_verified, is_featured, is_premium_verified
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
        .eq('dealer_id', dealer.id) // Security: ensure car belongs to dealer

      if (carError) throw carError

      // 2. Delete removed images
      if (deletedImageIds && deletedImageIds.length > 0) {
        for (const imageId of deletedImageIds) {
          await supabase
            .from('car_images')
            .delete()
            .eq('id', imageId)
        }
      }

      // 3. Upload new images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i]

          // Skip if this is an existing image
          if (image.id) continue

          const fileExt = image.file.name.split('.').pop()
          const fileName = `${carId}/${Date.now()}_${i}.${fileExt}`

          // Upload to storage
          const { error: uploadError } = await supabase.storage
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
              display_order: i
            }])
        }
      }

      // 4. Upload video if new one provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop()
        const fileName = `${carId}/video_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
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

      // Success notification
      const carType = []
      if (formData.is_just_arrived) carType.push('Just Arrived')
      if (formData.price >= 150000000) carType.push('Luxury')

      const typeText = carType.length > 0 ? ` as ${carType.join(', ')}` : ''

      alert(`✅ Car listing updated successfully${typeText}!\n\n` +
            `${formData.year} ${formData.make} ${formData.model}\n` +
            `Price: ₦${parseFloat(formData.price).toLocaleString()}\n\n` +
            `${formData.is_just_arrived ? '🆕 Visible on Just Arrived page & Homepage\n' : ''}` +
            `${formData.price >= 150000000 ? '💎 Visible on Luxury page\n' : ''}` +
            `\nUpdates are live now!`)

      router.push('/dealer/cars')
    } catch (error) {
      console.error('Error updating car:', error)
      alert('Error updating car listing: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading car data...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Car not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Car Listing</h1>
        <p className="text-gray-600 mt-2">
          Update your car listing details
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Mark as "Just Arrived"</strong> to feature your car on the homepage and Just Arrived page!
            </p>
          </div>
        </div>
      </div>

      <CarForm
        dealers={[dealer]}
        car={car}
        onSubmit={handleSubmit}
        loading={loading}
        isDealerMode={true}
        currentDealer={dealer}
      />
    </div>
  )
}
