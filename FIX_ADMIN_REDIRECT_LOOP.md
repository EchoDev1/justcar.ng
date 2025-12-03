# Fix Admin Portal Redirect Loop

## Problem
Your admin portal was experiencing `ERR_TOO_MANY_REDIRECTS` due to:
1. **Infinite recursion in Supabase RLS policy** - The policy required you to be an admin to check if you're an admin
2. **Layout redirect loop** - The admin layout was checking authentication even for the login page

## Solutions Applied

### ✅ 1. Fixed the Layout Redirect Loop
- Updated `app/admin/layout.js` to exclude the login page from authentication checks
- Added `middleware.js` to provide pathname information to layouts
- The login page now renders without triggering authentication checks

### 🔧 2. Fix the Supabase RLS Policy (Action Required)

You need to apply the database migration to fix the RLS infinite recursion.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy and paste the contents of `supabase/migrations/20251203000002_fix_admin_rls_recursion.sql`
6. Click **"Run"** to execute the migration
7. You should see "Success. No rows returned"

#### Option B: Using Supabase CLI (If installed)

```bash
# If you have Supabase CLI installed
supabase db push
```

## What the Migration Does

The migration fixes the RLS policies to:
- ✅ Allow authenticated users to check their own admin status (breaks the recursion)
- ✅ Allow admins to view all admin records after verifying their status
- ✅ Allow super admins to manage other admins
- ✅ Allow the first admin to be created (bootstrap case)

## Testing After Fix

1. Apply the migration using one of the options above
2. Refresh your browser (or clear cookies if needed)
3. Navigate to http://localhost:3001/admin/login
4. Log in with your admin credentials
5. You should now be able to access the admin portal without redirect errors

## Verification

After applying the fix, you should see in the server logs:
- ✅ No more `Error checking admin status: infinite recursion detected in policy for relation "admins"`
- ✅ Successful navigation to `/admin` routes
- ✅ No more 307 redirect loops

## Need Help?

If you still experience issues:
1. Clear your browser cookies and cache
2. Make sure you have an admin user created in the `admins` table
3. Check that the admin user's `auth_id` matches their Supabase Auth UID
4. Verify that `is_active` is `true` for the admin user
