-- ============================================================================
-- FIX ADMIN RLS INFINITE RECURSION
-- Date: 2025-12-03
-- ============================================================================
-- This migration fixes the infinite recursion issue in admin RLS policies
-- by using a SECURITY DEFINER function that bypasses RLS

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admins;

-- Create a function to check if current user is an admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_id = auth.uid() AND is_active = true
  );
END;
$$;

-- Create a function to check if current user is a super admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
END;
$$;

-- Create new policies using the SECURITY DEFINER functions
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "Super admins can insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (public.is_super_admin_user());

CREATE POLICY "Super admins can update any admin"
  ON public.admins FOR UPDATE
  USING (public.is_super_admin_user());

CREATE POLICY "Admins can update own profile"
  ON public.admins FOR UPDATE
  USING (auth_id = auth.uid());

CREATE POLICY "Super admins can delete admins"
  ON public.admins FOR DELETE
  USING (public.is_super_admin_user());

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_user() TO authenticated;
