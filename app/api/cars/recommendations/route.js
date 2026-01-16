/**
 * Car Recommendations API
 * GET /api/cars/recommendations
 * Returns personalized car recommendations based on user history
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getPersonalizedRecommendations, sortCarsWithWeights } from '@/lib/recommendations/scoring'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '12')

    const supabase = createAdminClient()

    // Fetch all active cars
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select(`
        *,
        car_images (id, image_url, is_primary),
        dealers (id, name, business_name, is_verified)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(200)

    if (carsError) {
      console.error('Error fetching cars:', carsError)
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 })
    }

    // Get user browsing history if userId or sessionId provided
    let userHistory = {
      viewedMakes: [],
      viewedBodyTypes: [],
      savedCars: [],
      priceRange: {},
      preferredLocations: []
    }

    if (userId || sessionId) {
      // Fetch browsing history
      let historyQuery = supabase
        .from('user_browsing_history')
        .select('car_id, cars(make, body_type, price, location)')
        .order('viewed_at', { ascending: false })
        .limit(50)

      if (userId) {
        historyQuery = historyQuery.eq('user_id', userId)
      } else if (sessionId) {
        historyQuery = historyQuery.eq('session_id', sessionId)
      }

      const { data: history } = await historyQuery

      if (history && history.length > 0) {
        const viewedCars = history.map(h => h.cars).filter(Boolean)
        userHistory.viewedMakes = viewedCars.map(c => c.make).filter(Boolean)
        userHistory.viewedBodyTypes = viewedCars.map(c => c.body_type).filter(Boolean)
        userHistory.preferredLocations = [...new Set(viewedCars.map(c => c.location).filter(Boolean))]

        // Calculate price range
        const prices = viewedCars.map(c => c.price).filter(Boolean)
        if (prices.length > 0) {
          userHistory.priceRange = {
            min: Math.min(...prices) * 0.7,
            max: Math.max(...prices) * 1.3
          }
        }
      }

      // Fetch saved cars
      if (userId) {
        const { data: saved } = await supabase
          .from('buyer_saved_cars')
          .select('cars(make, model, body_type, price)')
          .eq('buyer_id', userId)
          .limit(20)

        if (saved) {
          userHistory.savedCars = saved.map(s => s.cars).filter(Boolean)
        }
      }
    }

    // Get personalized recommendations
    const recommendations = getPersonalizedRecommendations(cars, userHistory, limit)

    // Format response
    const formattedCars = recommendations.map(car => ({
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
      view_count: car.view_count || 0,
      recommendationScore: car.recommendationScore,
      matchReasons: car.matchReasons,
      primaryImage: car.car_images?.find(img => img.is_primary)?.image_url || car.car_images?.[0]?.image_url,
      dealer: car.dealers ? {
        id: car.dealers.id,
        name: car.dealers.business_name || car.dealers.name,
        is_verified: car.dealers.is_verified
      } : null
    }))

    return NextResponse.json({
      success: true,
      recommendations: formattedCars,
      count: formattedCars.length,
      hasUserHistory: userHistory.viewedMakes.length > 0
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
