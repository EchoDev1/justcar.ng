# Admin Premium Features Setup Guide

This guide explains how to set up and use the new admin features for Premium Verified Collection, Just Arrived section, and Dealer Permissions management.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Admin Features Overview](#admin-features-overview)
3. [How to Use Each Feature](#how-to-use-each-feature)
4. [Dealer Permissions Management](#dealer-permissions-management)
5. [Best Practices](#best-practices)

---

## Database Setup

### Step 1: Run the Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire contents of `admin-features-migration.sql`
5. Paste and click **Run** (or press `Ctrl+Enter`)

This migration will:
- Add `is_premium_verified` column to cars table
- Add `is_just_arrived` column to cars table
- Add `just_arrived_date` column to track arrival date
- Create `dealer_permissions` table for access control
- Add `tier` column to dealers table
- Create indexes for better performance
- Set up Row Level Security (RLS) policies
- Create helper views and functions

### Step 2: Verify Migration Success

Run this query to verify all tables and columns exist:

```sql
-- Check cars table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cars'
AND column_name IN ('is_premium_verified', 'is_just_arrived', 'just_arrived_date');

-- Check dealer_permissions table exists
SELECT * FROM dealer_permissions LIMIT 1;

-- Check dealers table has tier column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dealers'
AND column_name = 'tier';
```

### Step 3: Set Up Cron Job (Optional)

To automatically expire old "Just Arrived" cars after 30 days, set up a cron job:

```sql
-- This function can be called daily via Supabase Edge Functions or external cron
SELECT expire_old_just_arrived_cars();
```

Consider setting up a Supabase Edge Function or using a service like cron-job.org to call this function daily.

---

## Admin Features Overview

### 1. Premium Verified Collection

**Purpose:** Showcase the highest quality, verified cars with premium placement.

**Benefits:**
- Enhanced visibility on homepage
- Exclusive section for top-tier vehicles
- Builds trust with customers
- Increases conversion rates

**Access:** `/admin/premium-verified`

### 2. Just Arrived Section

**Purpose:** Highlight newly arrived inventory to create urgency.

**Benefits:**
- Automatic 30-day expiration
- Fresh inventory visibility
- Creates urgency for buyers
- Encourages quick sales

**Access:** `/admin/just-arrived`

### 3. Dealer Permissions Management

**Purpose:** Control which dealers can access premium features.

**Benefits:**
- Fine-grained access control
- Set upload limits per dealer
- Track usage statistics
- Monetize premium features

**Access:** `/admin/dealer-permissions`

---

## How to Use Each Feature

### Adding a Car to Premium Verified Collection

1. Go to **Admin Panel** → **Add New Car** (or edit existing car)
2. Fill in all car details
3. Scroll to **Status & Placement** section
4. Check the **Premium Verified Collection** checkbox
5. Ensure the car is also marked as **Verified Car** (recommended)
6. Save the car

**Note:** Only cars from dealers with premium permissions can be added to this collection (unless you're an admin - admins have full access).

### Adding a Car to Just Arrived Section

1. Go to **Admin Panel** → **Add New Car** (or edit existing car)
2. Fill in all car details
3. Scroll to **Status & Placement** section
4. Check the **Just Arrived** checkbox
5. Save the car

**Note:**
- The arrival date is automatically set when you check this box
- Cars automatically expire after 30 days
- You'll see a countdown in the Just Arrived admin page

### Viewing and Managing Premium Cars

#### Premium Verified Cars

1. Go to **Admin Panel** → **Premium Verified**
2. View all premium verified cars
3. See dealer information and verification status
4. Edit or remove cars as needed
5. Monitor the collection size

#### Just Arrived Cars

1. Go to **Admin Panel** → **Just Arrived**
2. View all just arrived cars
3. See days remaining before expiration
4. Cars expiring soon (≤7 days) are highlighted in orange
5. Edit or manually remove cars as needed

---

## Dealer Permissions Management

### Understanding Dealer Permissions

Dealer permissions control access to three premium features:
1. **Premium Verified Collection** - Add cars to premium section
2. **Just Arrived Section** - Add cars to just arrived section
3. **Featured Listings** - Feature cars on homepage

Each permission can have a limit (0 = unlimited).

### Granting Permissions to a Dealer

1. Go to **Admin Panel** → **Permissions**
2. Find the dealer in the list
3. Click **Manage** button
4. Enable desired permissions by checking checkboxes:
   - ✅ Premium Verified Collection
   - ✅ Just Arrived Section
   - ✅ Featured Listings
5. Set limits for each permission (0 = unlimited)
6. Click **Save Permissions**

### Setting Upload Limits

Limits control how many cars a dealer can have in each section:

- **0** = Unlimited (dealer can add as many as they want)
- **5** = Dealer can have up to 5 cars in this section
- **10** = Dealer can have up to 10 cars in this section

**Example:**
- Premium Verified Limit: 3
- Dealer currently has: 2 premium cars
- Dealer can add: 1 more premium car

### Revoking Permissions

**Revoke All Permissions:**
1. Go to **Admin Panel** → **Permissions**
2. Find the dealer
3. Click **Revoke All** button
4. Confirm the action

**Revoke Individual Permission:**
1. Click **Manage** on the dealer
2. Uncheck the specific permission
3. Click **Save Permissions**

**Note:** Revoking permissions doesn't automatically remove existing cars from premium sections. You'll need to manually edit those cars.

### Monitoring Dealer Usage

The permissions table shows:
- Current usage vs. limit (e.g., "2 / 5" means 2 cars uploaded, 3 remaining)
- Which permissions are enabled (green checkmark) or disabled (gray X)
- Dealer verification status

---

## Best Practices

### Premium Verified Collection

✅ **Do:**
- Only add high-quality, thoroughly inspected cars
- Ensure dealer is verified before granting access
- Keep the collection curated and exclusive
- Regularly review and update the collection
- Use professional photos for all premium cars

❌ **Don't:**
- Add cars with incomplete information
- Grant unlimited access to new dealers
- Let the collection become too large (quality over quantity)

### Just Arrived Section

✅ **Do:**
- Add genuinely new inventory
- Use clear, recent photos
- Update arrival date when re-marking as just arrived
- Monitor expiration dates
- Remove or remark cars before they expire if still fresh

❌ **Don't:**
- Add old inventory as "just arrived"
- Let cars sit expired in the database
- Abuse the feature with constant re-marking

### Dealer Permissions

✅ **Do:**
- Start with low limits for new dealers (e.g., 2-3 cars)
- Increase limits based on performance and trust
- Regularly audit dealer usage
- Use permissions as a monetization strategy
- Document your permission criteria

❌ **Don't:**
- Grant unlimited access to everyone
- Forget to track dealer performance
- Ignore dealers exceeding their limits
- Change permissions without communication

### Monetization Ideas

1. **Tiered Plans:**
   - Basic: 0 premium features
   - Premium: 5 premium verified, 3 just arrived, 5 featured
   - Platinum: Unlimited all features

2. **Per-Listing Pricing:**
   - Charge per car added to premium sections
   - Charge monthly for access to premium features

3. **Time-Based:**
   - Monthly subscription for premium access
   - Annual plans with discount

---

## Admin Dashboard Overview

Your updated admin dashboard now shows:

1. **Total Cars** - All cars in the system
2. **Premium Verified** - Cars in premium collection (purple)
3. **Just Arrived** - Active just arrived cars (green)
4. **Verified Cars** - All verified cars (teal)
5. **Total Dealers** - All dealers (indigo)
6. **Recent (7 days)** - Cars added this week (orange)

Click any stat card to view that category.

---

## Navigation Structure

Your admin sidebar now includes:

- 🏠 **Dashboard** - Overview and statistics
- 📋 **All Cars** - View all car listings
- ➕ **Add New Car** - Create new listing
- ⭐ **Premium Verified** - Manage premium collection
- ⏰ **Just Arrived** - Manage just arrived section
- 👥 **Dealers** - Manage dealers
- 🛡️ **Permissions** - Manage dealer access

---

## Troubleshooting

### Issue: Can't add cars to premium sections

**Solution:**
1. Check if database migration completed successfully
2. Verify RLS policies are in place
3. Ensure you're logged in as admin
4. Check browser console for errors

### Issue: Dealer permissions not saving

**Solution:**
1. Verify `dealer_permissions` table exists
2. Check if dealer already has a permissions record
3. Check Supabase logs for errors
4. Ensure you have INSERT/UPDATE permissions

### Issue: Just Arrived cars not expiring

**Solution:**
1. Verify the trigger `set_just_arrived_date` exists
2. Manually run: `SELECT expire_old_just_arrived_cars();`
3. Set up daily cron job to run the expiration function
4. Check `just_arrived_date` column has correct dates

### Issue: Stats not showing on dashboard

**Solution:**
1. Check Supabase connection
2. Verify new columns exist in cars table
3. Clear browser cache
4. Check for console errors
5. Verify RLS policies allow public read access

---

## API Endpoints for Frontend

When displaying premium cars on the frontend:

### Get Premium Verified Cars

```javascript
const { data: premiumCars } = await supabase
  .from('cars')
  .select('*, dealers(name), car_images(image_url, is_primary)')
  .eq('is_premium_verified', true)
  .order('created_at', { ascending: false })
```

### Get Just Arrived Cars

```javascript
const { data: justArrivedCars } = await supabase
  .from('cars')
  .select('*, dealers(name), car_images(image_url, is_primary)')
  .eq('is_just_arrived', true)
  .order('just_arrived_date', { ascending: false })
```

### Check Dealer Permissions

```javascript
const { data: permissions } = await supabase
  .from('dealer_permissions')
  .select('*')
  .eq('dealer_id', dealerId)
  .single()
```

---

## Security Considerations

1. **Admin-Only Access:**
   - All new admin pages are protected by authentication
   - Only authenticated users can modify permissions
   - RLS policies enforce data security

2. **Dealer Limits:**
   - Frontend should validate dealer limits before allowing uploads
   - Backend validates via database constraints
   - Admins bypass all limits (full access)

3. **Data Integrity:**
   - Cascade deletes ensure orphaned records are cleaned up
   - Triggers maintain data consistency
   - Indexes improve query performance

---

## Support

If you encounter any issues:

1. Check this documentation first
2. Review the migration file: `admin-features-migration.sql`
3. Check Supabase logs for errors
4. Verify all environment variables are set
5. Test with a sample dealer account

---

## Summary

You now have complete admin control over:

✅ Premium Verified Collection - Showcase top-tier vehicles
✅ Just Arrived Section - Highlight new inventory
✅ Dealer Permissions - Control who can access premium features
✅ Upload Limits - Manage dealer quotas
✅ Usage Tracking - Monitor dealer activity

**Next Steps:**
1. Run the database migration
2. Test creating a premium verified car
3. Test adding a just arrived car
4. Grant permissions to a test dealer
5. Verify frontend displays premium sections correctly

Happy managing! 🚗✨
