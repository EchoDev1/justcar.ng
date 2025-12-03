# Admin Authentication Setup - Complete Guide

## Overview
This guide will help you set up admin authentication for your JustCars.ng application. The system uses Supabase Auth with a dedicated `admins` table for role-based access control.

---

## Issues Fixed

### 1. **AuthSessionMissingError** ✅
- **Problem**: Client-side admin pages (escrow, payment-accounts) were checking auth even though the admin layout already protects them
- **Solution**: Remove redundant auth checks from client components - the layout handles all authentication

### 2. **SQL Error: "column auth_id does not exist"** ✅
- **Problem**: The `admins` table hasn't been created yet
- **Solution**: Run the SQL migration provided below

---

## Quick Setup (3 Steps)

### Step 1: Run the SQL Migration

#### Option A: Using Supabase Dashboard (Recommended)
1. Open your Supabase Dashboard: https://app.supabase.com
2. Navigate to: **SQL Editor** (left sidebar)
3. Click "New Query"
4. Copy and paste the contents of: `QUICK_ADMIN_SETUP.sql`
5. Click "Run" (or press Cmd+Enter / Ctrl+Enter)

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI installed
npx supabase migration up
```

### Step 2: Link Your Auth User to Admins Table

1. Go to: **Authentication → Users** in Supabase Dashboard
2. Find your authenticated admin user
3. Copy their **UUID** (looks like: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)
4. Go back to **SQL Editor**
5. Run this query (replace the placeholders):

```sql
INSERT INTO public.admins (auth_id, email, full_name, role, permissions, is_active)
VALUES (
  'YOUR_USER_UUID_HERE',  -- ⚠️ Paste the UUID you copied
  'your-email@example.com',  -- ⚠️ Your actual email
  'Your Full Name',  -- ⚠️ Your actual name
  'super_admin',
  '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars", "manage_escrow", "manage_payments", "manage_inspections", "manage_chats"]'::jsonb,
  true
);
```

6. Click "Run"

### Step 3: Verify Setup

Run this query to check if your admin was created:

```sql
SELECT id, email, full_name, role, is_active, created_at
FROM public.admins;
```

If you see your email in the results, you're all set! ✅

---

## Testing the Admin Login

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter your admin credentials (email + password)
3. You should be redirected to: `http://localhost:3000/admin`
4. You should see the admin dashboard with statistics

---

## Architecture Overview

### Admin Authentication Flow

```
1. User visits /admin/* (any admin page)
   ↓
2. Admin Layout (app/admin/layout.js) intercepts
   ↓
3. Checks if user has valid session + is in admins table
   ↓
4. If YES: Render admin page
   If NO:  Redirect to /admin/login
```

### File Structure

```
app/
├── admin/
│   ├── layout.js          ← Protects ALL admin pages (server-side)
│   ├── login/
│   │   ├── layout.js      ← Bypasses auth check for login page
│   │   └── page.js        ← Login form (client component)
│   ├── page.js            ← Dashboard (server component)
│   ├── cars/page.js       ← Cars management (server component)
│   ├── dealers/page.js    ← Dealers management (server component)
│   ├── escrow/page.js     ← Escrow management (client component)
│   ├── payment-accounts/  ← Payment settings (client component)
│   ├── chats/page.js
│   ├── inspections/page.js
│   └── ...
lib/
└── supabase/
    └── auth-utils.js      ← Helper functions for auth
supabase/
└── migrations/
    └── 20251203000001_create_admins_table.sql
```

### Key Components

