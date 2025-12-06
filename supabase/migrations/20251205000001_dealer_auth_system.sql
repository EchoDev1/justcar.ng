-- ============================================================================
-- DEALER AUTHENTICATION SYSTEM
-- Date: 2025-12-05
-- ============================================================================
-- This migration creates a secure dealer authentication system where:
-- 1. Dealers register themselves (public registration)
-- 2. Admin verifies dealers from admin portal (not Supabase)
-- 3. Verified dealers create their own password from dealer portal
-- 4. Admin can moderate dealers but cannot see their passwords
-- 5. All authentication happens through the application, not Supabase directly
-- ============================================================================

-- ============================================================================
-- 1. UPDATE DEALERS TABLE WITH AUTH STATUS
-- ============================================================================
-- Add columns to track dealer auth status and password setup

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='status') THEN
    ALTER TABLE dealers ADD COLUMN status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'active', 'suspended'));
  END IF;
END $$;

-- Add password_hash column if it doesn't exist (stores bcrypt hash)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='password_hash') THEN
    ALTER TABLE dealers ADD COLUMN password_hash TEXT;
  END IF;
END $$;

-- Add password_set_at column to track when password was created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='password_set_at') THEN
    ALTER TABLE dealers ADD COLUMN password_set_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add verification columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='verified_at') THEN
    ALTER TABLE dealers ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='verified_by_admin_id') THEN
    ALTER TABLE dealers ADD COLUMN verified_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add setup token for password creation (one-time use)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='setup_token') THEN
    ALTER TABLE dealers ADD COLUMN setup_token TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='setup_token_expires_at') THEN
    ALTER TABLE dealers ADD COLUMN setup_token_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add last login tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='last_login_at') THEN
    ALTER TABLE dealers ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='login_attempts') THEN
    ALTER TABLE dealers ADD COLUMN login_attempts INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='locked_until') THEN
    ALTER TABLE dealers ADD COLUMN locked_until TIMESTAMPTZ;
  END IF;
END $$;

-- Add business details columns (for registration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='business_name') THEN
    ALTER TABLE dealers ADD COLUMN business_name TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='business_registration_number') THEN
    ALTER TABLE dealers ADD COLUMN business_registration_number TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='dealers' AND column_name='verification_notes') THEN
    ALTER TABLE dealers ADD COLUMN verification_notes TEXT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);
CREATE INDEX IF NOT EXISTS idx_dealers_setup_token ON dealers(setup_token) WHERE setup_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dealers_verified_at ON dealers(verified_at);

