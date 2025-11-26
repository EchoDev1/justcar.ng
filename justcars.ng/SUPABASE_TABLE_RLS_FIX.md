# Fix Supabase RLS Policies for Tables

The "Error fetching cars: {}" error is caused by missing Row Level Security (RLS) policies on your database tables.

## Problem
Your Supabase tables have RLS enabled but no policies are configured, preventing public access to data.

## Solution

### Option 1: Quick Fix - Disable RLS (Not Recommended for Production)

If you're just testing and don't need security:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE dealers DISABLE ROW LEVEL SECURITY;
ALTER TABLE car_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE car_videos DISABLE ROW LEVEL SECURITY;
```

### Option 2: Proper Fix - Add RLS Policies (Recommended)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- ========================================
-- CARS TABLE POLICIES
-- ========================================

-- Allow public to read all cars
CREATE POLICY "Allow public read access to cars"
ON cars FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert cars
CREATE POLICY "Allow authenticated users to insert cars"
ON cars FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update cars
CREATE POLICY "Allow authenticated users to update cars"
ON cars FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete cars
CREATE POLICY "Allow authenticated users to delete cars"
ON cars FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- DEALERS TABLE POLICIES
-- ========================================

-- Allow public to read all dealers
CREATE POLICY "Allow public read access to dealers"
ON dealers FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert dealers
CREATE POLICY "Allow authenticated users to insert dealers"
ON dealers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update dealers
CREATE POLICY "Allow authenticated users to update dealers"
ON dealers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete dealers
CREATE POLICY "Allow authenticated users to delete dealers"
ON dealers FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- CAR_IMAGES TABLE POLICIES
-- ========================================

-- Allow public to read all car images
CREATE POLICY "Allow public read access to car_images"
ON car_images FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert car images
CREATE POLICY "Allow authenticated users to insert car_images"
ON car_images FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update car images
CREATE POLICY "Allow authenticated users to update car_images"
ON car_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete car images
CREATE POLICY "Allow authenticated users to delete car_images"
ON car_images FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- CAR_VIDEOS TABLE POLICIES
-- ========================================

-- Allow public to read all car videos
CREATE POLICY "Allow public read access to car_videos"
ON car_videos FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert car videos
CREATE POLICY "Allow authenticated users to insert car_videos"
ON car_videos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update car videos
CREATE POLICY "Allow authenticated users to update car_videos"
ON car_videos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete car videos
CREATE POLICY "Allow authenticated users to delete car_videos"
ON car_videos FOR DELETE
TO authenticated
USING (true);
```

### Option 3: Check and Enable RLS

If RLS is not enabled, you may need to enable it first:

```sql
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_videos ENABLE ROW LEVEL SECURITY;
```

Then apply the policies from Option 2.

## How to Apply

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the SQL from Option 2 above
6. Click **Run** or press `Ctrl+Enter`

## Verify It Works

After applying the policies, refresh your application at http://localhost:3000/cars and the error should be gone!

## For More Secure Policies (Future)

You may want to restrict write access to admin users only:

```sql
-- Example: Only allow users with admin role to insert cars
CREATE POLICY "Only admins can insert cars"
ON cars FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);
```
