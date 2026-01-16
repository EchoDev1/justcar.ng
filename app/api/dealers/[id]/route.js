/**
 * Dealer Detail API
 * GET /api/dealers/[id] - Fetch single dealer details
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Dealer ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch dealer details
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', id)
      .eq('is_approved', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
      }
      throw error
    }

    // Fetch dealer statistics
    const { data: activeCars } = await supabase
      .from('cars')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', id)
      .eq('status', 'active')

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('dealer_id', id)
      .eq('is_approved', true)

    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    return NextResponse.json({
      ...dealer,
      statistics: {
        activeCars: activeCars?.length || 0,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10
      }
    })
  } catch (error) {
    console.error('Error fetching dealer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
