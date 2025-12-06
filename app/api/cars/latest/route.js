/**
 * API Route: Fetch Latest Arrivals (Just Arrived Cars)
 * Returns cars marked as just arrived
 * OPTIMIZED: With caching for better performance
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Cache for 60 seconds - recent arrivals don't need real-time updates
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // CRITICAL FIX: Use service role client to bypass RLS and avoid infinite recursion
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Optimized query - only select necessary fields
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price,
        created_at,
        just_arrived_date,
        car_images!inner (
          image_url,
          is_primary
        )
      `)
      .eq('is_just_arrived', true)
      .order('just_arrived_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching latest cars:', error)
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
    console.error('Error in latest cars API:', error)
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
}
