-- =====================================================
-- ADMIN FEATURES MIGRATION
-- Add Premium Verified Collection, Just Arrived, and Dealer Permissions
-- =====================================================

-- =====================================================
-- STEP 1: Add new columns to cars table
-- =====================================================

-- Add is_premium_verified column for Premium Verified Collection
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS is_premium_verified BOOLEAN DEFAULT false;

-- Add is_just_arrived column for Just Arrived section
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS is_just_arrived BOOLEAN DEFAULT false;

-- Add just_arrived_date to track when car was marked as just arrived
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS just_arrived_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_cars_premium_verified ON cars(is_premium_verified);
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived ON cars(is_just_arrived);
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived_date ON cars(just_arrived_date DESC);

-- =====================================================
-- STEP 2: Create dealer_permissions table
-- Tracks what features dealers have access to
-- =====================================================

CREATE TABLE IF NOT EXISTS dealer_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,

  -- Permission flags
  can_upload_premium_verified BOOLEAN DEFAULT false,
  can_upload_just_arrived BOOLEAN DEFAULT false,
  can_upload_featured BOOLEAN DEFAULT false,

  -- Limits
  premium_verified_limit INTEGER DEFAULT 0, -- 0 means unlimited
  just_arrived_limit INTEGER DEFAULT 0,
  featured_limit INTEGER DEFAULT 0,

  -- Tracking
  granted_by UUID REFERENCES auth.users(id), -- Admin who granted permissions
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one permission record per dealer
  UNIQUE(dealer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dealer_permissions_dealer ON dealer_permissions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_permissions_premium ON dealer_permissions(can_upload_premium_verified);
CREATE INDEX IF NOT EXISTS idx_dealer_permissions_just_arrived ON dealer_permissions(can_upload_just_arrived);

-- =====================================================
-- STEP 3: Enable RLS on dealer_permissions
-- =====================================================

ALTER TABLE dealer_permissions ENABLE ROW LEVEL SECURITY;

-- Public can read dealer permissions (to show what dealers can do)
CREATE POLICY "Allow public read access to dealer_permissions"
  ON dealer_permissions
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can manage permissions
CREATE POLICY "Allow authenticated users to insert dealer_permissions"
  ON dealer_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update dealer_permissions"
  ON dealer_permissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete dealer_permissions"
  ON dealer_permissions
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- STEP 4: Add trigger for dealer_permissions updated_at
-- =====================================================

CREATE TRIGGER update_dealer_permissions_updated_at
  BEFORE UPDATE ON dealer_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: Create helper view for cars with all flags
-- =====================================================

CREATE OR REPLACE VIEW cars_admin_view AS
SELECT
  c.*,
  d.name as dealer_name,
  d.email as dealer_email,
  d.is_verified as dealer_verified,
  dp.can_upload_premium_verified,
  dp.can_upload_just_arrived,
  dp.can_upload_featured,
  dp.premium_verified_limit,
  dp.just_arrived_limit,
  dp.featured_limit,
  (
    SELECT COUNT(*)
    FROM cars c2
    WHERE c2.dealer_id = c.dealer_id
    AND c2.is_premium_verified = true
  ) as dealer_premium_count,
  (
    SELECT COUNT(*)
    FROM cars c3
    WHERE c3.dealer_id = c.dealer_id
    AND c3.is_just_arrived = true
  ) as dealer_just_arrived_count,
  (
    SELECT COUNT(*)
    FROM cars c4
    WHERE c4.dealer_id = c.dealer_id
    AND c4.is_featured = true
  ) as dealer_featured_count
FROM cars c
LEFT JOIN dealers d ON c.dealer_id = d.id
LEFT JOIN dealer_permissions dp ON d.id = dp.dealer_id;

-- =====================================================
-- STEP 6: Create function to auto-expire Just Arrived
-- Just Arrived cars should expire after 30 days
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_just_arrived_cars()
RETURNS void AS $$
BEGIN
  UPDATE cars
  SET
    is_just_arrived = false,
    just_arrived_date = NULL
  WHERE
    is_just_arrived = true
    AND just_arrived_date < (CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Create auto-update trigger for just_arrived_date
-- =====================================================

CREATE OR REPLACE FUNCTION update_just_arrived_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_just_arrived is being set to true and date is null, set the date
  IF NEW.is_just_arrived = true AND (OLD.is_just_arrived = false OR OLD.is_just_arrived IS NULL) THEN
    NEW.just_arrived_date = CURRENT_TIMESTAMP;
  END IF;

  -- If is_just_arrived is being set to false, clear the date
  IF NEW.is_just_arrived = false AND OLD.is_just_arrived = true THEN
    NEW.just_arrived_date = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_just_arrived_date
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_just_arrived_date();

-- =====================================================
-- STEP 8: Add dealers table enhancements
-- Track dealer tier/plan for automatic permissions
-- =====================================================

ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'platinum'));

ALTER TABLE dealers
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Index for tier
CREATE INDEX IF NOT EXISTS idx_dealers_tier ON dealers(tier);

-- =====================================================
-- STEP 9: Create default permissions for existing dealers
-- =====================================================

-- Insert default permissions for all existing dealers who don't have any
INSERT INTO dealer_permissions (dealer_id, can_upload_premium_verified, can_upload_just_arrived, can_upload_featured)
SELECT id, false, false, false
FROM dealers
WHERE id NOT IN (SELECT dealer_id FROM dealer_permissions);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Migration completed successfully!
-- New features added:
-- 1. Premium Verified Collection (is_premium_verified column)
-- 2. Just Arrived section (is_just_arrived, just_arrived_date columns)
-- 3. Dealer Permissions system (dealer_permissions table)
-- 4. Auto-expire function for old Just Arrived cars
-- 5. Dealer tiers (tier column in dealers)
-- 6. Helper views for admin management
--
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update frontend components to use new features
-- 3. Create admin UI for permission management
-- 4. Set up cron job to run expire_old_just_arrived_cars() daily
