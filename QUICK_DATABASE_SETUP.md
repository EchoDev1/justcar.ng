# Quick Database Setup Guide

## You're seeing errors because the database tables haven't been created yet.

Follow these steps to set up your database:

## Option 1: Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Log in to your account
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration for Payment Tables**
   - Copy the entire contents of: `supabase/migrations/20250129_payment_accounts_settings.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see:
     - `payment_settings`
     - `escrow_bank_accounts`
     - `payment_activity_logs`

5. **Refresh Admin Page**
   - Go back to http://localhost:3000/admin/payment-accounts
   - The page should now work without errors

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "C:\Users\hp\OneDrive\Pictures\Echo\201401__\OneDrive\Echo\leanring folder\Justcars.ng"

# Link to your Supabase project (first time only)
supabase link --project-ref your-project-ref

# Push migrations to database
supabase db push
```

## Option 3: Manual SQL Execution via psql

If you have PostgreSQL client installed:

```bash
# Get your database connection string from Supabase Dashboard
# Go to Settings → Database → Connection String

psql "your-connection-string" -f "supabase/migrations/20250129_payment_accounts_settings.sql"
```

## What Tables Will Be Created?

### 1. payment_settings
Stores configuration for:
- Paystack (API keys, webhooks)
- Flutterwave (API keys, webhooks)
- Monnify (API keys, contract codes)
- Platform settings (fees, limits)

### 2. escrow_bank_accounts
Stores escrow bank account details:
- Bank name
- Account number
- Account name
- Default account flag

### 3. payment_activity_logs
Audit trail for:
- Settings changes
- Account additions/deletions
- Admin actions

## Troubleshooting

### "Cannot connect to database"
- Check your Supabase project is active
- Verify your `.env.local` has correct credentials
- Check if your IP is allowed in Supabase

### "Permission denied"
- Make sure you're using the service role key for migrations
- Or run the SQL as the postgres user in Supabase dashboard

### "Table already exists"
- Tables were created successfully before
- You can skip the migration
- If you need to reset, drop the tables first (careful!)

## After Migration

Once tables are created:

1. **Refresh the admin page**: http://localhost:3000/admin/payment-accounts
2. **No more errors**: The page will load successfully
3. **Configure payments**: Add your payment provider keys
4. **Add escrow accounts**: Set up your bank accounts
5. **Set platform fees**: Configure transaction limits

## Need Help?

- Check the full guide: `ADMIN_PAYMENT_SETUP.md`
- Review migration file: `supabase/migrations/20250129_payment_accounts_settings.sql`
- Check Supabase docs: https://supabase.com/docs

---

**Note**: The migration file creates tables with Row Level Security (RLS) enabled. Make sure you're authenticated as an admin user to access them.
