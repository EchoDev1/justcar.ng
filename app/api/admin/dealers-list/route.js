/**
 * Admin API: Get All Dealers List
 * Returns all dealers for admin dropdown selections
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use service role to bypass RLS and get all dealers
    const supabase = createServiceRoleClient()

    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('id, name, business_name, email, status, is_verified')
      .in('status', ['active', 'verified', 'pending'])
      .order('name')

    if (error) {
      console.error('Error fetching dealers list:', error)
      return NextResponse.json(
        { dealers: [] },
        { status: 200 }
      )
    }

    return NextResponse.json({ dealers: dealers || [] })
  } catch (error) {
    console.error('Error in dealers-list API:', error)
    return NextResponse.json(
      { dealers: [] },
      { status: 200 }
    )
  }
}
