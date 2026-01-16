/**
 * Send Push Notification API
 * POST /api/push/send
 * Send push notification to user(s)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@justcars.ng'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function POST(request) {
  console.log('🔵 [PUSH SEND] Request received')

  try {
    // Check VAPID configuration
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { userId, userIds, title, body: notificationBody, data, url, icon } = body

    // Validation
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    if (!userId && (!userIds || userIds.length === 0)) {
      return NextResponse.json(
        { error: 'userId or userIds is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (userIds) {
      query = query.in('user_id', userIds)
    }

    const { data: subscriptions, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: true, sent: 0, message: 'No active subscriptions found' },
        { status: 200 }
      )
    }

    console.log(`📤 [PUSH SEND] Sending to ${subscriptions.length} subscription(s)`)

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        ...data,
        url: url || '/',
        timestamp: Date.now()
      },
      actions: [
        { action: 'open', title: 'View' },
        { action: 'close', title: 'Dismiss' }
      ]
    })

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        if (sub.subscription_type === 'web' && sub.subscription_data) {
          try {
            await webpush.sendNotification(sub.subscription_data, payload)
            return { success: true, id: sub.id }
          } catch (error) {
            // Handle expired/invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
              // Mark as inactive
              await supabase
                .from('push_subscriptions')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', sub.id)
            }
            return { success: false, id: sub.id, error: error.message }
          }
        }

        // For native subscriptions, would integrate with FCM/APNS
        // This is a placeholder for native push implementation
        if (sub.subscription_type === 'native' && sub.token) {
          console.log('Native push not yet implemented for token:', sub.token.substring(0, 20))
          return { success: false, id: sub.id, error: 'Native push not implemented' }
        }

        return { success: false, id: sub.id, error: 'Unknown subscription type' }
      })
    )

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - sent

    console.log(`✅ [PUSH SEND] Sent: ${sent}, Failed: ${failed}`)

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: results.length
    })

  } catch (error) {
    console.error('Push send error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
