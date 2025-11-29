# Fix Admin Errors - Do This Now! 🚀

## The errors you're seeing are because:
1. **Invalid session tokens** in your browser
2. **Database tables not created yet**

## Quick Fix (5 minutes):

### STEP 1: Clear Browser Session
1. Open Chrome/Edge Developer Tools: Press **F12**
2. Go to **Application** tab
3. Under **Storage** on the left:
   - Click **Local Storage** → Select your localhost → Click **Clear All**
   - Click **Session Storage** → Select your localhost → Click **Clear All**
   - Click **Cookies** → Right-click localhost → **Clear**
4. Close Developer Tools
5. **Close all browser tabs** for localhost
6. **Open a fresh tab**

### STEP 2: Set Up Database Tables

#### Option A: Supabase Dashboard (EASIEST - Do This!)

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Login & Select Your Project**

3. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

4. **Copy & Run the Consolidated Migration**
   - Open this file: `scripts/run-all-migrations.sql`
   - Copy **ENTIRE CONTENTS** (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click **"Run"** button or press **Ctrl+Enter**
   - Wait for success message (should take 5-10 seconds)

5. **Verify Tables Were Created**
   - Click "Table Editor" in left sidebar
   - You should see these NEW tables:
     ✅ `payment_settings`
     ✅ `escrow_bank_accounts`
     ✅ `payment_activity_logs`
     ✅ `escrow_transactions`

#### Option B: Supabase CLI (If you prefer command line)

```bash
# In your project directory
cd "C:\Users\hp\OneDrive\Pictures\Echo\201401__\OneDrive\Echo\leanring folder\Justcars.ng"

# Link to your project (first time only)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### STEP 3: Login to Admin Panel

1. **Open Login Page**
   ```
   http://localhost:3000/admin/login
   ```

2. **If you DON'T have admin credentials yet:**

   Go to Supabase Dashboard:
   - Click **"Authentication"** → **"Users"**
   - Click **"Add User"**
   - Enter:
     - Email: `admin@justcars.ng` (or your email)
     - Password: `your-secure-password`
   - Click **"Create User"**

3. **Login with your credentials**

4. **You're in!** 🎉

### STEP 4: Test Everything Works

Visit these pages to confirm:

1. **Dashboard**: http://localhost:3000/admin
   - Should show stats

2. **Payment Accounts**: http://localhost:3000/admin/payment-accounts
   - Should show payment provider tabs
   - No errors!

3. **Escrow Management**: http://localhost:3000/admin/escrow
   - Should show empty transactions table
   - No errors!

## What If Still Getting Errors?

### Error: "Invalid Refresh Token"
- You didn't clear browser storage properly
- Solution: Use **Incognito/Private Window** instead
  - Open new incognito window
  - Go to http://localhost:3000/admin/login

### Error: "relation does not exist" or "table not found"
- Database migration didn't run
- Solution:
  - Go back to Supabase Dashboard → SQL Editor
  - Run the migration again from `scripts/run-all-migrations.sql`
  - Make sure you see "Success" message

### Error: "Failed to load settings"
- Not logged in OR tables missing
- Solution:
  1. Make sure you're logged in (go to /admin/login)
  2. Make sure migrations ran (check Table Editor in Supabase)

## After Everything Works:

### Configure Your Payment Providers

1. **Go to Payment Accounts**
   ```
   http://localhost:3000/admin/payment-accounts
   ```

2. **Click "Paystack" tab**
   - Toggle "Enabled"
   - Select "Test Mode"
   - Enter your test API keys from Paystack dashboard
   - Click "Save Settings"

3. **Add Escrow Bank Account**
   - Click "Escrow Accounts" tab
   - Fill in:
     - Bank Name: e.g., "GTBank"
     - Account Number: "1234567890"
     - Account Name: "JustCars Escrow"
   - Check "Set as default"
   - Click "Add Account"

4. **Configure Platform Settings**
   - Click "Platform Settings" tab
   - Set your escrow fee (default 1.5%)
   - Set transaction limits
   - Click "Save Platform Settings"

## Success! ✅

You should now have:
- ✅ Working admin login
- ✅ No more auth errors
- ✅ Database tables created
- ✅ Payment accounts management working
- ✅ Escrow management ready

## Quick Links:

- **Admin Login**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin
- **Payment Accounts**: http://localhost:3000/admin/payment-accounts
- **Escrow Management**: http://localhost:3000/admin/escrow
- **Cars Management**: http://localhost:3000/admin/cars
- **Dealers Management**: http://localhost:3000/admin/dealers

---

**Need More Help?**
- Detailed guide: `ADMIN_PAYMENT_SETUP.md`
- Database setup: `QUICK_DATABASE_SETUP.md`
- Migration file: `scripts/run-all-migrations.sql`
