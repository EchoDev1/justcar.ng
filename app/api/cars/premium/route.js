/**
 * API Route: Fetch Premium Verified Cars
 * Returns cars from verified premium dealers for homepage display
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Try to fetch cars from dealers with 'premium' or 'luxury' badge_type
    // If database is not set up yet, return empty array
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        dealers (
          id,
          name,
          phone,
          email,
          badge_type
        ),
        car_images (
          id,
          image_url,
          is_primary
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching premium cars:', error)
      // Return empty array instead of error for better UX
      return NextResponse.json({ cars: [] })
    }

    // Filter cars by dealer badge type on the client side
    const premiumCars = (cars || []).filter(car =>
      car.dealers && ['premium', 'luxury'].includes(car.dealers.badge_type)
    )

    return NextResponse.json({ cars: premiumCars })
  } catch (error) {
    console.error('Error in premium cars API:', error)
    // Return empty array instead of error for better UX
    return NextResponse.json({ cars: [] })
  }
}
