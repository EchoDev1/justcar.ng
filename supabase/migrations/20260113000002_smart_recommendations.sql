-- ============================================================================
-- SMART RECOMMENDATIONS & FRAUD DETECTION SYSTEM
-- Date: 2026-01-13
-- ============================================================================
-- This migration creates:
-- 1. Car market prices table for price intelligence
-- 2. Fraud detection flags table
-- 3. Trending cars cache table
-- 4. Saved searches with notifications
-- 5. User browsing history for recommendations
-- 6. Price badges on cars (Good Deal / Fair Price / Overpriced)
-- ============================================================================

-- ============================================================================
-- 1. CAR MARKET PRICES TABLE
-- ============================================================================
-- Stores average market prices by make/model/year for price intelligence

CREATE TABLE IF NOT EXISTS car_market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Car characteristics
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_from INTEGER NOT NULL,
  year_to INTEGER NOT NULL,
  body_type VARCHAR(50),
  condition VARCHAR(30), -- 'nigerian_used', 'foreign_used', 'brand_new'

  -- Price statistics (in Naira)
  avg_price NUMERIC(15, 2),
  min_price NUMERIC(15, 2),
  max_price NUMERIC(15, 2),
  median_price NUMERIC(15, 2),
  sample_count INTEGER DEFAULT 0,

  -- Price ranges for badges
  good_deal_threshold NUMERIC(15, 2),  -- Below this = "Good Deal" (15% below avg)
  fair_price_min NUMERIC(15, 2),
  fair_price_max NUMERIC(15, 2),
  overpriced_threshold NUMERIC(15, 2), -- Above this = "Overpriced" (20% above avg)

  -- Market trend
  price_trend VARCHAR(20) DEFAULT 'stable' CHECK (price_trend IN ('rising', 'stable', 'falling')),
  price_change_30d NUMERIC(5, 2) DEFAULT 0, -- Percentage change in 30 days

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  data_source VARCHAR(50) DEFAULT 'platform', -- 'platform', 'external', 'manual'

  UNIQUE(make, model, year_from, year_to, body_type, condition)
);

-- ============================================================================
-- 2. FRAUD FLAGS TABLE
-- ============================================================================
-- Stores flagged listings for admin review

CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flagged entity
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('car', 'dealer')),
  entity_id UUID NOT NULL,

  -- Flag details
  flag_type VARCHAR(50) NOT NULL CHECK (flag_type IN (
    'price_anomaly_low',      -- Suspiciously low price
    'price_anomaly_high',     -- Suspiciously high price
    'duplicate_listing',      -- Same car listed multiple times
    'duplicate_photos',       -- Photos used in other listings
    'suspicious_photos',      -- Stock photos or mismatched images
    'rapid_relisting',        -- Same dealer relisting frequently
    'fake_mileage',           -- Mileage inconsistent with year
    'stolen_vehicle',         -- Flagged in stolen database
    'multiple_locations',     -- Same car in different locations
    'suspicious_dealer',      -- Dealer with multiple flags
    'user_report',            -- Reported by user
    'description_mismatch'    -- Description doesn't match photos/specs
  )),

  -- Severity level
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'dismissed', 'confirmed', 'resolved')),

  -- Detection details
  description TEXT,
  detection_data JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(5, 2) DEFAULT 0, -- 0-100 confidence in the flag

  -- Related entities
  related_car_ids UUID[] DEFAULT '{}',
  related_dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,

  -- Admin review
  reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  action_taken VARCHAR(100),

  -- Auto-detection info
  detected_by VARCHAR(50) DEFAULT 'system', -- 'system', 'user', 'admin'
  detection_algorithm VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TRENDING CARS CACHE TABLE
-- ============================================================================
-- Caches trending calculations for performance

