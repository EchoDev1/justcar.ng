/**
 * API Route: Get Luxury Brands (Dynamic)
 *
 * Returns all unique brands that have cars priced >= 150M
 * This enables auto-detection of luxury brands when new cars are added
 *
 * @returns {Object} { brands: Array<{name, abbreviation, color, count}> }
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { LUXURY_PRICE_THRESHOLD, getBrandAbbreviation, getBrandColor } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all unique makes from cars >= 150M
    const { data: cars, error } = await supabase
      .from('cars')
      .select('make, price')
      .eq('status', 'active')
      .gte('price', LUXURY_PRICE_THRESHOLD)

    if (error) {
      console.error('[LUXURY BRANDS API] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Count cars per brand and build unique brands list
    const brandCounts = {}
    const brandMinPrices = {}

    ;(cars || []).forEach(car => {
      const make = car.make
      if (make) {
        brandCounts[make] = (brandCounts[make] || 0) + 1
        if (!brandMinPrices[make] || car.price < brandMinPrices[make]) {
          brandMinPrices[make] = car.price
        }
      }
    })

    // Build brands array with metadata
    const brands = Object.keys(brandCounts)
      .sort((a, b) => brandCounts[b] - brandCounts[a]) // Sort by count (most cars first)
      .map(name => ({
        name,
        abbreviation: getBrandAbbreviation(name),
        color: getBrandColor(name),
        count: brandCounts[name],
        minPrice: brandMinPrices[name]
      }))

    console.log(`[LUXURY BRANDS API] Found ${brands.length} luxury brands`)

    return NextResponse.json({ brands })
  } catch (error) {
    console.error('[LUXURY BRANDS API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
