-- ============================================================================
-- FIX ADMIN RLS INFINITE RECURSION
-- Date: 2025-12-03
-- ============================================================================
-- This migration fixes the infinite recursion in the admins table RLS policy
-- by allowing authenticated users to check their own admin status

-- First, temporarily disable RLS to clean up policies
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;
DROP POLICY IF EXISTS "Authenticated users can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;

-- Re-enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to view their own admin record
-- This is the PRIMARY policy that breaks the infinite recursion
CREATE POLICY "Allow authenticated users to check their admin status"
  ON public.admins FOR SELECT
  USING (auth.uid() = auth_id);

-- Allow admins to view all admin records (only works after they've verified they're an admin)
-- This is a secondary policy for the admin panel
CREATE POLICY "Allow admins to view all admins"
  ON public.admins FOR SELECT
  USING (
    -- First check passes if viewing own record (already allowed by policy above)
    auth.uid() = auth_id
    OR
    -- Second check: if this user has an active admin record, they can see all admins
    -- This won't cause recursion because the first policy already allows them to read their own record
    EXISTS (
      SELECT 1 FROM public.admins self
      WHERE self.auth_id = auth.uid()
      AND self.is_active = true
      AND self.id = (SELECT id FROM public.admins WHERE auth_id = auth.uid() LIMIT 1)
    )
  );

-- Allow super admins to insert new admins
-- Also allow the FIRST admin to be created (bootstrap case)
CREATE POLICY "Allow super admins to insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (
    -- Allow if no admins exist yet (bootstrap case)
    NOT EXISTS (SELECT 1 FROM public.admins LIMIT 1)
    OR
    -- Allow if user is an active super admin
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Allow super admins to update any admin
CREATE POLICY "Allow super admins to update admins"
  ON public.admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Allow any admin to update their own profile
CREATE POLICY "Allow admins to update own profile"
  ON public.admins FOR UPDATE
  USING (auth_id = auth.uid());
