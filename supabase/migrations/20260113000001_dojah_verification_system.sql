-- ============================================================================
-- DOJAH VERIFICATION SYSTEM
-- Date: 2026-01-13
-- ============================================================================
-- This migration creates an advanced verification system using Dojah API:
-- 1. NIN (National Identification Number) verification
-- 2. BVN (Bank Verification Number) verification
-- 3. CAC (Corporate Affairs Commission) business verification
-- 4. Vehicle stolen/plate verification
-- 5. Three-tier verification badges: Basic -> Verified -> Trusted Seller
-- ============================================================================

-- ============================================================================
-- 1. DEALER VERIFICATION TIERS TABLE
-- ============================================================================
-- Stores detailed verification data for each dealer

CREATE TABLE IF NOT EXISTS dealer_verification_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,

  -- Verification Tier: basic (unverified) -> verified -> trusted_seller
  tier VARCHAR(20) NOT NULL DEFAULT 'basic'
    CHECK (tier IN ('basic', 'verified', 'trusted_seller')),

  -- NIN Verification (National Identification Number)
  nin_number VARCHAR(20),
  nin_verified BOOLEAN DEFAULT false,
  nin_verified_at TIMESTAMPTZ,
  nin_dojah_reference VARCHAR(255),
  nin_first_name VARCHAR(100),
  nin_last_name VARCHAR(100),
  nin_middle_name VARCHAR(100),
  nin_date_of_birth DATE,
  nin_gender VARCHAR(10),
  nin_photo_url TEXT,
  nin_data JSONB DEFAULT '{}'::jsonb,

  -- BVN Verification (Bank Verification Number)
  bvn_number VARCHAR(20),
  bvn_verified BOOLEAN DEFAULT false,
  bvn_verified_at TIMESTAMPTZ,
  bvn_dojah_reference VARCHAR(255),
  bvn_first_name VARCHAR(100),
  bvn_last_name VARCHAR(100),
  bvn_phone_number VARCHAR(20),
  bvn_data JSONB DEFAULT '{}'::jsonb,

  -- CAC Verification (Corporate Affairs Commission)
  cac_number VARCHAR(50),
  cac_verified BOOLEAN DEFAULT false,
  cac_verified_at TIMESTAMPTZ,
  cac_dojah_reference VARCHAR(255),
  cac_business_name VARCHAR(255),
  cac_registration_date DATE,
  cac_business_type VARCHAR(100),
  cac_business_address TEXT,
  cac_directors JSONB DEFAULT '[]'::jsonb,
  cac_data JSONB DEFAULT '{}'::jsonb,

  -- Director/Owner name matching (CAC directors vs NIN/BVN name)
  owner_name_match BOOLEAN DEFAULT false,
  owner_name_match_score NUMERIC(5, 2) DEFAULT 0,

  -- Overall verification score (0-100)
  verification_score INTEGER DEFAULT 0,

  -- Admin override
  admin_verified BOOLEAN DEFAULT false,
  admin_verified_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_verified_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(dealer_id)
);

-- ============================================================================
-- 2. DOJAH API LOGS TABLE
-- ============================================================================
-- Audit trail for all Dojah API calls (for debugging and cost tracking)

CREATE TABLE IF NOT EXISTS dojah_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity reference (dealer, buyer, or car being verified)
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('dealer', 'buyer', 'car')),
  entity_id UUID NOT NULL,

  -- API call details
  api_endpoint VARCHAR(255) NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  response_status INTEGER,

  -- Verification type
  verification_type VARCHAR(30) NOT NULL CHECK (verification_type IN (
    'nin_lookup',
    'nin_verify',
    'nin_phone_verify',
    'bvn_lookup',
    'bvn_verify',
    'bvn_advance',
    'cac_lookup',
    'cac_verify',
    'cac_advance',
    'vehicle_plate_check',
    'vehicle_stolen_check',
    'vehicle_vin_check'
  )),

  -- Result
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  error_code VARCHAR(50),

  -- Cost tracking (Dojah charges per API call)
  api_cost_units INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. VEHICLE VERIFICATIONS TABLE
-- ============================================================================
-- Stores vehicle verification results (plate lookup, stolen check)

