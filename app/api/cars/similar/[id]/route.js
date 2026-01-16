/**
 * Similar Cars API
 * GET /api/cars/similar/[id]
 * Returns cars similar to the specified car with similarity scores
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getSimilarCars, calculateSimilarityScore } from '@/lib/recommendations/scoring'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    if (!id) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the source car
    const { data: sourceCar, error: sourceError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (sourceError || !sourceCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    // Fetch potential similar cars
    // Start with same make, then expand if needed
    let { data: candidates, error: candidatesError } = await supabase
      .from('cars')
      .select(`
        *,
        car_images (id, image_url, is_primary),
        dealers (id, name, business_name, is_verified)
      `)
      .neq('id', id)
      .eq('status', 'active')
      .limit(100)

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError)
      return NextResponse.json({ error: 'Failed to fetch similar cars' }, { status: 500 })
    }

    // Calculate similarity scores and sort
    const similarCars = getSimilarCars(sourceCar, candidates, limit)

    // Format response
    const formattedCars = similarCars.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      location: car.location,
      condition: car.condition,
      body_type: car.body_type,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      is_verified: car.is_verified,
      is_featured: car.is_featured,
      view_count: car.view_count,
      similarityScore: car.similarityScore,
      matchPercentage: Math.round(car.similarityScore),
      primaryImage: car.car_images?.find(img => img.is_primary)?.image_url || car.car_images?.[0]?.image_url,
      dealer: car.dealers ? {
        id: car.dealers.id,
        name: car.dealers.business_name || car.dealers.name,
        is_verified: car.dealers.is_verified
      } : null
    }))

    return NextResponse.json({
      success: true,
      sourceCar: {
        id: sourceCar.id,
        make: sourceCar.make,
        model: sourceCar.model,
        year: sourceCar.year,
        price: sourceCar.price
      },
      similarCars: formattedCars,
      count: formattedCars.length
    })

  } catch (error) {
    console.error('Similar cars API error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
