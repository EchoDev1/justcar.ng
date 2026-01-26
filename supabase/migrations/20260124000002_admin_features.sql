-- ============================================================================
-- ADMIN FEATURES MIGRATION
-- Date: 2026-01-24
-- ============================================================================
-- This migration adds:
-- 1. Admin notifications table
-- 2. Dealer reviews table
-- 3. Audit logs table
-- 4. Support tickets table
-- 5. Promotions/coupons table
-- 6. System settings table
-- ============================================================================

-- ============================================================================
-- 1. ADMIN NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_type VARCHAR(20) NOT NULL DEFAULT 'all',
  recipient_count INTEGER DEFAULT 0,
  channels JSONB DEFAULT '["email"]'::jsonb,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- ============================================================================
-- 2. DEALER REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dealer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,

  -- Review metadata
  transaction_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,

  -- Response
  dealer_response TEXT,
  dealer_response_at TIMESTAMPTZ,

  -- Flags
  is_verified_purchase BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer ON dealer_reviews(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_buyer ON dealer_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_status ON dealer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_rating ON dealer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_created ON dealer_reviews(created_at DESC);

-- ============================================================================
-- 3. AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Admin who performed action
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_email VARCHAR(255),

  -- Action details
  action_type VARCHAR(50) NOT NULL,
  action_category VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,

  -- Entity affected
  entity_type VARCHAR(30),
  entity_id UUID,
  entity_name VARCHAR(255),

  -- Change tracking
  old_values JSONB,
  new_values JSONB,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON admin_audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);

-- ============================================================================
-- 4. SUPPORT TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,

  -- Submitter
  submitter_type VARCHAR(20) NOT NULL CHECK (submitter_type IN ('buyer', 'dealer', 'guest')),
  submitter_id UUID,
  submitter_email VARCHAR(255) NOT NULL,
  submitter_name VARCHAR(255),

  -- Ticket details
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('general', 'payment', 'escrow', 'verification', 'listing', 'account', 'technical', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Status
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),

  -- Assignment
  assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Related entities
  related_car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  related_transaction_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at DESC);

-- Ticket replies
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Sender
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'user')),
  sender_id UUID,
  sender_name VARCHAR(255),

  -- Content
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Internal note (not visible to user)
  is_internal BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_created ON support_ticket_replies(created_at);

-- ============================================================================
-- 5. PROMOTIONS/COUPONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Promo details
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Discount
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL,
  max_discount NUMERIC(12, 2),
  min_purchase NUMERIC(12, 2) DEFAULT 0,

  -- Validity
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,

  -- Usage limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,

  -- Applicability
  applies_to VARCHAR(30) DEFAULT 'all' CHECK (applies_to IN ('all', 'featured_listing', 'badge_subscription', 'escrow_fee')),
  user_type VARCHAR(20) DEFAULT 'all' CHECK (user_type IN ('all', 'dealers', 'buyers')),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- Promotion usage tracking
CREATE TABLE IF NOT EXISTS promotion_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  discount_applied NUMERIC(12, 2) NOT NULL,
  transaction_type VARCHAR(30),
  transaction_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_uses_promotion ON promotion_uses(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promo_uses_user ON promotion_uses(user_id, user_type);

-- ============================================================================
-- 6. SYSTEM SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON system_settings(category);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('escrow_fee_percentage', '1.5', 'number', 'fees', 'Escrow fee percentage', true),
  ('inspection_fee', '15000', 'number', 'fees', 'Vehicle inspection fee in Naira', true),
  ('featured_listing_price_single', '5000', 'number', 'fees', 'Single featured listing price', true),
  ('featured_listing_price_monthly', '25000', 'number', 'fees', 'Monthly featured listing price', true),
  ('luxury_price_threshold', '150000000', 'number', 'thresholds', 'Price threshold for luxury cars', true),
  ('max_images_per_listing', '20', 'number', 'limits', 'Maximum images per car listing', true),
  ('verification_required_for_escrow', 'true', 'boolean', 'security', 'Require verification for escrow', false),
  ('auto_approve_listings', 'false', 'boolean', 'moderation', 'Auto-approve new listings', false),
  ('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode', false),
  ('contact_email', '"support@justcars.ng"', 'string', 'contact', 'Support email address', true),
  ('contact_phone', '"+234 xxx xxx xxxx"', 'string', 'contact', 'Support phone number', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 7. SEO SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) UNIQUE NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots VARCHAR(100) DEFAULT 'index, follow',
  structured_data JSONB,
  updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_page_path ON seo_settings(page_path);

-- Insert default SEO settings
INSERT INTO seo_settings (page_path, meta_title, meta_description) VALUES
  ('/', 'JustCars.ng - Buy & Sell Cars in Nigeria', 'Nigeria''s premier car marketplace. Find verified cars, trusted dealers, and secure escrow transactions.'),
  ('/cars', 'Browse Cars for Sale in Nigeria | JustCars.ng', 'Find your perfect car from thousands of verified listings. Filter by make, model, price, and location.'),
  ('/luxury', 'Luxury Cars for Sale in Nigeria | JustCars.ng', 'Discover premium luxury vehicles from top brands like Rolls-Royce, Bentley, Mercedes-Maybach, and more.'),
  ('/dealers', 'Verified Car Dealers in Nigeria | JustCars.ng', 'Connect with trusted, verified car dealers across Nigeria.')
ON CONFLICT (page_path) DO NOTHING;

-- ============================================================================
-- 8. ENABLE RLS
-- ============================================================================

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Public read for some tables
CREATE POLICY "Public can view approved dealer reviews"
  ON dealer_reviews FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Public can view active promotions"
  ON promotions FOR SELECT
  TO public
  USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

CREATE POLICY "Public can view public settings"
  ON system_settings FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Public can view SEO settings"
  ON seo_settings FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_admin_notifications_updated_at
  BEFORE UPDATE ON admin_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_reviews_updated_at
  BEFORE UPDATE ON dealer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. HELPER FUNCTION FOR TICKET NUMBERS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
