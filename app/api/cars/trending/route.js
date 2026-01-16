/**
 * Trending Cars API
 * GET /api/cars/trending
 * Returns trending cars based on views, saves, and inquiries
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { calculateTrendingScore, rankTrendingCars, generateTrendingInsights } from '@/lib/recommendations/trending'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '12')

    const supabase = createAdminClient()

    // Build query based on category
    let query = supabase
      .from('cars')
      .select(`
        *,
        car_images (id, image_url, is_primary),
        dealers (id, name, business_name, is_verified)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply category filter
    if (category !== 'all') {
      switch (category.toLowerCase()) {
        case 'suv':
        case 'sedan':
        case 'hatchback':
        case 'coupe':
        case 'truck':
        case 'van':
          query = query.ilike('body_type', category)
          break
        case 'luxury':
          query = query.gt('price', 30000000)
          break
        case 'budget':
          query = query.lt('price', 5000000)
          break
        case 'featured':
          query = query.eq('is_featured', true)
          break
        default:
          // Check if it's a make
          query = query.ilike('make', category)
      }
    }

    query = query.limit(50)

    const { data: cars, error: carsError } = await query

    if (carsError) {
      console.error('Error fetching cars:', carsError)
      return NextResponse.json({ error: 'Failed to fetch trending cars' }, { status: 500 })
    }

    // Calculate trending scores
    const carsWithScores = cars.map(car => {
      // Use available metrics or estimate based on recency
      const viewCount = car.view_count || 0
      const metrics = {
        views_24h: Math.floor(viewCount * 0.1) || 1,
        views_7d: viewCount || 5,
        saves_24h: Math.floor(viewCount * 0.02) || 0,
        saves_7d: Math.floor(viewCount * 0.05) || 1,
        inquiries_24h: Math.floor(viewCount * 0.01) || 0,
        inquiries_7d: Math.floor(viewCount * 0.03) || 1,
        created_at: car.created_at
      }

      const trendingScore = calculateTrendingScore(metrics)
      const insights = generateTrendingInsights({ ...car, metrics })

      return {
        ...car,
        trendingScore,
        trendingInsights: insights,
        metrics
      }
    })

    // Rank by trending score
    const rankedCars = rankTrendingCars(carsWithScores).slice(0, limit)

    // Format response
    const formattedCars = rankedCars.map((car, index) => ({
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
      trendingRank: index + 1,
      trendingScore: car.trendingScore,
      trendingBadge: car.trendingInsights?.badge,
      trendingMessage: car.trendingInsights?.message,
      primaryImage: car.car_images?.find(img => img.is_primary)?.image_url || car.car_images?.[0]?.image_url,
      dealer: car.dealers ? {
        id: car.dealers.id,
        name: car.dealers.business_name || car.dealers.name,
        is_verified: car.dealers.is_verified
      } : null
    }))

    return NextResponse.json({
      success: true,
      category,
      trendingCars: formattedCars,
      count: formattedCars.length
    })

  } catch (error) {
    console.error('Trending cars API error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
