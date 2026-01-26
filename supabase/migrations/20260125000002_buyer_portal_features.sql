-- ============================================================================
-- BUYER PORTAL FEATURES MIGRATION
-- Date: 2026-01-25
-- ============================================================================
-- This migration adds:
-- 1. Car Price History tracking
-- 2. Car Offers/Negotiations system
-- 3. Test Drive Appointments
-- 4. Buyer Car Alerts (extending saved_searches)
-- 5. Insurance Quote Requests
-- 6. Purchase History tracking
-- ============================================================================

-- ============================================================================
-- 1. CAR PRICE HISTORY TABLE
-- ============================================================================
-- Tracks price changes for cars over time
CREATE TABLE IF NOT EXISTS car_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Car reference
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- Price details
  old_price NUMERIC(15, 2),
  new_price NUMERIC(15, 2) NOT NULL,
  price_change NUMERIC(15, 2), -- Negative = decrease, Positive = increase
  price_change_percent NUMERIC(5, 2), -- Percentage change

  -- Who changed it
  changed_by_type VARCHAR(20) CHECK (changed_by_type IN ('dealer', 'admin', 'system')),
  changed_by_id UUID,
  change_reason TEXT,

  -- Timestamps
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for price history
CREATE INDEX IF NOT EXISTS idx_price_history_car ON car_price_history(car_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON car_price_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_price_drop ON car_price_history(price_change) WHERE price_change < 0;

-- ============================================================================
-- 2. CAR OFFERS TABLE
-- ============================================================================
-- Allows buyers to make offers on cars
CREATE TABLE IF NOT EXISTS car_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties involved
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- Offer details
  offer_amount NUMERIC(15, 2) NOT NULL,
  original_price NUMERIC(15, 2) NOT NULL,
  discount_percent NUMERIC(5, 2),

  -- Buyer message
  message TEXT,

  -- Status workflow
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending',        -- Offer submitted, awaiting response
    'viewed',         -- Dealer viewed the offer
    'counter',        -- Dealer made a counter offer
    'accepted',       -- Dealer accepted the offer
    'rejected',       -- Dealer rejected the offer
    'expired',        -- Offer expired (72 hours)
    'withdrawn',      -- Buyer withdrew the offer
    'converted'       -- Offer converted to sale/escrow
  )),

  -- Counter offer details
  counter_amount NUMERIC(15, 2),
  counter_message TEXT,
  counter_at TIMESTAMPTZ,

  -- Response from buyer to counter
  buyer_counter_response VARCHAR(20) CHECK (buyer_counter_response IN ('pending', 'accepted', 'rejected', 'counter')),
  buyer_counter_amount NUMERIC(15, 2),
  buyer_counter_at TIMESTAMPTZ,

  -- Final negotiation outcome
  final_agreed_price NUMERIC(15, 2),

  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '72 hours'),

  -- Related escrow if converted
  escrow_transaction_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for offers
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON car_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_dealer ON car_offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_offers_car ON car_offers(car_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON car_offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_pending ON car_offers(status, expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_offers_created ON car_offers(created_at DESC);

-- ============================================================================
-- 3. TEST DRIVE APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_drive_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties involved
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,

  -- Scheduling
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  alternate_date DATE,
  alternate_time TIME,

  -- Confirmed slot
  confirmed_date DATE,
  confirmed_time TIME,

  -- Location
  location_type VARCHAR(30) DEFAULT 'dealer' CHECK (location_type IN ('dealer', 'buyer_location', 'neutral')),
  location_address TEXT,
  location_notes TEXT,

  -- Buyer contact
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),

  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending',        -- Request submitted
    'confirmed',      -- Dealer confirmed appointment
    'rescheduled',    -- Appointment was rescheduled
    'completed',      -- Test drive happened
    'no_show',        -- Buyer didn't show up
    'cancelled',      -- Cancelled by buyer or dealer
    'expired'         -- Expired without confirmation
  )),

  -- Cancellation details
  cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('buyer', 'dealer')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Post-test drive feedback
  buyer_feedback TEXT,
  buyer_interest_level VARCHAR(30) CHECK (buyer_interest_level IN ('not_interested', 'considering', 'very_interested', 'ready_to_buy')),
  dealer_notes TEXT,

  -- Follow-up
  follow_up_scheduled BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_buyer ON test_drive_appointments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dealer ON test_drive_appointments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_car ON test_drive_appointments(car_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON test_drive_appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON test_drive_appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed ON test_drive_appointments(confirmed_date) WHERE status = 'confirmed';

-- ============================================================================
-- 4. BUYER CAR ALERTS TABLE
-- ============================================================================
-- Extends saved_searches with buyer-specific alert preferences
CREATE TABLE IF NOT EXISTS buyer_car_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Buyer reference
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  -- Alert name
  name VARCHAR(255) DEFAULT 'My Alert',

  -- Search criteria
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"make": "Toyota", "model": "Camry", "min_year": 2020, "max_price": 15000000}

  -- Specific filter columns (for indexed queries)
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
  notify_in_app BOOLEAN DEFAULT true,

  -- Frequency
  frequency VARCHAR(20) DEFAULT 'instant' CHECK (frequency IN ('instant', 'daily', 'weekly')),

  -- Alert status
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  paused_until TIMESTAMPTZ,

  -- Tracking
  matches_found INTEGER DEFAULT 0,
  last_match_at TIMESTAMPTZ,
  last_notified_at TIMESTAMPTZ,
  notification_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for alerts