CREATE TABLE IF NOT EXISTS vehicle_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,

  -- Vehicle identifiers
  plate_number VARCHAR(20),
  vin_number VARCHAR(50),
  engine_number VARCHAR(50),
  chassis_number VARCHAR(50),

  -- Plate verification results
  plate_verified BOOLEAN DEFAULT false,
  plate_verified_at TIMESTAMPTZ,
  plate_owner_name VARCHAR(255),
  plate_vehicle_make VARCHAR(100),
  plate_vehicle_model VARCHAR(100),
  plate_vehicle_year INTEGER,
  plate_vehicle_color VARCHAR(50),
  plate_dojah_reference VARCHAR(255),
  plate_data JSONB DEFAULT '{}'::jsonb,

  -- VIN verification results
  vin_verified BOOLEAN DEFAULT false,
  vin_verified_at TIMESTAMPTZ,
  vin_data JSONB DEFAULT '{}'::jsonb,

  -- Stolen vehicle check
  stolen_check_passed BOOLEAN,
  stolen_check_date TIMESTAMPTZ,
  stolen_check_reference VARCHAR(255),
  stolen_report_found BOOLEAN DEFAULT false,
  stolen_report_details JSONB DEFAULT '{}'::jsonb,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'failed')),
  flagged_reason TEXT,

  -- Admin review
  admin_reviewed BOOLEAN DEFAULT false,
  admin_reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(car_id)
);

-- ============================================================================
-- 4. UPDATE DEALERS TABLE WITH VERIFICATION COLUMNS
-- ============================================================================

-- Add verification_tier column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='verification_tier') THEN
    ALTER TABLE dealers ADD COLUMN verification_tier VARCHAR(20) DEFAULT 'basic'
    CHECK (verification_tier IN ('basic', 'verified', 'trusted_seller'));
  END IF;
END $$;

-- Add NIN verification status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='nin_verified') THEN
    ALTER TABLE dealers ADD COLUMN nin_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add BVN verification status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='bvn_verified') THEN
    ALTER TABLE dealers ADD COLUMN bvn_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add CAC verification status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='cac_verified') THEN
    ALTER TABLE dealers ADD COLUMN cac_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add verification score
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='verification_score') THEN
    ALTER TABLE dealers ADD COLUMN verification_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- 5. UPDATE CARS TABLE WITH VERIFICATION STATUS
-- ============================================================================

-- Add vehicle_verified column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='vehicle_verified') THEN
    ALTER TABLE cars ADD COLUMN vehicle_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add stolen_check_passed column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='stolen_check_passed') THEN
    ALTER TABLE cars ADD COLUMN stolen_check_passed BOOLEAN;
  END IF;
END $$;

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dealer_verification_tiers_dealer ON dealer_verification_tiers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_verification_tiers_tier ON dealer_verification_tiers(tier);
CREATE INDEX IF NOT EXISTS idx_dealer_verification_tiers_nin ON dealer_verification_tiers(nin_verified);
CREATE INDEX IF NOT EXISTS idx_dealer_verification_tiers_bvn ON dealer_verification_tiers(bvn_verified);
CREATE INDEX IF NOT EXISTS idx_dealer_verification_tiers_cac ON dealer_verification_tiers(cac_verified);