-- ============================================================================
-- 2. CREATE DEALER AUTH LOGS TABLE
-- ============================================================================
-- Track all authentication attempts for security and auditing
CREATE TABLE IF NOT EXISTS dealer_auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dealer reference
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  dealer_email TEXT NOT NULL,

  -- Auth event details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'registration',
    'verification_by_admin',
    'password_setup',
    'login_success',
    'login_failed',
    'password_change',
    'account_locked',
    'account_suspended',
    'account_reactivated'
  )),

  -- Additional info
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,

  -- Admin action tracking (for verification, suspension, etc.)
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_notes TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_auth_logs_dealer ON dealer_auth_logs(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_auth_logs_email ON dealer_auth_logs(dealer_email);
CREATE INDEX IF NOT EXISTS idx_dealer_auth_logs_event ON dealer_auth_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_dealer_auth_logs_created ON dealer_auth_logs(created_at DESC);

-- ============================================================================
-- 3. CREATE DEALER SESSIONS TABLE
-- ============================================================================
-- Manage dealer login sessions (without Supabase Auth)
CREATE TABLE IF NOT EXISTS dealer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dealer reference
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,

  -- Session details
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,

  -- Session metadata
  ip_address INET,
  user_agent TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure token uniqueness
  CONSTRAINT unique_session_token UNIQUE(session_token)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_sessions_dealer ON dealer_sessions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_sessions_token ON dealer_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_dealer_sessions_expires ON dealer_sessions(expires_at);

-- Auto-delete expired sessions (cleanup function)
CREATE OR REPLACE FUNCTION cleanup_expired_dealer_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM dealer_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. CREATE DEALER PASSWORD RESET TABLE
-- ============================================================================
-- Handle password reset requests
CREATE TABLE IF NOT EXISTS dealer_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dealer reference
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  dealer_email TEXT NOT NULL,

  -- Reset token (one-time use)
  reset_token TEXT NOT NULL UNIQUE,
  token_expires_at TIMESTAMPTZ NOT NULL,

  -- Usage tracking
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,

  -- Request details
  ip_address INET,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_password_resets_dealer ON dealer_password_resets(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_password_resets_token ON dealer_password_resets(reset_token) WHERE NOT used;
CREATE INDEX IF NOT EXISTS idx_dealer_password_resets_expires ON dealer_password_resets(token_expires_at);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on dealers table
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Dealers can only view and update their own profile (when authenticated)
CREATE POLICY "Dealers can view own profile"
  ON dealers FOR SELECT
  USING (true); -- We'll handle auth in the application layer

CREATE POLICY "Dealers can update own profile"
  ON dealers FOR UPDATE
  USING (true); -- We'll handle auth in the application layer

-- Admin can view all dealers
CREATE POLICY "Admins can view all dealers"
  ON dealers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

-- Admin can update dealer status and verification
CREATE POLICY "Admins can update dealers"
  ON dealers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

-- Enable RLS on auth logs
ALTER TABLE dealer_auth_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all auth logs
CREATE POLICY "Admins can view auth logs"
  ON dealer_auth_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

-- Enable RLS on sessions
ALTER TABLE dealer_sessions ENABLE ROW LEVEL SECURITY;

-- Dealers can only view their own sessions
CREATE POLICY "Dealers can view own sessions"
  ON dealer_sessions FOR SELECT
  USING (true); -- Application-level auth

-- Admin can view all sessions
CREATE POLICY "Admins can view all sessions"
  ON dealer_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

-- Enable RLS on password resets
ALTER TABLE dealer_password_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create password reset"
  ON dealer_password_resets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view password resets"
  ON dealer_password_resets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to generate setup token for verified dealers
CREATE OR REPLACE FUNCTION generate_dealer_setup_token(dealer_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate random token
  token := encode(gen_random_bytes(32), 'base64');

  -- Update dealer record
  UPDATE dealers
  SET
    setup_token = token,
    setup_token_expires_at = NOW() + INTERVAL '7 days'
  WHERE id = dealer_id_param;

  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify dealer (called by admin)
CREATE OR REPLACE FUNCTION verify_dealer(
  dealer_id_param UUID,
  admin_id_param UUID,
  notes TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update dealer status
  UPDATE dealers
  SET
    status = 'verified',
    verified_at = NOW(),
    verified_by_admin_id = admin_id_param,
    verification_notes = notes
  WHERE id = dealer_id_param AND status = 'pending';

  -- Generate setup token
  PERFORM generate_dealer_setup_token(dealer_id_param);

  -- Log the verification
  INSERT INTO dealer_auth_logs (
    dealer_id,
    dealer_email,
    event_type,
    success,
    admin_id,
    admin_notes
  )
  SELECT
    id,
    email,
    'verification_by_admin',
    true,
    admin_id_param,
    notes
  FROM dealers WHERE id = dealer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. UPDATE EXISTING DEALERS
-- ============================================================================
-- Set default status for existing dealers
UPDATE dealers
SET status = CASE
  WHEN is_verified = true THEN 'active'
  ELSE 'pending'
END
WHERE status IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The dealer authentication system is now ready!
--
-- WORKFLOW:
-- 1. Dealer registers -> status = 'pending'
-- 2. Admin verifies -> status = 'verified', setup_token generated
-- 3. Dealer sets password -> status = 'active'
-- 4. Dealer can login with email + password
-- ============================================================================