#### 1. Admin Layout Protection (`app/admin/layout.js`)
```javascript
// Server-side protection for ALL admin pages
export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const admin = await getAdminUser(supabase)  // Checks both auth + admins table

  if (!admin) {
    redirect('/admin/login')  // Redirect if not admin
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

#### 2. Auth Helper Functions (`lib/supabase/auth-utils.js`)
- `safeGetUser(supabase)` - Safely gets authenticated user (no errors)
- `getAdminUser(supabase)` - Gets admin record if user is an active admin
- `isAdmin(supabase)` - Returns true/false for admin status

#### 3. Admin Login Page (`app/admin/login/page.js`)
- Client component with email/password form
- Handles auth errors gracefully
- Redirects to `/admin` on success

---

## Database Schema

### `admins` Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `auth_id` | UUID | Foreign key to auth.users (UNIQUE) |
| `email` | VARCHAR(255) | Admin email (UNIQUE) |
| `full_name` | VARCHAR(255) | Admin full name |
| `phone` | VARCHAR(20) | Phone number (optional) |
| `avatar_url` | TEXT | Avatar image URL (optional) |
| `role` | VARCHAR(50) | Role: 'super_admin', 'admin', or 'moderator' |
| `is_active` | BOOLEAN | Whether admin can login |
| `permissions` | JSONB | Array of permission strings |
| `last_login_at` | TIMESTAMPTZ | Last login timestamp |
| `last_activity_at` | TIMESTAMPTZ | Last activity timestamp |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Row Level Security (RLS) Policies

1. **Admins can view all admins**: Active admins can SELECT all admin records
2. **Super admins can insert admins**: Only super_admins can create new admins
3. **Super admins can update admins**: Only super_admins can update other admins
4. **Admins can update own profile**: Any admin can update their own profile

---

## Admin Roles & Permissions

### Roles

- **super_admin**: Full access to everything, can manage other admins
- **admin**: Can manage cars, dealers, escrow, payments
- **moderator**: Can moderate content, view reports (limited access)

### Permission Examples

```json
[
  "read",
  "write",
  "delete",
  "manage_users",
  "manage_dealers",
  "manage_cars",
  "manage_escrow",
  "manage_payments",
  "manage_inspections",
  "manage_chats"
]
```

---

## Troubleshooting

### Issue: "AuthSessionMissingError" in Console

**Solution**: This is expected if you're not logged in. The error is caught gracefully and redirects to `/admin/login`. No action needed.

### Issue: "Column auth_id does not exist"

**Solution**: You haven't run the SQL migration yet. Go to Step 1 above.

### Issue: "Invalid login credentials"

**Possible causes**:
1. Wrong email/password
2. User not created in Supabase Auth
3. User not linked to admins table

**Solution**:
1. Verify user exists in: Authentication → Users
2. Run Step 2 above to link user to admins table

### Issue: Login successful but redirected back to login

**Cause**: User is authenticated but not in the admins table

**Solution**: Run the INSERT query from Step 2 to add user to admins table

### Issue: Can't access admin pages after login

**Cause**: User might not be marked as active

**Solution**: Run this query to activate the user:
```sql
UPDATE public.admins
SET is_active = true
WHERE email = 'your-email@example.com';
```

---

## Security Best Practices

1. ✅ **Use environment variables** for Supabase credentials
2. ✅ **Enable Row Level Security** on all admin-accessible tables
3. ✅ **Never expose service role key** to client-side code
4. ✅ **Use HTTPS** in production
5. ✅ **Implement rate limiting** on login endpoint
6. ✅ **Log all admin actions** for audit trails
7. ✅ **Regularly review admin permissions**

---

## Next Steps

1. ✅ Complete the 3-step setup above
2. ✅ Test admin login at `/admin/login`
3. ✅ Create additional admin users (via SQL or build an admin user management UI)
4. 🔄 Implement audit logging for admin actions
5. 🔄 Add two-factor authentication (2FA) for admins
6. 🔄 Build admin user management interface in the dashboard

---

## Files Created/Modified

### New Files
- ✅ `supabase/migrations/20251203000001_create_admins_table.sql`
- ✅ `QUICK_ADMIN_SETUP.sql` (simplified version)
- ✅ `scripts/setup-admin.js` (automated setup script)
- ✅ `lib/supabase/auth-utils.js`
- ✅ `app/admin/login/layout.js`
- ✅ `ADMIN_SETUP_COMPLETE.md` (this file)

### Modified Files
- ✅ `app/admin/layout.js` - Added admin authentication protection
- ✅ `app/admin/login/page.js` - Improved error handling

---

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your Supabase connection in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Check Supabase logs in Dashboard → Database → Logs
4. Review this guide for troubleshooting steps

---

## Summary

✅ **Admin table created** with RLS policies
✅ **Auth helper functions** for safe authentication
✅ **Admin layout protection** on all admin pages
✅ **Login page** with error handling
✅ **Client-side auth checks removed** from protected pages

Your admin authentication system is now properly configured! 🎉

Login at: `http://localhost:3000/admin/login`
