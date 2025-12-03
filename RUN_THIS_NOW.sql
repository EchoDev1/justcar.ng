-- ============================================================================
-- READY TO RUN - Your UUID is already filled in!
-- Just copy this entire file and run it in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop and recreate admins table
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

-- Step 2: Create indexes
CREATE INDEX idx_admins_auth_id ON public.admins(auth_id);
CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_admins_role ON public.admins(role);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);

-- Step 3: Create trigger function
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

-- Step 4: Insert YOUR admin user (UUID already filled in!)
-- ⚠️ IMPORTANT: Update the email and name below before running!
INSERT INTO public.admins (auth_id, email, full_name, role, permissions, is_active)
VALUES (
  '9da4ea1a-2124-448a-95fd-2cc1a4e754b1',  -- ✅ Your UUID (already filled in!)
  'admin@justcars.ng',  -- ⚠️ CHANGE THIS to your actual email
  'Admin User',  -- ⚠️ CHANGE THIS to your actual name
  'super_admin',
  '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars", "manage_escrow", "manage_payments", "manage_inspections", "manage_chats"]'::jsonb,
  true
);

-- Step 5: Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "admins_select_policy"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE is_active = true
    )
  );

CREATE POLICY "admins_insert_policy"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "admins_update_superadmin_policy"
  ON public.admins
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "admins_update_own_policy"
  ON public.admins
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "admins_delete_policy"
  ON public.admins
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.admins WHERE role = 'super_admin' AND is_active = true
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT
  '✅ Setup Complete!' as status,
  email,
  full_name,
  role,
  is_active
FROM public.admins;

-- You should see your email above. If yes, you're ready to login!
-- Go to: http://localhost:3000/admin/login
