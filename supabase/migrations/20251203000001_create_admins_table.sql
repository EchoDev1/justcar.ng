-- ============================================================================
-- CREATE ADMINS TABLE
-- Date: 2025-12-03
-- ============================================================================
-- This migration creates the admins table for authentication and authorization

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Use auth.users id for authentication
  auth_id UUID UNIQUE NOT NULL,

  -- Admin details
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- Role and permissions
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,

  -- Permissions (JSON array of permission strings)
  permissions JSONB DEFAULT '["read", "write", "delete"]'::jsonb,

  -- Activity tracking
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON public.admins(auth_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admin policies (only admins can access admin table)
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.is_active = true
    )
  );

DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
CREATE POLICY "Super admins can insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
  );

DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
CREATE POLICY "Super admins can update admins"
  ON public.admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;
CREATE POLICY "Admins can update own profile"
  ON public.admins FOR UPDATE
  USING (public.admins.auth_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT DEFAULT ADMIN
-- ============================================================================
-- Note: You'll need to create this user in Supabase Auth first
-- Then uncomment and update the auth_id below after creating the user

-- Example: After creating admin@justcars.ng in Supabase Auth:
-- INSERT INTO public.admins (auth_id, email, full_name, role, permissions)
-- VALUES (
--   'YOUR_AUTH_UID_HERE',
--   'admin@justcars.ng',
--   'Super Admin',
--   'super_admin',
--   '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars"]'::jsonb
-- );
