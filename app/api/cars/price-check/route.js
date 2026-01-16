/**
 * Price Check API
 * GET /api/cars/price-check
 * Returns price intelligence for a car (badge, market comparison)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { calculatePriceBadge, generatePriceInsights, getPriceCategory } from '@/lib/pricing/priceBadge'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const carId = searchParams.get('carId')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = parseInt(searchParams.get('year') || '0')
    const price = parseFloat(searchParams.get('price') || '0')
    const condition = searchParams.get('condition')

    // Either carId or make+model+year+price required
    if (!carId && (!make || !year || !price)) {
      return NextResponse.json(
        { error: 'Either carId or make+year+price is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    let carPrice = price
    let carMake = make
    let carModel = model
    let carYear = year
    let carCondition = condition

    // If carId provided, fetch car details
    if (carId) {
      const { data: car, error } = await supabase
        .from('cars')
        .select('price, make, model, year, condition')
        .eq('id', carId)
        .single()

      if (error || !car) {
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }

      carPrice = car.price
      carMake = car.make
      carModel = car.model
      carYear = car.year
      carCondition = car.condition
    }

    // Fetch market data
    const { data: marketData, error: marketError } = await supabase
      .from('car_market_prices')
      .select('*')
      .eq('make', carMake)
      .gte('year_to', carYear)
      .lte('year_from', carYear)
      .order('sample_count', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If no specific market data, calculate from existing listings
    let finalMarketData = marketData

    if (!marketData) {
      // Calculate from similar cars in the database
      const { data: similarCars } = await supabase
        .from('cars')
        .select('price')
        .ilike('make', carMake)
        .gte('year', carYear - 2)
        .lte('year', carYear + 2)
        .eq('status', 'active')
        .not('price', 'is', null)

      if (similarCars && similarCars.length >= 3) {
        const prices = similarCars.map(c => c.price).sort((a, b) => a - b)
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
        const medianPrice = prices[Math.floor(prices.length / 2)]

        finalMarketData = {
          avg_price: avgPrice,
          min_price: prices[0],
          max_price: prices[prices.length - 1],
          median_price: medianPrice,
          sample_count: prices.length,
          good_deal_threshold: avgPrice * 0.85,
          fair_price_min: avgPrice * 0.85,
          fair_price_max: avgPrice * 1.20,
          overpriced_threshold: avgPrice * 1.20,
          price_trend: 'stable',
          calculated: true
        }
      }
    }

    // Generate price insights
    const insights = generatePriceInsights(carPrice, finalMarketData)
    const category = getPriceCategory(carPrice)

    return NextResponse.json({
      success: true,
      car: {
        make: carMake,
        model: carModel,
        year: carYear,
        price: carPrice,
        condition: carCondition
      },
      priceIntelligence: {
        badge: insights.badge.badge,
        badgeLabel: insights.badge.config?.label,
        variancePercent: insights.badge.variancePercent,
        marketAvg: finalMarketData?.avg_price,
        marketMin: finalMarketData?.min_price,
        marketMax: finalMarketData?.max_price,
        sampleCount: finalMarketData?.sample_count,
        savings: insights.savings,
        category: category,
        trend: insights.trend,
        insights: insights.insights
      },
      hasMarketData: !!finalMarketData
    })

  } catch (error) {
    console.error('Price check API error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
