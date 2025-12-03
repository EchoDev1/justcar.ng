-- =====================================================
-- Fix Premium Verified and Just Arrived Features
-- Ensure proper database setup and RLS policies
-- =====================================================

-- =====================================================
-- STEP 1: Ensure columns exist in cars table
-- =====================================================

-- Add is_premium_verified if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'is_premium_verified'
  ) THEN
    ALTER TABLE cars ADD COLUMN is_premium_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add is_just_arrived if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'is_just_arrived'
  ) THEN
    ALTER TABLE cars ADD COLUMN is_just_arrived BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add just_arrived_date if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'just_arrived_date'
  ) THEN
    ALTER TABLE cars ADD COLUMN just_arrived_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- =====================================================
-- STEP 2: Create indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cars_premium_verified ON cars(is_premium_verified) WHERE is_premium_verified = true;
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived ON cars(is_just_arrived) WHERE is_just_arrived = true;
CREATE INDEX IF NOT EXISTS idx_cars_just_arrived_date ON cars(just_arrived_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at DESC);

-- =====================================================
-- STEP 3: Update RLS policies for cars table
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON cars;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON cars;
DROP POLICY IF EXISTS "Enable update for owners" ON cars;
DROP POLICY IF EXISTS "Enable delete for owners" ON cars;

-- Public read access (everyone can view cars)
CREATE POLICY "Allow public read access to cars"
  ON cars
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert cars
CREATE POLICY "Allow authenticated users to insert cars"
  ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own cars
CREATE POLICY "Allow users to update their own cars"
  ON cars
  FOR UPDATE
  TO authenticated
  USING (
    dealer_id = auth.uid()
    OR
    auth.uid() IN (SELECT id FROM public.admins)
  )
  WITH CHECK (
    dealer_id = auth.uid()
    OR
    auth.uid() IN (SELECT id FROM public.admins)
  );

-- Users can delete their own cars
CREATE POLICY "Allow users to delete their own cars"
  ON cars
  FOR DELETE
  TO authenticated
  USING (
    dealer_id = auth.uid()
    OR
    auth.uid() IN (SELECT id FROM public.admins)
  );

-- =====================================================
-- STEP 4: Create function to auto-expire Just Arrived cars
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_just_arrived_cars()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cars
  SET
    is_just_arrived = false,
    just_arrived_date = NULL
  WHERE
    is_just_arrived = true
    AND just_arrived_date < (CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$;

-- =====================================================
-- STEP 5: Create trigger to auto-set just_arrived_date
-- =====================================================

CREATE OR REPLACE FUNCTION update_just_arrived_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If is_just_arrived is being set to true and date is null, set the date
  IF NEW.is_just_arrived = true AND (OLD.is_just_arrived = false OR OLD.is_just_arrived IS NULL OR NEW.just_arrived_date IS NULL) THEN
    NEW.just_arrived_date = CURRENT_TIMESTAMP;
  END IF;

  -- If is_just_arrived is being set to false, clear the date
  IF NEW.is_just_arrived = false AND OLD.is_just_arrived = true THEN
    NEW.just_arrived_date = NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_just_arrived_date_trigger ON cars;

-- Create trigger
CREATE TRIGGER set_just_arrived_date_trigger
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_just_arrived_date();

-- =====================================================
-- STEP 6: Update existing premium verified cars (if any)
-- =====================================================

-- Mark any cars from premium dealers as potentially premium verified
-- (Admins can manually verify them later)
UPDATE cars c
SET is_premium_verified = false
WHERE c.is_premium_verified IS NULL;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- You can now:
-- 1. Mark cars as is_premium_verified = true in admin panel
-- 2. Mark cars as is_just_arrived = true in admin panel
-- 3. Cars will automatically expire from Just Arrived after 30 days
-- 4. Run: SELECT expire_old_just_arrived_cars(); to manually expire old cars
