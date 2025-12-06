/**
 * API Route: Fetch Premium Verified Cars
 * Returns cars marked as premium verified OR from premium/luxury dealers
 * OPTIMIZED: Single query with caching
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Cache for 60 seconds - homepage data doesn't need real-time updates
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // CRITICAL FIX: Use service role client to bypass RLS and avoid infinite recursion
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // OPTIMIZED: Get premium verified cars (simpler, faster query)
    const { data: cars, error } = await supabase
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
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching premium cars:', error)
      return NextResponse.json(
        { cars: [] },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
          }
        }
      )
    }

    return NextResponse.json(
      { cars: cars || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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
