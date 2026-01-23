/**
 * Email Service using Resend
 * Handles all email notifications for the platform
 */

import { Resend } from 'resend'

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email
// Use resend.dev for testing if domain not verified, otherwise use your verified domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'JustCars.ng <onboarding@resend.dev>'

/**
 * Send email using Resend
 */
async function sendEmail({ to, subject, html, text }) {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, error: 'Email service not configured - missing API key' }
  }

  console.log('[EMAIL] Sending email to:', to)
  console.log('[EMAIL] From:', FROM_EMAIL)
  console.log('[EMAIL] Subject:', subject)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text
    })

    if (error) {
      console.error('[EMAIL] Resend API error:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('[EMAIL] Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[EMAIL] Send error:', error.message || error)
    return { success: false, error: error.message }
  }
}

/**
 * Email Templates
 */

// 1. New Car Listing Notification (for saved searches)
export async function sendNewCarNotification({ userEmail, userName, car, searchCriteria }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .car-card { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .car-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
          .car-title { font-size: 24px; font-weight: bold; margin: 15px 0; color: #1e40af; }
          .car-price { font-size: 28px; font-weight: bold; color: #059669; margin: 10px 0; }
          .car-specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
          .spec-item { padding: 10px; background: #f3f4f6; border-radius: 5px; font-size: 14px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 New Car Match Found!</h1>
            <p>Hi ${userName}, we found a car that matches your saved search</p>
          </div>

          <div class="content">
            <div class="car-card">
              <img src="${car.image}" alt="${car.title}" class="car-image" />
              <h2 class="car-title">${car.year} ${car.make} ${car.model}</h2>
              <p class="car-price">₦${car.price.toLocaleString()}</p>

              <div class="car-specs">
                <div class="spec-item">📍 ${car.location}</div>
                <div class="spec-item">⚙️ ${car.transmission}</div>
                <div class="spec-item">⛽ ${car.fuelType}</div>
                <div class="spec-item">🛣️ ${car.mileage.toLocaleString()} km</div>
              </div>

              <p><strong>Condition:</strong> ${car.condition}</p>
              ${car.isVerified ? '<p style="color: #059669;">✓ Verified by JustCars.ng</p>' : ''}

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/cars/${car.id}" class="btn">View Car Details</a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This matches your saved search: <strong>${searchCriteria}</strong>
            </p>
          </div>

          <div class="footer">
            <p>You're receiving this because you saved a search on JustCars.ng</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/buyer/settings">Manage email preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `🚗 New ${car.make} ${car.model} matches your search!`,
    html
  })
}

// 2. Price Drop Alert
export async function sendPriceDropAlert({ userEmail, userName, car, oldPrice, newPrice }) {
  const savings = oldPrice - newPrice
  const percentageOff = ((savings / oldPrice) * 100).toFixed(1)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .badge { background: #fbbf24; color: #78350f; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .content { background: #f9fafb; padding: 30px; }
          .price-comparison { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .old-price { text-decoration: line-through; color: #9ca3af; font-size: 20px; }
          .new-price { font-size: 32px; font-weight: bold; color: #059669; margin: 10px 0; }
          .savings { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .btn { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Price Drop Alert!</h1>
            <div class="badge">${percentageOff}% OFF</div>
            <p>Hi ${userName}, great news! A car you saved has dropped in price</p>
          </div>

          <div class="content">
            <h2 style="color: #1e40af;">${car.year} ${car.make} ${car.model}</h2>

            <div class="price-comparison">
              <p style="font-weight: bold; margin-bottom: 10px;">Price Update:</p>
              <p class="old-price">₦${oldPrice.toLocaleString()}</p>
              <p class="new-price">₦${newPrice.toLocaleString()}</p>
            </div>

            <div class="savings">
              <p style="margin: 0; font-weight: bold;">💰 You save: ₦${savings.toLocaleString()}</p>
            </div>

            <p>Don't miss this opportunity! Cars at this price won't last long.</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/cars/${car.id}" class="btn">View Now</a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `💰 Price Drop! ${car.make} ${car.model} is now ₦${newPrice.toLocaleString()}`,
    html
  })
}

// 3. Dealer Approval Email
export async function sendDealerApprovalEmail({ dealerEmail, dealerName }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .success-icon { font-size: 64px; margin: 20px 0; }
          .btn { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .info-box { background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Welcome to JustCars.ng!</h1>
            <p>Your dealer account has been approved</p>
          </div>

          <div class="content">
            <p>Dear ${dealerName},</p>

            <p>Congratulations! Your dealer account has been approved by our team. You can now start listing your cars on JustCars.ng.</p>

            <div class="info-box">
              <h3>What's Next?</h3>
              <ul>
                <li>✓ Complete your profile information</li>
                <li>✓ Add your bank details for payments</li>
                <li>✓ Upload your first car listing</li>
                <li>✓ Explore premium features</li>
              </ul>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dealer" class="btn">Go to Dashboard</a>

            <p style="margin-top: 30px; color: #6b7280;">
              If you have any questions, our support team is here to help at support@justcars.ng
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: dealerEmail,
    subject: '✅ Your JustCars.ng Dealer Account is Approved!',
    html
  })
}

// 4. Bank Account Verification Email
export async function sendBankVerificationEmail({ dealerEmail, dealerName, isVerified }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isVerified ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .icon { font-size: 64px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${isVerified ? '✅' : '⚠️'}</div>
            <h1>Bank Account ${isVerified ? 'Verified' : 'Verification Failed'}</h1>
          </div>

          <div class="content">
            <p>Dear ${dealerName},</p>

            ${isVerified ? `
              <p>Great news! Your bank account has been verified by our admin team.</p>
              <p>You can now receive payments directly to your account for car sales made through our escrow system.</p>
            ` : `
              <p>We were unable to verify your bank account details. Please review and update your information.</p>
              <p>Common issues:</p>
              <ul>
                <li>Account number doesn't match account name</li>
                <li>Bank name is incorrect</li>
                <li>Account is not active</li>
              </ul>
            `}

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dealer/bank-details" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              ${isVerified ? 'View Bank Details' : 'Update Bank Details'}
            </a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: dealerEmail,
    subject: `${isVerified ? '✅' : '⚠️'} Bank Account Verification Update`,
    html
  })
}

// 5. Escrow Transaction Status Update
export async function sendEscrowStatusEmail({ userEmail, userName, transaction, status }) {
  const statusConfig = {
    initiated: { color: '#3b82f6', icon: '🔄', text: 'Initiated' },
    pending: { color: '#f59e0b', icon: '⏳', text: 'Pending' },
    completed: { color: '#059669', icon: '✅', text: 'Completed' },
    failed: { color: '#dc2626', icon: '❌', text: 'Failed' }
  }

  const config = statusConfig[status] || statusConfig.pending

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .transaction-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 64px; margin: 20px 0;">${config.icon}</div>
            <h1>Transaction ${config.text}</h1>
          </div>

          <div class="content">
            <p>Dear ${userName},</p>

            <p>Your escrow transaction has been updated:</p>

            <div class="transaction-details">
              <div class="detail-row">
                <span>Transaction ID:</span>
                <strong>${transaction.id}</strong>
              </div>
              <div class="detail-row">
                <span>Car:</span>
                <strong>${transaction.carTitle}</strong>
              </div>
              <div class="detail-row">
                <span>Amount:</span>
                <strong>₦${transaction.amount.toLocaleString()}</strong>
              </div>
              <div class="detail-row">
                <span>Status:</span>
                <strong style="color: ${config.color};">${config.text}</strong>
              </div>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/buyer/escrow/transactions" style="display: inline-block; background: ${config.color}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
              View Transaction
            </a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `${config.icon} Escrow Transaction ${config.text} - ${transaction.carTitle}`,
    html
  })
}

// 6. Email Confirmation for Account Registration
export async function sendEmailConfirmation({ userEmail, userName, confirmationUrl, userType = 'buyer' }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9fafb; padding: 40px 30px; }
          .welcome-text { font-size: 18px; margin-bottom: 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
          .btn:hover { background: linear-gradient(135deg, #047857, #059669); }
          .info-box { background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
          .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f3f4f6; border-radius: 0 0 10px 10px; }
          .expire-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚗 JustCars.ng</div>
            <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>

          <div class="content">
            <p class="welcome-text">Hi ${userName},</p>

            <p>Welcome to JustCars.ng! We're excited to have you on board. Please verify your email address to complete your registration and start ${userType === 'dealer' ? 'selling cars' : 'finding your perfect car'}.</p>

            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="btn">Verify Email Address</a>
            </div>

            <div class="expire-notice">
              ⏰ This verification link will expire in <strong>24 hours</strong>. Please verify your email soon.
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #1e40af;">What's Next?</h3>
              <ul style="margin-bottom: 0; padding-left: 20px;">
                ${userType === 'dealer' ? `
                  <li>Complete your dealer profile</li>
                  <li>Add your business details</li>
                  <li>Start listing your cars</li>
                  <li>Connect with buyers</li>
                ` : `
                  <li>Browse thousands of verified cars</li>
                  <li>Save your favorite listings</li>
                  <li>Set up price drop alerts</li>
                  <li>Chat directly with dealers</li>
                `}
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't create an account on JustCars.ng, you can safely ignore this email.
            </p>

            <p style="color: #6b7280; font-size: 14px;">
              Button not working? Copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #3b82f6; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} JustCars.ng - Nigeria's Premier Car Marketplace</p>
            <p style="margin: 10px 0 0 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: '✉️ Verify your JustCars.ng account',
    html,
    text: `Hi ${userName}, Welcome to JustCars.ng! Please verify your email by visiting: ${confirmationUrl}. This link expires in 24 hours.`
  })
}

// 7. Buyer Inquiry Notification to Dealer
export async function sendInquiryNotification({ dealerEmail, dealerName, buyer, car, message }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .message-box { background: white; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; }
          .btn { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 64px; margin: 20px 0;">📨</div>
            <h1>New Buyer Inquiry!</h1>
          </div>

          <div class="content">
            <p>Dear ${dealerName},</p>

            <p>You have a new inquiry about your car listing:</p>

            <h3 style="color: #1e40af;">${car.title}</h3>

            <div class="message-box">
              <p><strong>From:</strong> ${buyer.name}</p>
              <p><strong>Email:</strong> ${buyer.email}</p>
              <p><strong>Phone:</strong> ${buyer.phone || 'Not provided'}</p>
              <p><strong>Message:</strong></p>
              <p style="margin-top: 10px;">${message}</p>
            </div>

            <p>Respond quickly to increase your chances of making a sale!</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dealer/messages" class="btn">Reply to Inquiry</a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: dealerEmail,
    subject: `📨 New inquiry about your ${car.title}`,
    html
  })
}

export default {
  sendNewCarNotification,
  sendPriceDropAlert,
  sendDealerApprovalEmail,
  sendBankVerificationEmail,
  sendEscrowStatusEmail,
  sendEmailConfirmation,
  sendInquiryNotification
}
