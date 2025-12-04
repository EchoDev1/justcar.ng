/**
 * Dealer Add New Car Page
 * Allows verified dealers to create car listings
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CarForm from '@/components/admin/CarForm'

export default function DealerNewCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dealer, setDealer] = useState(null)
  const [loadingDealer, setLoadingDealer] = useState(true)

  useEffect(() => {
    checkDealerAuth()
  }, [])

  const checkDealerAuth = async () => {
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
    setLoadingDealer(false)
  }

  const handleSubmit = async ({ formData, images, videoFile }) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Create car record (dealer_id is automatically set to current dealer)
      const carData = {
        dealer_id: dealer.id,
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
        is_verified: false, // Dealers can't verify their own cars
        is_featured: false, // Admin approval needed
        is_premium_verified: false, // Admin approval needed
        is_just_arrived: formData.is_just_arrived || false,
        inspection_report: formData.inspection_report
      }

      // Auto-set just_arrived_date if is_just_arrived is true
      if (formData.is_just_arrived) {
        carData.just_arrived_date = new Date().toISOString()
      }

      const { data: car, error: carError } = await supabase
        .from('cars')
        .insert([carData])
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

      // Success notification with details
      const carType = []
      if (formData.is_just_arrived) carType.push('Just Arrived')
      if (formData.price >= 150000000) carType.push('Luxury')

      const typeText = carType.length > 0 ? ` as ${carType.join(', ')}` : ''

      alert(`✅ Car listing created successfully${typeText}!\n\n` +
            `${formData.year} ${formData.make} ${formData.model}\n` +
            `Price: ₦${parseFloat(formData.price).toLocaleString()}\n\n` +
            `${formData.is_just_arrived ? '🆕 Visible on Just Arrived page & Homepage immediately\n' : ''}` +
            `${formData.price >= 150000000 ? '💎 Visible on Luxury page\n' : ''}` +
            `\nYour listing is now live!`)

      // Redirect to dealer cars page
      router.push('/dealer/cars')
    } catch (error) {
      console.error('Error creating car:', error)
      alert('Error creating car listing: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingDealer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Car Listing</h1>
        <p className="text-gray-600 mt-2">
          Create a new car listing for your dealership.
          {dealer?.is_verified && ' As a verified dealer, your listings get priority visibility!'}
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
              <strong>Mark as "Just Arrived"</strong> to feature your car on the homepage and Just Arrived page immediately!
            </p>
          </div>
        </div>
      </div>

      <CarForm
        dealers={[dealer]}
        onSubmit={handleSubmit}
        loading={loading}
        isDealerMode={true}
        currentDealer={dealer}
      />
    </div>
  )
}
