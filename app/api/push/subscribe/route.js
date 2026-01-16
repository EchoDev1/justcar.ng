/**
 * Push Subscription API
 * POST /api/push/subscribe
 * Save push subscription for a user
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('🔵 [PUSH SUBSCRIBE] Request received')

  try {
    const body = await request.json()
    const { subscription, userId, userType = 'buyer' } = body

    // Validation
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription data is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Prepare subscription data
    const subscriptionData = {
      user_id: userId || null,
      user_type: userType,
      subscription_type: subscription.type || 'web',
      endpoint: subscription.endpoint || subscription.subscription?.endpoint,
      subscription_data: subscription.subscription || subscription,
      token: subscription.token || null,
      platform: subscription.platform || 'web',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscriptionData.endpoint)
      .maybeSingle()

    if (existing) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          user_id: subscriptionData.user_id,
          user_type: subscriptionData.user_type,
          subscription_data: subscriptionData.subscription_data,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }

      console.log('✅ [PUSH SUBSCRIBE] Subscription updated')
      return NextResponse.json({
        success: true,
        message: 'Subscription updated',
        id: existing.id
      })
    }

    // Insert new subscription
    const { data: newSub, error: insertError } = await supabase
      .from('push_subscriptions')
      .insert(subscriptionData)
      .select('id')
      .single()

    if (insertError) {
      // Table might not exist, create it
      if (insertError.code === '42P01') {
        console.log('Creating push_subscriptions table...')
        // Table doesn't exist - will be created by migration
        return NextResponse.json(
          { error: 'Push subscriptions table not yet configured' },
          { status: 503 }
        )
      }

      console.error('Error inserting subscription:', insertError)
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      )
    }

    console.log('✅ [PUSH SUBSCRIBE] Subscription saved')
    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
      id: newSub.id
    })

  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe
export async function DELETE(request) {
  console.log('🔵 [PUSH UNSUBSCRIBE] Request received')

  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Error unsubscribing:', error)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    console.log('✅ [PUSH UNSUBSCRIBE] Unsubscribed')
    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully'
    })

  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
