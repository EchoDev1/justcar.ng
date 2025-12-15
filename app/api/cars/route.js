/**
 * Cars API - Main endpoint for fetching and managing cars
 * GET /api/cars - Fetch cars with filters, search, and pagination
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    // Filters
    const dealerId = searchParams.get('dealerId')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bodyType = searchParams.get('bodyType')
    const fuelType = searchParams.get('fuelType')
    const transmission = searchParams.get('transmission')
    const condition = searchParams.get('condition')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'active'

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const supabase = await createClient()

    let query = supabase
      .from('cars')
      .select('*', { count: 'exact' })

    // Apply filters
    if (dealerId) query = query.eq('dealer_id', dealerId)
    if (make) query = query.eq('make', make)
    if (model) query = query.eq('model', model)
    if (year) query = query.eq('year', parseInt(year))
    if (minPrice) query = query.gte('price', parseInt(minPrice))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))
    if (bodyType) query = query.eq('body_type', bodyType)
    if (fuelType) query = query.eq('fuel_type', fuelType)
    if (transmission) query = query.eq('transmission', transmission)
    if (condition) query = query.eq('condition', condition)
    if (status) query = query.eq('status', status)

    // Search
    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: cars, error, count } = await query

    if (error) {
      console.error('Error fetching cars:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      cars: cars || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Error in cars API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
