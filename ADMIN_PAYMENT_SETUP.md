# Admin Payment Accounts Management Guide

## Overview
The Payment Accounts Management portal provides comprehensive control over all payment systems, escrow accounts, and platform settings for JustCars.ng.

## Accessing the Admin Panel

1. **URL**: Navigate to `https://yourdomain.com/admin` or `http://localhost:3000/admin`
2. **Login**: Use your admin credentials
3. **Navigate**: Click on "Payment Accounts" in the left sidebar

## Features

### 1. Payment Provider Configuration

#### Paystack Setup
1. Click on the **Paystack** tab
2. Toggle **Enabled** to activate Paystack payments
3. Select **Mode**: Test or Live
4. Enter your API keys:
   - **Test Keys**: For development and testing
     - Test Public Key (starts with `pk_test_`)
     - Test Secret Key (starts with `sk_test_`)
   - **Live Keys**: For production
     - Live Public Key (starts with `pk_live_`)
     - Live Secret Key (starts with `sk_live_`)
5. Configure URLs:
   - **Webhook URL**: `https://yourdomain.com/api/webhooks/paystack`
   - **Callback URL**: `https://yourdomain.com/payment/callback`
6. Click **Save Settings**
7. Click **Test Connection** to verify setup

**Where to get Paystack keys:**
- Login to https://dashboard.paystack.com
- Navigate to Settings → API Keys & Webhooks
- Copy your public and secret keys
- Set the webhook URL in the webhooks section

#### Flutterwave Setup
1. Click on the **Flutterwave** tab
2. Toggle **Enabled** to activate Flutterwave payments
3. Select **Mode**: Test or Live
4. Enter your API keys:
   - **Test Keys**:
     - Test Public Key (starts with `FLWPUBK_TEST-`)
     - Test Secret Key (starts with `FLWSECK_TEST-`)
   - **Live Keys**:
     - Live Public Key (starts with `FLWPUBK-`)
     - Live Secret Key (starts with `FLWSECK-`)
5. Configure URLs:
   - **Webhook URL**: `https://yourdomain.com/api/webhooks/flutterwave`
   - **Callback URL**: `https://yourdomain.com/payment/callback`
6. Click **Save Settings**
7. Click **Test Connection** to verify setup

**Where to get Flutterwave keys:**
- Login to https://dashboard.flutterwave.com
- Navigate to Settings → API
- Copy your public and secret keys
- Configure webhooks in Settings → Webhooks

#### Monnify Setup
1. Click on the **Monnify** tab
2. Toggle **Enabled** to activate Monnify payments
3. Select **Mode**: Test or Live
4. Enter your credentials:
   - **Test Credentials**:
     - Test API Key (starts with `MK_TEST_`)
     - Test Secret Key
     - Test Contract Code
   - **Live Credentials**:
     - Live API Key (starts with `MK_PROD_`)
     - Live Secret Key
     - Live Contract Code
5. Configure Webhook URL: `https://yourdomain.com/api/webhooks/monnify`
6. Click **Save Settings**
7. Click **Test Connection** to verify setup

**Where to get Monnify credentials:**
- Login to https://app.monnify.com
- Navigate to Settings → API Settings
- Copy your API Key, Secret Key, and Contract Code
- Configure webhook URL in Settings → Webhooks

### 2. Escrow Bank Accounts Management

#### Adding a New Escrow Account
1. Click on the **Escrow Accounts** tab
2. Fill in the account details:
   - **Bank Name**: e.g., GTBank, Access Bank, First Bank
   - **Account Number**: 10-digit account number
   - **Account Name**: Account holder name (e.g., JustCars Escrow)
3. Check **Set as default account** if this should be the primary account
4. Click **Add Account**

#### Managing Existing Accounts
- **Set as Default**: Click "Set as Default" button on any account
- **Delete Account**: Click the trash icon to remove an account
- **View Details**: See account information, creation date, and default status

**Important Notes:**
- Only one account can be set as default at a time
- The default account is used for new escrow transactions
- Ensure the account name matches your business registration

### 3. Platform Settings

