-- ============================================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Date: 2026-01-13
-- ============================================================================
-- Stores push notification subscriptions for web and native apps
-- ============================================================================

-- Drop existing table if needed (uncomment if you want to recreate)
-- DROP TABLE IF EXISTS push_subscriptions CASCADE;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (can be null for anonymous)
  user_id UUID,
  user_type VARCHAR(20) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'dealer', 'admin')),

  -- Subscription type
  subscription_type VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (subscription_type IN ('web', 'native')),

  -- Web push subscription
  endpoint TEXT,
  subscription_data JSONB,

  -- Native push token (FCM/APNS)
  token TEXT,
  platform VARCHAR(20), -- 'android', 'ios', 'web'

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  device_info JSONB DEFAULT '{}'::jsonb,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (with IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_type ON push_subscriptions(subscription_type);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON push_subscriptions;

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage all subscriptions"
  ON push_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
