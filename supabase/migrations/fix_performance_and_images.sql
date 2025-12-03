-- ============================================================================
-- Performance Optimization and Image Fix Migration
-- This migration adds indexes for better query performance and fixes storage permissions
-- ============================================================================

-- Create indexes for better query performance
-- ============================================================================

-- Index on cars table for common queries
CREATE INDEX IF NOT EXISTS idx_cars_is_just_arrived ON cars(is_just_arrived) WHERE is_just_arrived = true;
CREATE INDEX IF NOT EXISTS idx_cars_is_premium_verified ON cars(is_premium_verified) WHERE is_premium_verified = true;
CREATE INDEX IF NOT EXISTS idx_cars_is_featured ON cars(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cars_is_verified ON cars(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_cars_dealer_id ON cars(dealer_id);
CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(location);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived_date ON cars(just_arrived_date DESC) WHERE is_just_arrived = true;

-- Index on car_images for faster image lookups
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_images_is_primary ON car_images(car_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_car_images_display_order ON car_images(car_id, display_order);

-- Index on dealers for badge filtering
CREATE INDEX IF NOT EXISTS idx_dealers_badge_type ON dealers(badge_type) WHERE badge_type IN ('premium', 'luxury');
CREATE INDEX IF NOT EXISTS idx_dealers_is_verified ON dealers(is_verified) WHERE is_verified = true;

-- Index on buyer_saved_cars for faster lookups
CREATE INDEX IF NOT EXISTS idx_buyer_saved_cars_buyer_id ON buyer_saved_cars(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_saved_cars_car_id ON buyer_saved_cars(car_id);
CREATE INDEX IF NOT EXISTS idx_buyer_saved_cars_created_at ON buyer_saved_cars(created_at DESC);

-- Composite index for common car queries
CREATE INDEX IF NOT EXISTS idx_cars_composite_search ON cars(make, model, location, is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_cars_composite_price_year ON cars(price, year, created_at DESC);

-- ============================================================================
-- Storage Policies for car-images bucket
-- ============================================================================

-- Enable public access to car images
-- This allows images to be displayed without authentication
DO $$
BEGIN
  -- Set car-images bucket to public if it exists
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'car-images';

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'car-images bucket might not exist yet, skipping public access setup';
END $$;

-- Create storage policy for public read access to car images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access to Car Images" ON storage.objects;

  CREATE POLICY "Public Access to Car Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists, skipping';
END $$;

-- Create storage policy for authenticated uploads to car images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated Users Can Upload Car Images" ON storage.objects;

  CREATE POLICY "Authenticated Users Can Upload Car Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');

  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists, skipping';
END $$;

-- Create storage policy for authenticated updates to car images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated Users Can Update Car Images" ON storage.objects;

  CREATE POLICY "Authenticated Users Can Update Car Images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');

  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists, skipping';
END $$;

-- Create storage policy for authenticated deletions of car images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated Users Can Delete Car Images" ON storage.objects;

  CREATE POLICY "Authenticated Users Can Delete Car Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');

  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists, skipping';
END $$;

-- ============================================================================
-- Optimize existing tables
-- ============================================================================

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add views column to cars if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='views') THEN
    ALTER TABLE cars ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- ============================================================================
-- Create function to clean up expired just arrived cars
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_just_arrived_cars()
RETURNS void AS $$
BEGIN
  -- Set is_just_arrived to false for cars older than 30 days
  UPDATE cars
  SET is_just_arrived = false,
      just_arrived_date = NULL
  WHERE is_just_arrived = true
    AND just_arrived_date < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create scheduled job to run cleanup (if pg_cron is available)
-- ============================================================================

-- Note: This requires pg_cron extension which might not be available on all Supabase plans
-- If not available, you can manually run: SELECT cleanup_expired_just_arrived_cars();
DO $$
BEGIN
  -- Try to create a cron job to run daily at midnight
  PERFORM cron.schedule(
    'cleanup-expired-just-arrived',
    '0 0 * * *', -- Midnight every day
    'SELECT cleanup_expired_just_arrived_cars();'
  );

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension not available, manual cleanup required';
END $$;

-- ============================================================================
-- Analyze tables for better query planning
-- ============================================================================

ANALYZE cars;
ANALYZE car_images;
ANALYZE dealers;
ANALYZE buyer_saved_cars;

-- ============================================================================
-- End of migration
-- ============================================================================

COMMENT ON INDEX idx_cars_is_just_arrived IS 'Optimizes queries for just arrived cars';
COMMENT ON INDEX idx_cars_just_arrived_date IS 'Optimizes sorting of just arrived cars by date';
COMMENT ON FUNCTION cleanup_expired_just_arrived_cars IS 'Automatically removes just_arrived status from cars older than 30 days';
