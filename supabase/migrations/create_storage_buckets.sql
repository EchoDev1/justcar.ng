-- =====================================================
-- CRITICAL: Create Storage Buckets for Car Images & Videos
-- This migration creates the missing storage buckets
-- =====================================================

-- Create car-images bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

-- Create car-videos bucket (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-videos',
  'car-videos',
  true,
  209715200, -- 200MB limit
  ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-flv']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 209715200,
    allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-flv'];

-- =====================================================
-- Storage Policies for car-images bucket
-- =====================================================

-- Allow anyone to view car images (public read)
DROP POLICY IF EXISTS "Public read access for car images" ON storage.objects;
CREATE POLICY "Public read access for car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

-- Allow authenticated users to upload car images
DROP POLICY IF EXISTS "Authenticated users can upload car images" ON storage.objects;
CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update car images
DROP POLICY IF EXISTS "Authenticated users can update car images" ON storage.objects;
CREATE POLICY "Authenticated users can update car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete car images
DROP POLICY IF EXISTS "Authenticated users can delete car images" ON storage.objects;
CREATE POLICY "Authenticated users can delete car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-images'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Storage Policies for car-videos bucket
-- =====================================================

-- Allow anyone to view car videos (public read)
DROP POLICY IF EXISTS "Public read access for car videos" ON storage.objects;
CREATE POLICY "Public read access for car videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-videos');

-- Allow authenticated users to upload car videos
DROP POLICY IF EXISTS "Authenticated users can upload car videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload car videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-videos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update car videos
DROP POLICY IF EXISTS "Authenticated users can update car videos" ON storage.objects;
CREATE POLICY "Authenticated users can update car videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-videos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete car videos
DROP POLICY IF EXISTS "Authenticated users can delete car videos" ON storage.objects;
CREATE POLICY "Authenticated users can delete car videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-videos'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Verification
-- =====================================================
-- After running this migration, verify buckets exist:
-- SELECT id, name, public, file_size_limit FROM storage.buckets;
-- Expected output:
--   car-images  | car-images  | true | 52428800
--   car-videos  | car-videos  | true | 209715200
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets for car images and videos';
