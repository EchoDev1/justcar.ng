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

    // Fetch cars from dealers with 'premium' or 'luxury' badge_type
    // Join with dealers table to filter by badge type
    // Order by created_at DESC to show newest cars first
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        dealers!inner (
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
      .in('dealers.badge_type', ['premium', 'luxury'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching premium cars:', error)
      return NextResponse.json(
        { error: 'Failed to fetch premium cars' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cars: cars || [] })
  } catch (error) {
    console.error('Error in premium cars API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
