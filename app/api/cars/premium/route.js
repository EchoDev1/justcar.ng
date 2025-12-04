/**
 * API Route: Fetch Premium Verified Cars
 * Returns cars marked as premium verified OR from premium/luxury dealers
 * Uses caching for better performance
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// No caching for immediate reflection
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Fetch premium verified cars OR cars from premium/luxury dealers
    // Step 1: Get admin-marked premium cars
    const { data: premiumMarkedCars } = await supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price,
        mileage,
        location,
        fuel_type,
        transmission,
        condition,
        is_verified,
        is_featured,
        is_premium_verified,
        dealer_id,
        created_at,
        dealers (
          id,
          name,
          phone,
          email,
          is_verified,
          badge_type
        ),
        car_images (
          image_url,
          is_primary
        )
      `)
      .eq('is_premium_verified', true)

    // Step 2: Get cars from premium/luxury dealers
    const { data: premiumDealerCars } = await supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price,
        mileage,
        location,
        fuel_type,
        transmission,
        condition,
        is_verified,
        is_featured,
        is_premium_verified,
        dealer_id,
        created_at,
        dealers!inner (
          id,
          name,
          phone,
          email,
          is_verified,
          badge_type
        ),
        car_images (
          image_url,
          is_primary
        )
      `)
      .in('dealers.badge_type', ['premium', 'luxury'])

    // Combine and deduplicate by car ID
    const allCars = [...(premiumMarkedCars || []), ...(premiumDealerCars || [])]
    const uniqueCars = Array.from(new Map(allCars.map(car => [car.id, car])).values())

    // Sort by created_at descending and limit
    const cars = uniqueCars
      .filter(car => car.car_images && car.car_images.length > 0) // Only cars with images
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)

    return NextResponse.json(
      { cars: cars || [] },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error in premium cars API:', error)
    // Return empty array instead of error for better UX
    return NextResponse.json(
      { cars: [] },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
