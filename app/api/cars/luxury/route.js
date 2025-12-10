/**
 * API Route: Get Luxury Cars (≥ ₦150 Million)
 * Returns all cars priced at or above 150 million Naira
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 12

    // Fetch luxury cars (price >= 150,000,000)
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        dealers (
          id,
          name,
          badge_type,
          phone
        ),
        car_images (
          image_url,
          is_primary
        )
      `)
      .eq('status', 'active')
      .gte('price', 150000000)
      .order('price', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching luxury cars:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cars: cars || [] })
  } catch (error) {
    console.error('Error in luxury cars API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
