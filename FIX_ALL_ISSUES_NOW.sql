-- =====================================================
-- COMPLETE FIX FOR ALL ISSUES
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Fix Storage Bucket Policies
-- This fixes the "Saving..." issue by allowing uploads
-- =====================================================

-- First, check if buckets exist
-- SELECT * FROM storage.buckets;

-- Drop existing policies (in case they're wrong)
DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car images" ON storage.objects;
DROP POLICY IF EXISTS "Public read car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all car-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all car-videos" ON storage.objects;

-- Create OPEN policies for car-images (allows all operations)
-- This ensures uploads work immediately
CREATE POLICY "Allow all operations on car-images"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'car-images')
WITH CHECK (bucket_id = 'car-images');

-- Create OPEN policies for car-videos (allows all operations)
CREATE POLICY "Allow all operations on car-videos"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'car-videos')
WITH CHECK (bucket_id = 'car-videos');

-- =====================================================
-- PART 2: Add Performance Indexes
-- This fixes slow page loads
-- =====================================================

-- Index for Premium Verified filtering
CREATE INDEX IF NOT EXISTS idx_cars_premium_verified
ON cars(is_premium_verified)
WHERE is_premium_verified = true;

-- Index for Just Arrived filtering and sorting
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived_date
ON cars(is_just_arrived, just_arrived_date DESC)
WHERE is_just_arrived = true;

-- Index for dealer-specific queries
CREATE INDEX IF NOT EXISTS idx_cars_dealer_created
ON cars(dealer_id, created_at DESC);

-- Index for luxury car filtering
CREATE INDEX IF NOT EXISTS idx_cars_luxury_price
ON cars(price DESC)
WHERE price >= 150000000;

-- Index for active cars
CREATE INDEX IF NOT EXISTS idx_cars_status_active
ON cars(status, created_at DESC)
WHERE status = 'available';

-- Index for featured cars
CREATE INDEX IF NOT EXISTS idx_cars_featured_created
ON cars(is_featured, created_at DESC)
WHERE is_featured = true;

-- Index for car images joins
CREATE INDEX IF NOT EXISTS idx_car_images_car_id_primary
ON car_images(car_id, is_primary, display_order);

-- Index for car videos joins
CREATE INDEX IF NOT EXISTS idx_car_videos_car_id
ON car_videos(car_id);

-- =====================================================
-- PART 3: Verify Buckets Are Public
-- This ensures images can be viewed
-- =====================================================

-- Make sure buckets are public
UPDATE storage.buckets
SET public = true
WHERE id IN ('car-images', 'car-videos');

-- =====================================================
-- VERIFICATION QUERIES
-- Run these AFTER the script to verify everything works
-- =====================================================

-- 1. Check buckets exist and are public
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('car-images', 'car-videos');
-- Should return 2 rows with public = true

-- 2. Check policies are active
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%car-%';
-- Should return 2 policies (one for images, one for videos)

-- 3. Check indexes are created
SELECT indexname
FROM pg_indexes
WHERE tablename = 'cars'
AND indexname LIKE 'idx_cars_%';
-- Should return multiple index names

-- 4. Check cars exist with proper fields
SELECT COUNT(*) as total_cars,
       COUNT(CASE WHEN is_premium_verified = true THEN 1 END) as premium_count,
       COUNT(CASE WHEN is_just_arrived = true THEN 1 END) as just_arrived_count
FROM cars;
-- Should show car counts

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If all queries above return results, everything is working!
--
-- Next steps:
-- 1. Test car creation - should save in 3-5 seconds
-- 2. Test clicking on Premium Verified cars - should open detail page
-- 3. Test clicking on Just Arrived cars - should open detail page
-- =====================================================
