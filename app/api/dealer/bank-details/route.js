/**
 * API Route: Dealer Bank Details
 * Allows dealers to add/update their bank account information
 * Accessible by admin for verification and payment processing
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieStore = await cookies()
    const dealerCookie = cookieStore.get('dealer-session')

    if (!dealerCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dealerData = JSON.parse(dealerCookie.value)
    const supabase = createServiceRoleClient()

    // Fetch bank details for the dealer
    const { data, error } = await supabase
      .from('dealer_bank_details')
      .select('*')
      .eq('dealer_id', dealerData.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching bank details:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bankDetails: data || null })
  } catch (error) {
    console.error('Error in bank details GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const dealerCookie = cookieStore.get('dealer-session')

    if (!dealerCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dealerData = JSON.parse(dealerCookie.value)
    const supabase = createServiceRoleClient()

    const body = await request.json()
    const {
      account_name,
      account_number,
      bank_name,
      bank_code,
      account_type
    } = body

    // Validate required fields
    if (!account_name || !account_number || !bank_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if bank details already exist
    const { data: existing } = await supabase
      .from('dealer_bank_details')
      .select('id')
      .eq('dealer_id', dealerData.id)
      .single()

    let result

    if (existing) {
      // Update existing bank details
      const { data, error } = await supabase
        .from('dealer_bank_details')
        .update({
          account_name,
          account_number,
          bank_name,
          bank_code,
          account_type,
          updated_at: new Date().toISOString()
        })
        .eq('dealer_id', dealerData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating bank details:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    } else {
      // Insert new bank details
      const { data, error } = await supabase
        .from('dealer_bank_details')
        .insert({
          dealer_id: dealerData.id,
          account_name,
          account_number,
          bank_name,
          bank_code,
          account_type,
          is_verified: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting bank details:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({
      message: 'Bank details saved successfully',
      bankDetails: result
    })
  } catch (error) {
    console.error('Error in bank details POST:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies()
    const dealerCookie = cookieStore.get('dealer-session')

    if (!dealerCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dealerData = JSON.parse(dealerCookie.value)
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('dealer_bank_details')
      .delete()
      .eq('dealer_id', dealerData.id)

    if (error) {
      console.error('Error deleting bank details:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bank details deleted successfully' })
  } catch (error) {
    console.error('Error in bank details DELETE:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