CREATE INDEX IF NOT EXISTS idx_dojah_api_logs_entity ON dojah_api_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_dojah_api_logs_type ON dojah_api_logs(verification_type);
CREATE INDEX IF NOT EXISTS idx_dojah_api_logs_created ON dojah_api_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_verifications_car ON vehicle_verifications(car_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_verifications_dealer ON vehicle_verifications(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_verifications_plate ON vehicle_verifications(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_verifications_status ON vehicle_verifications(status);

CREATE INDEX IF NOT EXISTS idx_dealers_verification_tier ON dealers(verification_tier);
CREATE INDEX IF NOT EXISTS idx_dealers_nin_verified ON dealers(nin_verified);
CREATE INDEX IF NOT EXISTS idx_dealers_bvn_verified ON dealers(bvn_verified);
CREATE INDEX IF NOT EXISTS idx_dealers_cac_verified ON dealers(cac_verified);

-- ============================================================================
-- 7. FUNCTION: Calculate Dealer Verification Tier
-- ============================================================================
-- Calculates tier based on verification score:
-- - Basic: 0-34 points (no verification)
-- - Verified: 35-69 points (NIN or BVN verified)
-- - Trusted Seller: 70-100 points (NIN + BVN + CAC verified)

CREATE OR REPLACE FUNCTION calculate_dealer_verification_tier(dealer_id_param UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_score INTEGER := 0;
  v_nin BOOLEAN;
  v_bvn BOOLEAN;
  v_cac BOOLEAN;
  v_owner_match BOOLEAN;
BEGIN
  -- Get verification status
  SELECT
    nin_verified,
    bvn_verified,
    cac_verified,
    owner_name_match
  INTO v_nin, v_bvn, v_cac, v_owner_match
  FROM dealer_verification_tiers
  WHERE dealer_id = dealer_id_param;

  -- If no record exists, return basic
  IF NOT FOUND THEN
    RETURN 'basic';
  END IF;

  -- Calculate score
  IF v_nin THEN v_score := v_score + 35; END IF;
  IF v_bvn THEN v_score := v_score + 35; END IF;
  IF v_cac THEN v_score := v_score + 25; END IF;
  IF v_owner_match THEN v_score := v_score + 5; END IF;

  -- Determine tier
  IF v_score >= 70 THEN
    RETURN 'trusted_seller';
  ELSIF v_score >= 35 THEN
    RETURN 'verified';
  ELSE
    RETURN 'basic';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. FUNCTION: Update Dealer Verification Status
-- ============================================================================
-- Updates dealer's verification_tier and score after any verification

CREATE OR REPLACE FUNCTION update_dealer_verification_status()
RETURNS TRIGGER AS $$
DECLARE
  new_tier VARCHAR(20);
  new_score INTEGER := 0;
BEGIN
  -- Calculate new score
  IF NEW.nin_verified THEN new_score := new_score + 35; END IF;
  IF NEW.bvn_verified THEN new_score := new_score + 35; END IF;
  IF NEW.cac_verified THEN new_score := new_score + 25; END IF;
  IF NEW.owner_name_match THEN new_score := new_score + 5; END IF;

  -- Determine new tier
  IF new_score >= 70 THEN
    new_tier := 'trusted_seller';
  ELSIF new_score >= 35 THEN
    new_tier := 'verified';
  ELSE
    new_tier := 'basic';
  END IF;

  -- Update dealer record
  UPDATE dealers
  SET
    verification_tier = new_tier,
    verification_score = new_score,
    nin_verified = NEW.nin_verified,
    bvn_verified = NEW.bvn_verified,
    cac_verified = NEW.cac_verified
  WHERE id = NEW.dealer_id;

  -- Update the tier in verification_tiers table
  NEW.tier := new_tier;
  NEW.verification_score := new_score;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier updates
DROP TRIGGER IF EXISTS trigger_update_dealer_verification ON dealer_verification_tiers;
CREATE TRIGGER trigger_update_dealer_verification
  BEFORE UPDATE ON dealer_verification_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_verification_status();

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE dealer_verification_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dojah_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_verifications ENABLE ROW LEVEL SECURITY;

-- Dealer Verification Tiers policies
CREATE POLICY "Dealers can view own verification"
  ON dealer_verification_tiers FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage verifications"
  ON dealer_verification_tiers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Dojah API Logs policies (admin only)
CREATE POLICY "Admins can view API logs"
  ON dojah_api_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage API logs"
  ON dojah_api_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vehicle Verifications policies
CREATE POLICY "Anyone can view vehicle verifications"
  ON vehicle_verifications FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage vehicle verifications"
  ON vehicle_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 10. HELPER FUNCTION: Log Dojah API Call
-- ============================================================================

CREATE OR REPLACE FUNCTION log_dojah_api_call(
  p_entity_type VARCHAR(20),
  p_entity_id UUID,
  p_api_endpoint VARCHAR(255),
  p_verification_type VARCHAR(30),
  p_request_payload JSONB,
  p_response_payload JSONB,
  p_response_status INTEGER,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_error_code VARCHAR(50) DEFAULT NULL,
  p_api_cost_units INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO dojah_api_logs (
    entity_type,
    entity_id,
    api_endpoint,
    verification_type,
    request_payload,
    response_payload,
    response_status,
    success,
    error_message,
    error_code,
    api_cost_units
  )
  VALUES (
    p_entity_type,
    p_entity_id,
    p_api_endpoint,
    p_verification_type,
    p_request_payload,
    p_response_payload,
    p_response_status,
    p_success,
    p_error_message,
    p_error_code,
    p_api_cost_units
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The Dojah verification system is now ready!
--
-- VERIFICATION TIERS:
-- - Basic (0-34 points): No verification
-- - Verified (35-69 points): NIN or BVN verified
-- - Trusted Seller (70-100 points): NIN + BVN + CAC verified
--
-- SCORING:
-- - NIN Verified: +35 points
-- - BVN Verified: +35 points
-- - CAC Verified: +25 points
-- - Owner Name Match: +5 points
-- ============================================================================