CREATE INDEX IF NOT EXISTS idx_buyer_alerts_buyer ON buyer_car_alerts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_alerts_active ON buyer_car_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_buyer_alerts_make ON buyer_car_alerts(make);
CREATE INDEX IF NOT EXISTS idx_buyer_alerts_price ON buyer_car_alerts(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_buyer_alerts_criteria ON buyer_car_alerts USING GIN(criteria);

-- ============================================================================
-- 5. BUYER ALERT MATCHES TABLE
-- ============================================================================
-- Tracks which cars matched which alerts (to prevent duplicate notifications)
CREATE TABLE IF NOT EXISTS buyer_alert_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  alert_id UUID NOT NULL REFERENCES buyer_car_alerts(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  -- Notification tracking
  notified_email BOOLEAN DEFAULT false,
  notified_sms BOOLEAN DEFAULT false,
  notified_push BOOLEAN DEFAULT false,
  notified_in_app BOOLEAN DEFAULT false,

  -- User interaction
  is_viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  is_saved BOOLEAN DEFAULT false,
  saved_at TIMESTAMPTZ,

  -- Timestamps
  matched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(alert_id, car_id)
);

-- Create indexes for alert matches
CREATE INDEX IF NOT EXISTS idx_alert_matches_alert ON buyer_alert_matches(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_matches_car ON buyer_alert_matches(car_id);
CREATE INDEX IF NOT EXISTS idx_alert_matches_buyer ON buyer_alert_matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_alert_matches_unviewed ON buyer_alert_matches(is_viewed) WHERE is_viewed = false;

-- ============================================================================
-- 6. INSURANCE QUOTE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Requester
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  requester_name VARCHAR(255) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  requester_phone VARCHAR(50),

  -- Vehicle details
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_make VARCHAR(100),
  car_model VARCHAR(100),
  car_year INTEGER,
  car_value NUMERIC(15, 2),

  -- Insurance preferences
  insurance_type VARCHAR(30) DEFAULT 'comprehensive' CHECK (insurance_type IN (
    'third_party',      -- Basic third-party
    'third_party_plus', -- Third-party fire and theft
    'comprehensive'     -- Full comprehensive
  )),

  -- Coverage preferences
  additional_coverage JSONB DEFAULT '[]'::jsonb,
  -- Example: ["roadside_assistance", "windscreen_cover", "excess_buyback"]

  -- Quote details (populated by admin/system)
  quotes JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"provider": "AXA", "monthly": 15000, "annual": 150000, ...}]

  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Request submitted
    'processing',   -- Getting quotes
    'quoted',       -- Quotes available
    'selected',     -- Buyer selected a quote
    'purchased',    -- Insurance purchased
    'expired'       -- Quotes expired
  )),

  -- Selected quote
  selected_provider VARCHAR(100),
  selected_amount NUMERIC(15, 2),

  -- Notes
  notes TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for insurance
