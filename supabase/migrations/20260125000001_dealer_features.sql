-- Dealer Features Migration
-- Add tables for lead management, trade-ins, alerts, and reviews

-- =====================================================
-- CAR INQUIRIES / LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS car_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(50) DEFAULT 'direct',
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for car_inquiries
CREATE INDEX IF NOT EXISTS idx_car_inquiries_dealer_id ON car_inquiries(dealer_id);
CREATE INDEX IF NOT EXISTS idx_car_inquiries_status ON car_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_car_inquiries_created_at ON car_inquiries(created_at DESC);

-- =====================================================
-- TRADE-IN REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trade_in_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  vehicle_mileage INTEGER,
  vehicle_condition VARCHAR(50),
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending',
  quote_amount DECIMAL(15, 2),
  quote_notes TEXT,
  quoted_at TIMESTAMPTZ,
  interested_in_car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for trade_in_requests
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_dealer_id ON trade_in_requests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_status ON trade_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_created_at ON trade_in_requests(created_at DESC);

-- =====================================================
-- DEALER ALERT SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dealer_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID UNIQUE REFERENCES dealers(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{
    "low_stock_threshold": 5,
    "days_before_expiry": 7,
    "low_views_threshold": 10,
    "inquiry_reminder_hours": 24,
    "email_notifications": true,
    "push_notifications": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEALER REVIEWS TABLE (if not exists from admin features)
-- =====================================================
CREATE TABLE IF NOT EXISTS dealer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  reviewer_id UUID,
  reviewer_name VARCHAR(255),
  reviewer_email VARCHAR(255),
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_title VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  dealer_response TEXT,
  dealer_response_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'published',
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for dealer_reviews
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer_id ON dealer_reviews(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_rating ON dealer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_status ON dealer_reviews(status);

-- =====================================================
-- DEALER STAFF ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dealer_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'staff',
  permissions JSONB DEFAULT '{
    "view_inventory": true,
    "edit_inventory": false,
    "manage_leads": true,
    "view_analytics": false,
    "manage_settings": false
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, email)
);

-- Create index for dealer_staff
CREATE INDEX IF NOT EXISTS idx_dealer_staff_dealer_id ON dealer_staff(dealer_id);

-- =====================================================
-- COMPETITOR PRICING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  competitor_name VARCHAR(255),
  competitor_price DECIMAL(15, 2),
  competitor_url TEXT,
  price_difference DECIMAL(15, 2),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for competitor_pricing
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_car_id ON competitor_pricing(car_id);

-- =====================================================
-- ADD VIEWS COLUMN TO CARS TABLE IF NOT EXISTS
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'views'
  ) THEN
    ALTER TABLE cars ADD COLUMN views INTEGER DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE car_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_pricing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Dealers can view own inquiries" ON car_inquiries;
DROP POLICY IF EXISTS "Dealers can update own inquiries" ON car_inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON car_inquiries;

DROP POLICY IF EXISTS "Dealers can view own trade-ins" ON trade_in_requests;
DROP POLICY IF EXISTS "Dealers can update own trade-ins" ON trade_in_requests;
DROP POLICY IF EXISTS "Anyone can create trade-ins" ON trade_in_requests;

DROP POLICY IF EXISTS "Dealers can manage own alert settings" ON dealer_alert_settings;

DROP POLICY IF EXISTS "Dealers can view own reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Dealers can respond to reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Published reviews are public" ON dealer_reviews;

DROP POLICY IF EXISTS "Dealers can manage own staff" ON dealer_staff;

DROP POLICY IF EXISTS "Dealers can manage own competitor pricing" ON competitor_pricing;

-- Car Inquiries policies
CREATE POLICY "Dealers can view own inquiries" ON car_inquiries
  FOR SELECT USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Dealers can update own inquiries" ON car_inquiries
  FOR UPDATE USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create inquiries" ON car_inquiries
  FOR INSERT WITH CHECK (true);

-- Trade-in Requests policies
CREATE POLICY "Dealers can view own trade-ins" ON trade_in_requests
  FOR SELECT USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Dealers can update own trade-ins" ON trade_in_requests
  FOR UPDATE USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create trade-ins" ON trade_in_requests
  FOR INSERT WITH CHECK (true);

-- Alert Settings policies
CREATE POLICY "Dealers can manage own alert settings" ON dealer_alert_settings
  FOR ALL USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Dealer Reviews policies
CREATE POLICY "Dealers can view own reviews" ON dealer_reviews
  FOR SELECT USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Dealers can respond to reviews" ON dealer_reviews
  FOR UPDATE USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()))
  WITH CHECK (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create reviews" ON dealer_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Published reviews are public" ON dealer_reviews
  FOR SELECT USING (status = 'published');

-- Staff policies
CREATE POLICY "Dealers can manage own staff" ON dealer_staff
  FOR ALL USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Competitor Pricing policies
CREATE POLICY "Dealers can manage own competitor pricing" ON competitor_pricing
  FOR ALL USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_car_inquiries_updated_at ON car_inquiries;
CREATE TRIGGER update_car_inquiries_updated_at
  BEFORE UPDATE ON car_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trade_in_requests_updated_at ON trade_in_requests;
CREATE TRIGGER update_trade_in_requests_updated_at
  BEFORE UPDATE ON trade_in_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dealer_alert_settings_updated_at ON dealer_alert_settings;
CREATE TRIGGER update_dealer_alert_settings_updated_at
  BEFORE UPDATE ON dealer_alert_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dealer_reviews_updated_at ON dealer_reviews;
CREATE TRIGGER update_dealer_reviews_updated_at
  BEFORE UPDATE ON dealer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dealer_staff_updated_at ON dealer_staff;
CREATE TRIGGER update_dealer_staff_updated_at
  BEFORE UPDATE ON dealer_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional - Remove in production)
-- =====================================================
-- Add sample trade-in request statuses check constraint
ALTER TABLE trade_in_requests DROP CONSTRAINT IF EXISTS trade_in_requests_status_check;
ALTER TABLE trade_in_requests ADD CONSTRAINT trade_in_requests_status_check
  CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed'));

-- Add sample inquiry statuses check constraint
ALTER TABLE car_inquiries DROP CONSTRAINT IF EXISTS car_inquiries_status_check;
ALTER TABLE car_inquiries ADD CONSTRAINT car_inquiries_status_check
  CHECK (status IN ('new', 'contacted', 'interested', 'negotiating', 'converted', 'lost'));
