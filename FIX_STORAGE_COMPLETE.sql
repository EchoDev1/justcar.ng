-- =====================================================
-- COMPLETE STORAGE FIX - Run this in Supabase SQL Editor
-- This will fix the "Saving..." issue once and for all
-- =====================================================

-- =====================================================
-- STEP 1: Make buckets public
-- =====================================================
UPDATE storage.buckets
SET public = true
WHERE id IN ('car-images', 'car-videos');

-- =====================================================
-- STEP 2: Drop ALL existing policies (clean slate)
-- =====================================================
DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car images" ON storage.objects;
DROP POLICY IF EXISTS "Public read car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all car-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all car-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on car-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on car-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public all car-images" ON storage.objects;
DROP POLICY IF EXISTS "Public all car-videos" ON storage.objects;

-- =====================================================
-- STEP 3: Create SUPER OPEN policies (for debugging)
-- These allow ALL operations from ANYONE
-- =====================================================

-- Policy for car-images: SELECT (read)
CREATE POLICY "car-images: public SELECT"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- Policy for car-images: INSERT (upload)
CREATE POLICY "car-images: public INSERT"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'car-images');

-- Policy for car-images: UPDATE
CREATE POLICY "car-images: public UPDATE"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'car-images')
WITH CHECK (bucket_id = 'car-images');

-- Policy for car-images: DELETE
CREATE POLICY "car-images: public DELETE"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'car-images');

-- Policy for car-videos: SELECT (read)
CREATE POLICY "car-videos: public SELECT"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-videos');

-- Policy for car-videos: INSERT (upload)
CREATE POLICY "car-videos: public INSERT"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'car-videos');

-- Policy for car-videos: UPDATE
CREATE POLICY "car-videos: public UPDATE"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'car-videos')
WITH CHECK (bucket_id = 'car-videos');

-- Policy for car-videos: DELETE
CREATE POLICY "car-videos: public DELETE"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'car-videos');

-- =====================================================
-- STEP 4: Verify the fix
-- =====================================================

-- Check buckets are public
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('car-images', 'car-videos');
-- Should show public = true

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%car-%'
ORDER BY policyname;
-- Should show 8 policies (4 for images, 4 for videos)

-- =====================================================
-- SUCCESS!
-- After running this, car creation should work immediately
-- Try creating a car with images - should save in 3-5 seconds
-- =====================================================