CREATE INDEX IF NOT EXISTS idx_insurance_buyer ON insurance_quote_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_car ON insurance_quote_requests(car_id);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON insurance_quote_requests(status);

-- ============================================================================
-- 7. PURCHASE HISTORY / COMPLETED TRANSACTIONS VIEW
-- ============================================================================
-- Tracks completed purchases for buyer history

CREATE TABLE IF NOT EXISTS purchase_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,

  -- Car details (denormalized for history)
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_make VARCHAR(100),
  car_model VARCHAR(100),
  car_year INTEGER,
  car_vin VARCHAR(50),
  car_images JSONB DEFAULT '[]'::jsonb,

  -- Transaction details
  purchase_price NUMERIC(15, 2) NOT NULL,
  escrow_fee NUMERIC(15, 2),
  total_paid NUMERIC(15, 2),

  -- Related records
  escrow_transaction_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES car_offers(id) ON DELETE SET NULL,

  -- Dealer info (denormalized for history)
  dealer_name VARCHAR(255),
  dealer_email VARCHAR(255),
  dealer_phone VARCHAR(50),

  -- Documents
  receipt_url TEXT,
  invoice_url TEXT,
  documents JSONB DEFAULT '[]'::jsonb,

  -- Status
  status VARCHAR(30) DEFAULT 'completed' CHECK (status IN (
    'completed',    -- Normal purchase
    'refunded',     -- Transaction was refunded
    'disputed'      -- Under dispute
  )),

  -- Review tracking
  review_id UUID REFERENCES dealer_reviews(id) ON DELETE SET NULL,
  has_reviewed BOOLEAN DEFAULT false,
  review_reminder_sent BOOLEAN DEFAULT false,

  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchase_records(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_dealer ON purchase_records(dealer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchase_records(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_no_review ON purchase_records(has_reviewed) WHERE has_reviewed = false;

-- ============================================================================
-- 8. ADD NOTIFICATION PREFERENCES TO BUYERS TABLE
-- ============================================================================
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_alerts": true,
  "sms_alerts": false,
  "push_alerts": true,
  "price_drop_alerts": true,
  "new_listing_alerts": true,
  "promotion_alerts": false,
  "newsletter": false
}'::jsonb;

-- ============================================================================
-- 9. ADD FINANCING CALCULATOR SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS financing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Settings
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,

  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default financing settings
INSERT INTO financing_settings (setting_key, setting_value, description)
VALUES
  ('interest_rates', '{"min": 15, "max": 28, "default": 22}', 'Annual interest rate range (%)'),
  ('loan_terms', '{"months": [12, 24, 36, 48, 60, 72], "default": 48}', 'Available loan term options in months'),
  ('down_payment', '{"min_percent": 20, "max_percent": 70, "default_percent": 30}', 'Down payment percentage range'),
  ('partner_banks', '[
    {"name": "Access Bank", "rate": 22, "max_term": 60},
    {"name": "GTBank", "rate": 21, "max_term": 48},
    {"name": "First Bank", "rate": 23, "max_term": 72},
    {"name": "UBA", "rate": 22, "max_term": 60},
    {"name": "Zenith Bank", "rate": 21, "max_term": 48}
  ]', 'Partner banks for car financing')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 10. TRIGGERS FOR PRICE HISTORY
-- ============================================================================

-- Function to record price changes
CREATE OR REPLACE FUNCTION record_car_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO car_price_history (
      car_id,
      old_price,
      new_price,
      price_change,
      price_change_percent,
      changed_by_type,
      change_reason
    ) VALUES (
      NEW.id,
      OLD.price,
      NEW.price,
      NEW.price - OLD.price,
      CASE
        WHEN OLD.price > 0 THEN ROUND(((NEW.price - OLD.price) / OLD.price * 100)::numeric, 2)
        ELSE 0
      END,
      'dealer',
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price changes
DROP TRIGGER IF EXISTS track_car_price_changes ON cars;
CREATE TRIGGER track_car_price_changes
  AFTER UPDATE OF price ON cars
  FOR EACH ROW
  EXECUTE FUNCTION record_car_price_change();

-- ============================================================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_car_offers_updated_at ON car_offers;
CREATE TRIGGER update_car_offers_updated_at
  BEFORE UPDATE ON car_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON test_drive_appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON test_drive_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_buyer_alerts_updated_at ON buyer_car_alerts;
CREATE TRIGGER update_buyer_alerts_updated_at
  BEFORE UPDATE ON buyer_car_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_quotes_updated_at ON insurance_quote_requests;
CREATE TRIGGER update_insurance_quotes_updated_at
  BEFORE UPDATE ON insurance_quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE car_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_drive_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_car_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_alert_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_settings ENABLE ROW LEVEL SECURITY;

-- Price History Policies (public read)
CREATE POLICY "Anyone can view price history"
  ON car_price_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert price history"
  ON car_price_history FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Car Offers Policies
CREATE POLICY "Buyers can view their offers"
  ON car_offers FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create offers"
  ON car_offers FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their offers"
  ON car_offers FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Dealers can view offers on their cars"
  ON car_offers FOR SELECT
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Dealers can respond to offers"
  ON car_offers FOR UPDATE
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Appointments Policies
CREATE POLICY "Buyers can manage their appointments"
  ON test_drive_appointments FOR ALL
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Dealers can view their appointments"
  ON test_drive_appointments FOR SELECT
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

CREATE POLICY "Dealers can update their appointments"
  ON test_drive_appointments FOR UPDATE
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Buyer Alerts Policies
CREATE POLICY "Buyers can manage their alerts"
  ON buyer_car_alerts FOR ALL
  TO authenticated
  USING (buyer_id = auth.uid());

-- Alert Matches Policies
CREATE POLICY "Buyers can view their alert matches"
  ON buyer_alert_matches FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their alert matches"
  ON buyer_alert_matches FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Service role can manage alert matches"
  ON buyer_alert_matches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insurance Policies
CREATE POLICY "Buyers can manage their insurance requests"
  ON insurance_quote_requests FOR ALL
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Anyone can create insurance requests"
  ON insurance_quote_requests FOR INSERT
  WITH CHECK (true);

-- Purchase Records Policies
CREATE POLICY "Buyers can view their purchases"
  ON purchase_records FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Dealers can view their sales"
  ON purchase_records FOR SELECT
  TO authenticated
  USING (dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid()));

-- Financing Settings (public read)
CREATE POLICY "Anyone can read financing settings"
  ON financing_settings FOR SELECT
  USING (is_active = true);

-- Admin policies for all tables
CREATE POLICY "Admins can manage price history"
  ON car_price_history FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage offers"
  ON car_offers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage appointments"
  ON test_drive_appointments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage alerts"
  ON buyer_car_alerts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage insurance requests"
  ON insurance_quote_requests FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage purchases"
  ON purchase_records FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

CREATE POLICY "Admins can manage financing settings"
  ON financing_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- New features added:
-- 1. Price History tracking with automatic triggers
-- 2. Car Offers/Negotiations with counter-offer support
-- 3. Test Drive Appointments with scheduling
-- 4. Buyer Car Alerts with notification preferences
-- 5. Insurance Quote Requests
-- 6. Purchase History for completed transactions
-- 7. Financing Calculator settings
-- ============================================================================