#### Configuring Fees and Limits
1. Click on the **Platform Settings** tab
2. Adjust the following settings:
   - **Escrow Fee Percentage**: Platform commission (default: 1.5%)
   - **Auto-Release Days**: Days before automatic release to dealer (default: 7)
   - **Minimum Transaction Amount**: Lowest allowed transaction (₦100,000)
   - **Maximum Transaction Amount**: Highest allowed transaction (₦100,000,000)
3. Click **Save Platform Settings**

**Recommended Settings:**
- Escrow Fee: 1.5% - 2.5%
- Auto-Release: 5-10 days
- Min Amount: ₦50,000 - ₦100,000
- Max Amount: ₦50,000,000 - ₦100,000,000

## Database Migration

Before using the payment accounts management, run the database migration:

### Option 1: Using Supabase Dashboard
1. Login to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250129_payment_accounts_settings.sql`
4. Paste and execute the SQL

### Option 2: Using Supabase CLI
```bash
supabase db push
```

### Option 3: Manual SQL Execution
```bash
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250129_payment_accounts_settings.sql
```

## Security Best Practices

1. **API Keys Protection**:
   - Never share API keys publicly
   - Use the eye icon to hide/show keys when needed
   - Store keys securely in environment variables for production

2. **Test Mode First**:
   - Always start with test mode
   - Verify all functionality works correctly
   - Only switch to live mode after thorough testing

3. **Webhook Security**:
   - Ensure webhook URLs are HTTPS
   - Verify webhook signatures (implement in backend)
   - Monitor webhook activity logs

4. **Access Control**:
   - Limit admin access to authorized personnel only
   - Use strong passwords
   - Enable two-factor authentication if available

## Escrow Management Portal

Access the escrow management portal at `/admin/escrow` to:
- View all escrow transactions
- Release payments to dealers
- Process refunds to buyers
- Handle disputes
- Edit transaction details
- Manually manage escrow operations

### Escrow Operations:

1. **Release Payment**: Transfer funds to dealer after successful transaction
2. **Refund Buyer**: Return funds to buyer if transaction fails
3. **Mark as Disputed**: Flag transactions requiring investigation
4. **Edit Details**: Manually update account numbers, references, and notes

## Troubleshooting

### Payment Settings Not Saving
- Check database connection
- Verify you're logged in as admin
- Check browser console for errors
- Ensure Supabase RLS policies are configured

### Test Connection Fails
- Verify API keys are correct
- Check if keys are for the right mode (test/live)
- Ensure no extra spaces in keys
- Confirm your IP is whitelisted (if required by provider)

### Escrow Account Not Appearing
- Refresh the page
- Check database for the record
- Verify RLS policies allow read access
- Check browser console for errors

## Support and Resources

### Paystack Resources
- Documentation: https://paystack.com/docs
- Dashboard: https://dashboard.paystack.com
- Support: support@paystack.com

### Flutterwave Resources
- Documentation: https://developer.flutterwave.com
- Dashboard: https://dashboard.flutterwave.com
- Support: developers@flutterwave.com

### Monnify Resources
- Documentation: https://docs.monnify.com
- Dashboard: https://app.monnify.com
- Support: support@monnify.com

## Additional Features

The admin panel also includes:
- **Chats Management**: Monitor and manage buyer-dealer conversations
- **Inspections**: Track vehicle inspection requests and reports
- **Dealer Permissions**: Control dealer access levels
- **Cars Management**: Add, edit, and manage vehicle listings
- **Premium Verified**: Manage premium verified car collections
- **Just Arrived**: Curate newly arrived vehicles

## Updates and Maintenance

To keep your payment systems running smoothly:
1. Regularly check for API updates from payment providers
2. Monitor transaction success rates
3. Review escrow release times
4. Audit payment logs monthly
5. Update API keys before expiration
6. Test payment flows after any changes

## Getting Started Checklist

- [ ] Run database migration
- [ ] Access admin panel at `/admin`
- [ ] Configure at least one payment provider
- [ ] Add at least one escrow bank account
- [ ] Set platform fees and limits
- [ ] Test payment flow in test mode
- [ ] Verify escrow management works
- [ ] Switch to live mode when ready
- [ ] Monitor first few transactions closely
- [ ] Set up webhook handlers in backend

---

**Note**: This is a comprehensive payment management system. Take time to understand each feature before enabling live mode. When in doubt, test thoroughly in test mode first.
