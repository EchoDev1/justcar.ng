/**
 * Admin Send Notification API
 * POST /api/admin/notifications/send
 * Sends email notifications to users
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { notificationId, title, message, emails } = body

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { error: 'No recipients specified' },
        { status: 400 }
      )
    }

    // Check admin authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      )
    }

    // Send emails in batches (Resend supports batch sending)
    const batchSize = 50
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)

      try {
        // Send to each email in batch
        await Promise.all(
          batch.map(async (email) => {
            try {
              await resend.emails.send({
                from: 'JustCars.ng <notifications@justcars.ng>',
                to: email,
                subject: title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0;">JustCars.ng</h1>
                    </div>
                    <div style="padding: 30px; background: #ffffff;">
                      <h2 style="color: #1F2937; margin-top: 0;">${title}</h2>
                      <div style="color: #4B5563; line-height: 1.6;">
                        ${message.replace(/\n/g, '<br>')}
                      </div>
                    </div>
                    <div style="padding: 20px; background: #F3F4F6; text-align: center;">
                      <p style="color: #6B7280; margin: 0; font-size: 12px;">
                        This email was sent by JustCars.ng<br>
                        <a href="https://justcars.ng" style="color: #3B82F6;">Visit our website</a>
                      </p>
                    </div>
                  </div>
                `
              })
              successCount++
            } catch (err) {
              console.error(`Failed to send to ${email}:`, err)
              failCount++
            }
          })
        )
      } catch (batchError) {
        console.error('Batch send error:', batchError)
        failCount += batch.length
      }
    }

    // Update notification record
    if (notificationId) {
      const serviceSupabase = createServiceRoleClient()
      await serviceSupabase
        .from('admin_notifications')
        .update({
          status: failCount === 0 ? 'sent' : failCount === emails.length ? 'failed' : 'partial',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successCount} recipients`,
      stats: {
        total: emails.length,
        success: successCount,
        failed: failCount
      }
    })

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification: ' + error.message },
      { status: 500 }
    )
  }
}