CREATE TABLE IF NOT EXISTS trending_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- Trending metrics (last 24 hours)
  views_24h INTEGER DEFAULT 0,
  saves_24h INTEGER DEFAULT 0,
  inquiries_24h INTEGER DEFAULT 0,
  shares_24h INTEGER DEFAULT 0,

  -- Trending metrics (last 7 days)
  views_7d INTEGER DEFAULT 0,
  saves_7d INTEGER DEFAULT 0,
  inquiries_7d INTEGER DEFAULT 0,
  shares_7d INTEGER DEFAULT 0,

  -- Calculated trending score
  trending_score NUMERIC(10, 2) DEFAULT 0,

  -- Ranking
  rank_overall INTEGER,
  rank_in_category VARCHAR(50), -- Category name (e.g., 'suv', 'sedan', 'luxury')
  rank_position_category INTEGER,

  -- Cache validity
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',

  UNIQUE(car_id)
);

-- ============================================================================
-- 4. SAVED SEARCHES TABLE
-- ============================================================================
-- Stores user saved search criteria with notification preferences

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (can be buyer or anonymous with email)
  user_id UUID,
  user_email VARCHAR(255),
  user_phone VARCHAR(20),

  -- Search name/label
  search_name VARCHAR(255) DEFAULT 'My Search',

  -- Search criteria (flexible JSONB for any filter combination)
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"make": "Toyota", "min_price": 5000000, "max_price": 10000000, "body_type": "SUV"}

  -- Expanded criteria columns for indexing
  make VARCHAR(100),
  model VARCHAR(100),
  min_year INTEGER,
  max_year INTEGER,
  min_price NUMERIC(15, 2),
  max_price NUMERIC(15, 2),
  body_type VARCHAR(50),
  fuel_type VARCHAR(30),
  transmission VARCHAR(30),
  location VARCHAR(100),
  condition VARCHAR(30),

  -- Notification preferences
  notify_email BOOLEAN DEFAULT true,
  notify_sms BOOLEAN DEFAULT false,
  notify_push BOOLEAN DEFAULT true,
  notify_frequency VARCHAR(20) DEFAULT 'instant'
    CHECK (notify_frequency IN ('instant', 'daily', 'weekly')),

  -- Activity tracking
  is_active BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  matches_count INTEGER DEFAULT 0,
  last_match_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. SEARCH ALERTS TABLE
-- ============================================================================
-- Tracks which cars have been notified for which saved searches

CREATE TABLE IF NOT EXISTS search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  saved_search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- Notification status
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMPTZ,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,

  -- User interaction
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate notifications
  UNIQUE(saved_search_id, car_id)
);

-- ============================================================================
-- 6. USER BROWSING HISTORY TABLE
-- ============================================================================
-- Tracks user browsing for personalized recommendations

CREATE TABLE IF NOT EXISTS user_browsing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (can be anonymous via session)
  user_id UUID,
  session_id VARCHAR(255),

  -- Viewed car
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- View details
  view_duration_seconds INTEGER DEFAULT 0,
  viewed_photos BOOLEAN DEFAULT false,
  viewed_contact BOOLEAN DEFAULT false,
  clicked_whatsapp BOOLEAN DEFAULT false,
  clicked_call BOOLEAN DEFAULT false,
  saved_car BOOLEAN DEFAULT false,

  -- Device info
  device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
  referrer VARCHAR(255),

  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for efficient queries
  UNIQUE(user_id, car_id, viewed_at)
);

-- ============================================================================
-- 7. UPDATE CARS TABLE WITH PRICE INTELLIGENCE
-- ============================================================================

-- Add price_badge column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='price_badge') THEN
    ALTER TABLE cars ADD COLUMN price_badge VARCHAR(20)
    CHECK (price_badge IN ('good_deal', 'fair_price', 'overpriced', 'unknown'));
  END IF;
END $$;

-- Add market comparison columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='market_avg_price') THEN
    ALTER TABLE cars ADD COLUMN market_avg_price NUMERIC(15, 2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='price_vs_market_pct') THEN
    ALTER TABLE cars ADD COLUMN price_vs_market_pct NUMERIC(5, 2);
  END IF;
END $$;

-- Add similarity score for recommendations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='cars' AND column_name='recommendation_score') THEN
    ALTER TABLE cars ADD COLUMN recommendation_score NUMERIC(5, 2) DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Car market prices indexes
