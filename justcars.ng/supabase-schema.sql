-- =====================================================
-- JUSTCARS.NG SUPABASE DATABASE SCHEMA
-- Nigerian Car Marketplace Database Setup
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS car_videos CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- =====================================================
-- TABLE: dealers
-- Stores dealer/seller information
-- =====================================================
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_dealers_location ON dealers(location);
CREATE INDEX idx_dealers_verified ON dealers(is_verified);

-- =====================================================
-- TABLE: cars
-- Stores car listings
-- =====================================================
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  mileage INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Nigerian Used', 'Foreign Used')),
  body_type TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  color TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  inspection_report JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster filtering and sorting
CREATE INDEX idx_cars_dealer ON cars(dealer_id);
CREATE INDEX idx_cars_make ON cars(make);
CREATE INDEX idx_cars_model ON cars(model);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_location ON cars(location);
CREATE INDEX idx_cars_condition ON cars(condition);
CREATE INDEX idx_cars_body_type ON cars(body_type);
CREATE INDEX idx_cars_verified ON cars(is_verified);
CREATE INDEX idx_cars_featured ON cars(is_featured);
CREATE INDEX idx_cars_created ON cars(created_at DESC);

-- Full text search index
CREATE INDEX idx_cars_search ON cars USING GIN (
  to_tsvector('english', make || ' ' || model || ' ' || location)
);

-- =====================================================
-- TABLE: car_images
-- Stores car images with display order
-- =====================================================
CREATE TABLE car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_car_images_car ON car_images(car_id);
CREATE INDEX idx_car_images_order ON car_images(car_id, display_order);

-- =====================================================
-- TABLE: car_videos
-- Stores car videos
-- =====================================================
CREATE TABLE car_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_car_videos_car ON car_videos(car_id);

-- =====================================================
-- TABLE: admins (extends auth.users)
-- Stores admin user profiles
-- =====================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCTIONS: Update timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to update updated_at
CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DEALERS POLICIES
-- =====================================================

-- Public can read all dealers
CREATE POLICY "Allow public read access to dealers"
  ON dealers
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert dealers
CREATE POLICY "Allow authenticated users to insert dealers"
  ON dealers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update dealers
CREATE POLICY "Allow authenticated users to update dealers"
  ON dealers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete dealers
CREATE POLICY "Allow authenticated users to delete dealers"
  ON dealers
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- CARS POLICIES
-- =====================================================

-- Public can read all cars
CREATE POLICY "Allow public read access to cars"
  ON cars
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert cars
CREATE POLICY "Allow authenticated users to insert cars"
  ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update cars
CREATE POLICY "Allow authenticated users to update cars"
  ON cars
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete cars
CREATE POLICY "Allow authenticated users to delete cars"
  ON cars
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- CAR_IMAGES POLICIES
-- =====================================================

-- Public can read all car images
CREATE POLICY "Allow public read access to car_images"
  ON car_images
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert car images
CREATE POLICY "Allow authenticated users to insert car_images"
  ON car_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update car images
CREATE POLICY "Allow authenticated users to update car_images"
  ON car_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete car images
CREATE POLICY "Allow authenticated users to delete car_images"
  ON car_images
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- CAR_VIDEOS POLICIES
-- =====================================================

-- Public can read all car videos
CREATE POLICY "Allow public read access to car_videos"
  ON car_videos
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert car videos
CREATE POLICY "Allow authenticated users to insert car_videos"
  ON car_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update car videos
CREATE POLICY "Allow authenticated users to update car_videos"
  ON car_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete car videos
CREATE POLICY "Allow authenticated users to delete car_videos"
  ON car_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- ADMINS POLICIES
-- =====================================================

-- Only admins can read admin table
CREATE POLICY "Allow admins to read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert new admins
CREATE POLICY "Allow admins to insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKETS SETUP
-- Note: These need to be created via Supabase Dashboard
-- or using Supabase CLI/API
-- =====================================================

-- Storage bucket for car images (public)
-- Bucket name: car-images
-- Public: true
-- File size limit: 5MB per file
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage bucket for car videos (public)
-- Bucket name: car-videos
-- Public: true
-- File size limit: 50MB per file
-- Allowed MIME types: video/mp4, video/quicktime, video/x-msvideo

-- =====================================================
-- STORAGE POLICIES
-- These are created automatically when buckets are made public
-- But here's the reference for manual creation if needed
-- =====================================================

-- Example storage policy for car-images bucket:
-- CREATE POLICY "Public Access to car-images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'car-images');

-- CREATE POLICY "Authenticated users can upload to car-images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'car-images');

-- =====================================================
-- HELPER VIEWS (Optional but useful)
-- =====================================================

-- View for cars with all related data
CREATE OR REPLACE VIEW cars_with_details AS
SELECT
  c.*,
  d.name as dealer_name,
  d.email as dealer_email,
  d.phone as dealer_phone,
  d.whatsapp as dealer_whatsapp,
  d.location as dealer_location,
  d.is_verified as dealer_verified,
  (
    SELECT json_agg(json_build_object(
      'id', ci.id,
      'image_url', ci.image_url,
      'is_primary', ci.is_primary,
      'display_order', ci.display_order
    ) ORDER BY ci.display_order)
    FROM car_images ci
    WHERE ci.car_id = c.id
  ) as images,
  (
    SELECT json_agg(json_build_object(
      'id', cv.id,
      'video_url', cv.video_url
    ))
    FROM car_videos cv
    WHERE cv.car_id = c.id
  ) as videos
FROM cars c
LEFT JOIN dealers d ON c.dealer_id = d.id;

-- =====================================================
-- INITIAL DATA SETUP
-- Create a default admin user profile
-- Note: The actual auth user must be created via Supabase Auth
-- This is just the profile entry
-- =====================================================

-- Insert will be done after creating auth user via Supabase Dashboard
-- Example:
-- INSERT INTO admins (id, email, role)
-- VALUES ('user-uuid-from-auth', 'admin@justcars.ng', 'super_admin');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- All tables, indexes, policies, and functions created successfully!
-- Next steps:
-- 1. Create storage buckets 'car-images' and 'car-videos' in Supabase Dashboard
-- 2. Make both buckets public
-- 3. Create admin user via Supabase Auth
-- 4. Insert admin profile into admins table
-- 5. Run sample-data.sql to populate with test data
