-- ============================================================================
-- SIMPLE ADMIN SETUP - NO RLS INITIALLY
-- This avoids column reference errors by creating admin BEFORE enabling RLS
-- ============================================================================

-- PART 1: Create the table (NO RLS YET)
-- ============================================================================

DROP TABLE IF EXISTS public.admins CASCADE;

CREATE TABLE public.admins (
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

-- Create indexes
CREATE INDEX idx_admins_auth_id ON public.admins(auth_id);
CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_admins_role ON public.admins(role);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 2: INSERT YOUR ADMIN USER NOW
-- ============================================================================
--
-- 🚨 IMPORTANT: Before running Part 3, you MUST:
--    1. Go to: Authentication → Users in Supabase Dashboard
--    2. Find your user and copy their UUID
--    3. Uncomment and run the INSERT below:

/*
INSERT INTO public.admins (auth_id, email, full_name, role, permissions, is_active)
VALUES (
  'YOUR_USER_UUID_HERE',           -- ⚠️ REPLACE with UUID from Auth → Users
  'your-email@example.com',        -- ⚠️ REPLACE with your email
  'Your Full Name',                -- ⚠️ REPLACE with your name
  'super_admin',
  '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars", "manage_escrow", "manage_payments", "manage_inspections", "manage_chats"]'::jsonb,
  true
);
*/

-- ============================================================================
-- PART 3: Enable RLS and Create Policies (RUN AFTER INSERTING ADMIN)
-- ============================================================================
--
-- After you've inserted your admin user above, uncomment and run this section:

/*
-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can view all admins
CREATE POLICY "admins_select_policy"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE is_active = true
    )
  );

-- Policy 2: Super admins can insert new admins
CREATE POLICY "admins_insert_policy"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );

-- Policy 3: Super admins can update any admin
CREATE POLICY "admins_update_superadmin_policy"
  ON public.admins
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );

-- Policy 4: Admins can update their own profile
CREATE POLICY "admins_update_own_policy"
  ON public.admins
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- Policy 5: Super admins can delete admins
CREATE POLICY "admins_delete_policy"
  ON public.admins
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to check your admin was created:
SELECT id, email, full_name, role, is_active, created_at FROM public.admins;