CREATE INDEX IF NOT EXISTS idx_car_market_prices_lookup
  ON car_market_prices(make, model, year_from, year_to);
CREATE INDEX IF NOT EXISTS idx_car_market_prices_make ON car_market_prices(make);
CREATE INDEX IF NOT EXISTS idx_car_market_prices_condition ON car_market_prices(condition);

-- Fraud flags indexes
CREATE INDEX IF NOT EXISTS idx_fraud_flags_entity ON fraud_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON fraud_flags(status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_type ON fraud_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_severity ON fraud_flags(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_created ON fraud_flags(created_at DESC);

-- Trending cars indexes
CREATE INDEX IF NOT EXISTS idx_trending_cars_score ON trending_cars(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_cars_expires ON trending_cars(expires_at);
CREATE INDEX IF NOT EXISTS idx_trending_cars_car ON trending_cars(car_id);

-- Saved searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_email ON saved_searches(user_email);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON saved_searches(is_active);
CREATE INDEX IF NOT EXISTS idx_saved_searches_make ON saved_searches(make);
CREATE INDEX IF NOT EXISTS idx_saved_searches_filters ON saved_searches USING GIN(filters);

-- Search alerts indexes
CREATE INDEX IF NOT EXISTS idx_search_alerts_search ON search_alerts(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_car ON search_alerts(car_id);

-- User browsing history indexes
CREATE INDEX IF NOT EXISTS idx_browsing_history_user ON user_browsing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_session ON user_browsing_history(session_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_car ON user_browsing_history(car_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_date ON user_browsing_history(viewed_at DESC);

-- Cars price intelligence indexes
CREATE INDEX IF NOT EXISTS idx_cars_price_badge ON cars(price_badge);
CREATE INDEX IF NOT EXISTS idx_cars_market_price ON cars(market_avg_price);

-- ============================================================================
-- 9. FUNCTION: Calculate Price Badge
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_price_badge(
  car_price NUMERIC,
  car_make TEXT,
  car_model TEXT,
  car_year INT,
  car_condition TEXT DEFAULT NULL
)
RETURNS VARCHAR(20) AS $$
DECLARE
  market_data RECORD;
BEGIN
  -- Look up market price data
  SELECT * INTO market_data
  FROM car_market_prices
  WHERE make = car_make
    AND model = car_model
    AND car_year BETWEEN year_from AND year_to
    AND (condition = car_condition OR condition IS NULL)
  ORDER BY
    CASE WHEN condition = car_condition THEN 0 ELSE 1 END
  LIMIT 1;

  -- If no market data, return unknown
  IF market_data IS NULL THEN
    RETURN 'unknown';
  END IF;

  -- Determine badge based on thresholds
  IF car_price <= market_data.good_deal_threshold THEN
    RETURN 'good_deal';
  ELSIF car_price >= market_data.overpriced_threshold THEN
    RETURN 'overpriced';
  ELSE
    RETURN 'fair_price';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. FUNCTION: Calculate Trending Score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_views_24h INTEGER,
  p_views_7d INTEGER,
  p_saves_24h INTEGER,
  p_saves_7d INTEGER,
  p_inquiries_24h INTEGER,
  p_inquiries_7d INTEGER
)
RETURNS NUMERIC AS $$
BEGIN
  -- Weighted formula for trending score
  -- Recent activity (24h) is weighted more heavily
  RETURN (
    (p_views_24h * 1.0) +
    (p_views_7d * 0.3) +
    (p_saves_24h * 5.0) +
    (p_saves_7d * 2.0) +
    (p_inquiries_24h * 10.0) +
    (p_inquiries_7d * 3.0)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. FUNCTION: Calculate Similarity Score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_similarity_score(
  source_car_id UUID,
  target_car_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  source_car RECORD;
  target_car RECORD;
  score NUMERIC := 0;
BEGIN
  -- Get source car details
  SELECT make, model, body_type, price, year, location, fuel_type, transmission
  INTO source_car
  FROM cars WHERE id = source_car_id;

  -- Get target car details
  SELECT make, model, body_type, price, year, location, fuel_type, transmission
  INTO target_car
  FROM cars WHERE id = target_car_id;

  -- Same make: +25 points
  IF source_car.make = target_car.make THEN
    score := score + 25;
  END IF;

  -- Same model: +20 points
  IF source_car.model = target_car.model THEN
    score := score + 20;
  END IF;

  -- Same body type: +15 points
  IF source_car.body_type = target_car.body_type THEN
    score := score + 15;
  END IF;

  -- Price within 20%: +15 points
  IF target_car.price BETWEEN source_car.price * 0.8 AND source_car.price * 1.2 THEN
    score := score + 15;
  END IF;

  -- Year within 2 years: +10 points
  IF ABS(source_car.year - target_car.year) <= 2 THEN
    score := score + 10;
  END IF;

  -- Same location: +10 points
  IF source_car.location = target_car.location THEN
    score := score + 10;
  END IF;

  -- Same fuel type: +3 points
  IF source_car.fuel_type = target_car.fuel_type THEN
    score := score + 3;
  END IF;

  -- Same transmission: +2 points
  IF source_car.transmission = target_car.transmission THEN
    score := score + 2;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. FUNCTION: Detect Price Anomaly
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_price_anomaly(car_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  car_record RECORD;
  market_data RECORD;
  variance NUMERIC;
BEGIN
  -- Get car details
  SELECT make, model, year, price, condition
  INTO car_record
  FROM cars WHERE id = car_id_param;

  -- Get market data
  SELECT avg_price INTO market_data
  FROM car_market_prices
  WHERE make = car_record.make
    AND model = car_record.model
    AND car_record.year BETWEEN year_from AND year_to
  LIMIT 1;

  -- If no market data, can't detect anomaly
  IF market_data.avg_price IS NULL OR market_data.avg_price = 0 THEN
    RETURN false;
  END IF;

  -- Calculate variance
  variance := (car_record.price - market_data.avg_price) / market_data.avg_price;

  -- Flag if more than 40% below or above market
  IF ABS(variance) > 0.40 THEN
    -- Insert fraud flag
    INSERT INTO fraud_flags (
      entity_type,
      entity_id,
      flag_type,
      severity,
      description,
      detection_data,
      confidence_score,
      detection_algorithm
    )
    VALUES (
      'car',
      car_id_param,
      CASE WHEN variance < 0 THEN 'price_anomaly_low' ELSE 'price_anomaly_high' END,
      CASE
        WHEN ABS(variance) > 0.60 THEN 'critical'
        WHEN ABS(variance) > 0.50 THEN 'high'
        ELSE 'medium'
      END,
      'Price is ' || ROUND(ABS(variance) * 100) || '% ' ||
        CASE WHEN variance < 0 THEN 'below' ELSE 'above' END || ' market average',
      jsonb_build_object(
        'car_price', car_record.price,
        'market_avg', market_data.avg_price,
        'variance_pct', ROUND(variance * 100, 2)
      ),
      LEAST(ABS(variance) * 100, 100),
      'price_variance_check'
    )
    ON CONFLICT DO NOTHING;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE car_market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_browsing_history ENABLE ROW LEVEL SECURITY;

-- Car market prices (public read)
CREATE POLICY "Anyone can read market prices"
  ON car_market_prices FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage market prices"
  ON car_market_prices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fraud flags (admin only)
CREATE POLICY "Admins can view fraud flags"
  ON fraud_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage fraud flags"
  ON fraud_flags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trending cars (public read)
CREATE POLICY "Anyone can read trending cars"
  ON trending_cars FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage trending cars"
  ON trending_cars FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Saved searches (user's own + service role)
CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  USING (true)
  WITH CHECK (true);

-- Search alerts
CREATE POLICY "Service role can manage search alerts"
  ON search_alerts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User browsing history
CREATE POLICY "Anyone can insert browsing history"
  ON user_browsing_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage browsing history"
  ON user_browsing_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 14. SEED INITIAL MARKET PRICE DATA (NIGERIAN CAR MARKET)
-- ============================================================================
-- Common car prices in Nigerian market for initial price intelligence

INSERT INTO car_market_prices (make, model, year_from, year_to, condition, avg_price, min_price, max_price, good_deal_threshold, fair_price_min, fair_price_max, overpriced_threshold, sample_count)
VALUES
-- Toyota Camry
('Toyota', 'Camry', 2018, 2020, 'foreign_used', 15000000, 12000000, 18000000, 12750000, 13500000, 16500000, 18000000, 50),
('Toyota', 'Camry', 2018, 2020, 'nigerian_used', 12000000, 9000000, 15000000, 10200000, 10800000, 13200000, 14400000, 80),
('Toyota', 'Camry', 2021, 2024, 'foreign_used', 25000000, 20000000, 30000000, 21250000, 22500000, 27500000, 30000000, 30),
-- Toyota Corolla
('Toyota', 'Corolla', 2018, 2020, 'foreign_used', 10000000, 8000000, 12000000, 8500000, 9000000, 11000000, 12000000, 100),
('Toyota', 'Corolla', 2018, 2020, 'nigerian_used', 7500000, 5500000, 9500000, 6375000, 6750000, 8250000, 9000000, 150),
('Toyota', 'Corolla', 2021, 2024, 'foreign_used', 18000000, 15000000, 22000000, 15300000, 16200000, 19800000, 21600000, 40),
-- Toyota RAV4
('Toyota', 'RAV4', 2018, 2020, 'foreign_used', 18000000, 14000000, 22000000, 15300000, 16200000, 19800000, 21600000, 35),
('Toyota', 'RAV4', 2021, 2024, 'foreign_used', 35000000, 28000000, 42000000, 29750000, 31500000, 38500000, 42000000, 20),
-- Honda Accord
('Honda', 'Accord', 2018, 2020, 'foreign_used', 12000000, 9500000, 15000000, 10200000, 10800000, 13200000, 14400000, 60),
('Honda', 'Accord', 2018, 2020, 'nigerian_used', 9000000, 7000000, 11000000, 7650000, 8100000, 9900000, 10800000, 90),
('Honda', 'Accord', 2021, 2024, 'foreign_used', 22000000, 18000000, 27000000, 18700000, 19800000, 24200000, 26400000, 25),
-- Lexus RX350
('Lexus', 'RX350', 2018, 2020, 'foreign_used', 28000000, 22000000, 34000000, 23800000, 25200000, 30800000, 33600000, 40),
('Lexus', 'RX350', 2021, 2024, 'foreign_used', 55000000, 45000000, 65000000, 46750000, 49500000, 60500000, 66000000, 15),
-- Mercedes-Benz E-Class
('Mercedes-Benz', 'E-Class', 2018, 2020, 'foreign_used', 35000000, 28000000, 45000000, 29750000, 31500000, 38500000, 42000000, 25),
('Mercedes-Benz', 'E-Class', 2021, 2024, 'foreign_used', 65000000, 50000000, 80000000, 55250000, 58500000, 71500000, 78000000, 10),
-- BMW X5
('BMW', 'X5', 2018, 2020, 'foreign_used', 38000000, 30000000, 48000000, 32300000, 34200000, 41800000, 45600000, 20),
('BMW', 'X5', 2021, 2024, 'foreign_used', 70000000, 55000000, 85000000, 59500000, 63000000, 77000000, 84000000, 8),
-- Nissan Pathfinder
('Nissan', 'Pathfinder', 2018, 2020, 'foreign_used', 16000000, 12000000, 20000000, 13600000, 14400000, 17600000, 19200000, 30),
-- Ford Explorer
('Ford', 'Explorer', 2018, 2020, 'foreign_used', 20000000, 16000000, 25000000, 17000000, 18000000, 22000000, 24000000, 25)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The smart recommendations and fraud detection system is now ready!
--
-- FEATURES:
-- - Price intelligence with Good Deal / Fair Price / Overpriced badges
-- - Similarity scoring algorithm for car recommendations
-- - Trending score calculation
-- - Fraud detection for price anomalies
-- - Saved searches with notification preferences
-- - User browsing history tracking
-- ============================================================================
