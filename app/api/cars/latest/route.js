/**
 * API Route: Fetch Latest Arrivals (Just Arrived Cars)
 * Returns cars marked as just arrived
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
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

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
    console.error('Error in latest cars API:', error)
    return NextResponse.json(
      { cars: [] },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}
