/**
 * API Route: Admin - View All Dealer Bank Details
 * Allows admins to view and verify dealer bank account information
 * Admin-only access for payment processing and verification
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin-session')

    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const dealerId = searchParams.get('dealerId')

    let query = supabase
      .from('dealer_bank_details')
      .select(`
        *,
        dealers (
          id,
          name,
          email,
          phone,
          is_verified,
          subscription_tier
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by specific dealer if provided
    if (dealerId) {
      query = query.eq('dealer_id', dealerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bank details:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bankDetails: data || [] })
  } catch (error) {
    console.error('Error in admin bank details GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin-session')

    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { id, is_verified } = body

    if (!id || is_verified === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update verification status
    const { data, error } = await supabase
      .from('dealer_bank_details')
      .update({
        is_verified,
        verified_at: is_verified ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bank details:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Bank details verification updated successfully',
      bankDetails: data
    })
  } catch (error) {
    console.error('Error in admin bank details POST:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
