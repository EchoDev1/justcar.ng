-- ============================================================================
-- QUICK ADMIN SETUP - Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '["read", "write", "delete"]'::jsonb,
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON public.admins(auth_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

-- Step 3: Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any)
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;

-- Step 5: Create RLS policies
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Super admins can insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
  );

CREATE POLICY "Super admins can update admins"
  ON public.admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.auth_id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
  );

CREATE POLICY "Admins can update own profile"
  ON public.admins FOR UPDATE
  USING (auth_id = auth.uid());

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Step 7: LINK YOUR EXISTING AUTH USER TO ADMINS TABLE
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to: Authentication → Users in Supabase Dashboard
-- 2. Find your admin user and copy their UUID
-- 3. Replace 'YOUR_AUTH_USER_ID_HERE' below with that UUID
-- 4. Replace 'your-email@example.com' with your actual email
-- 5. Replace 'Your Name' with your actual name
-- 6. Uncomment the INSERT statement below and run it
--

/*
INSERT INTO public.admins (auth_id, email, full_name, role, permissions, is_active)
VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- ⚠️ REPLACE THIS with your UUID from Auth → Users
  'your-email@example.com',  -- ⚠️ REPLACE with your email
  'Your Name',               -- ⚠️ REPLACE with your name
  'super_admin',
  '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars", "manage_escrow", "manage_payments", "manage_inspections", "manage_chats"]'::jsonb,
  true
)
ON CONFLICT (auth_id) DO NOTHING;  -- This prevents errors if admin already exists
*/

-- ============================================================================
-- VERIFICATION QUERY - Run this to check if your admin was created
-- ============================================================================
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.admins;

-- If you see your email in the results above, setup is complete! ✅
-- You can now login at: http://localhost:3000/admin/login
