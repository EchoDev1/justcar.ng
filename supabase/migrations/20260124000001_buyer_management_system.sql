-- ============================================================================
-- BUYER MANAGEMENT SYSTEM MIGRATION
-- Date: 2026-01-24
-- ============================================================================

-- This migration adds:
-- 1. User status management (banned, suspended)
-- 2. Admin notes and action tracking for buyers
-- ============================================================================

-- ============================================================================
-- 1. ADD STATUS FIELDS TO BUYERS TABLE
-- ============================================================================

-- Add account status field
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'
  CHECK (account_status IN ('active', 'suspended', 'banned', 'deleted'));

-- Add ban/suspend details
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES admins(id) ON DELETE SET NULL;

ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspend_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES admins(id) ON DELETE SET NULL;

-- Add admin notes field
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add last activity tracking
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- ============================================================================
-- 2. CREATE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_buyers_account_status ON buyers(account_status);
CREATE INDEX IF NOT EXISTS idx_buyers_is_banned ON buyers(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_buyers_is_suspended ON buyers(is_suspended) WHERE is_suspended = true;
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON buyers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyers_last_activity ON buyers(last_activity_at DESC);

-- ============================================================================
-- 3. CREATE BUYER ACTIVITY LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS buyer_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Buyer reference
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,

  -- Admin who performed action
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,

  -- Action details
  action_type VARCHAR(30) NOT NULL CHECK (action_type IN (
    'ban',
    'unban',
    'suspend',
    'unsuspend',
    'delete',
    'restore',
    'verify',
    'reject_verification',
    'add_note',
    'update_profile',
    'password_reset',
    'created'
  )),

  -- Action details
  action_reason TEXT,
  action_notes TEXT,

  -- Previous values (for audit trail)
  previous_status VARCHAR(20),
  new_status VARCHAR(20),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- IP address of admin
  ip_address INET,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buyer_actions_buyer ON buyer_admin_actions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_actions_admin ON buyer_admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_buyer_actions_type ON buyer_admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_buyer_actions_created ON buyer_admin_actions(created_at DESC);

-- ============================================================================
-- 4. ENABLE RLS ON NEW TABLE
-- ============================================================================

ALTER TABLE buyer_admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage buyer actions
CREATE POLICY "Admins can manage buyer actions"
  ON buyer_admin_actions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true
    )
  );

-- ============================================================================
-- 5. UPDATE RLS FOR BUYERS TABLE TO ALLOW ADMIN ACCESS
-- ============================================================================

-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Admins can view all buyers" ON buyers;
DROP POLICY IF EXISTS "Admins can manage all buyers" ON buyers;

-- Allow admins to view all buyers
CREATE POLICY "Admins can view all buyers"
  ON buyers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true
    )
  );

-- Allow admins to update buyers
CREATE POLICY "Admins can update all buyers"
  ON buyers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true
    )
  );

-- Allow admins to delete buyers
CREATE POLICY "Admins can delete buyers"
  ON buyers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true
    )
  );

-- Allow admins to insert buyers
CREATE POLICY "Admins can insert buyers"
  ON buyers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.auth_id = auth.uid() AND admins.is_active = true
    )
  );

-- ============================================================================
-- 6. HELPFUL VIEW FOR BUYER MANAGEMENT (Optional - created only if tables exist)
-- ============================================================================

-- Create a simple view without dependencies on optional tables
CREATE OR REPLACE VIEW buyer_management_view AS
SELECT
  b.id,
  b.full_name,
  b.email,
  b.phone,
  b.location,
  b.account_status,
  b.is_banned,
  b.banned_at,
  b.ban_reason,
  b.is_suspended,
  b.suspended_at,
  b.suspended_until,
  b.suspend_reason,
  b.verification_status,
  b.verification_tier,
  b.lead_score,
  b.admin_notes,
  b.created_at,
  b.updated_at,
  b.last_activity_at
FROM buyers b
ORDER BY b.created_at DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
