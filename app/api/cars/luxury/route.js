/**
 * API Route: Get Luxury Cars (≥ ₦150 Million ONLY)
 *
 * STRICT RULE: Only returns cars priced at or above 150 million Naira
 * Cars below ₦150,000,000 will NEVER appear in this endpoint
 *
 * @returns {Object} { cars: Car[] } - Array of luxury cars only
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// LUXURY PRICE THRESHOLD - DO NOT CHANGE
const LUXURY_THRESHOLD = 150000000 // ₦150 Million

export async function GET(request) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 12

    console.log(`[LUXURY API] Fetching cars with price >= ₦${LUXURY_THRESHOLD.toLocaleString()}`)

    // STRICT FILTER: Only fetch cars >= ₦150,000,000
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
      .gte('price', LUXURY_THRESHOLD) // CRITICAL: Only cars >= 150M
      .order('price', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[LUXURY API] Error fetching luxury cars:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // SAFETY CHECK: Double-filter to ensure NO cars below threshold
    const luxuryCarsOnly = (cars || []).filter(car => car.price >= LUXURY_THRESHOLD)

    console.log(`[LUXURY API] Returning ${luxuryCarsOnly.length} luxury cars`)

    return NextResponse.json({ cars: luxuryCarsOnly })
  } catch (error) {
    console.error('[LUXURY API] Error in luxury cars API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
