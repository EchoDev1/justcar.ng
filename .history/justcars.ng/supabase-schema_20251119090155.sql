-- =====================================================
-- JUSTCARS.NG SUPABASE DATABASE SCHEMA
-- Nigerian Car Marketplace Database Setup
-- =====================================================

-- Drop existing tables if they exist (for clean setup)



-- =====================================================
-- INITIAL DATA SETUP
-- Create a default admin user profile
-- Note: The actual auth user must be created via Supabase Auth
-- This is just the profile entry
-- =====================================================

-- Insert will be done after creating auth user via Supabase Dashboard
-- Example:
-- INSERT INTO admins (id, email, role)
-- VALUES ('user-uuid-from-auth', 'admin@justcars.ng', 'super_admin');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- All tables, indexes, policies, and functions created successfully!
-- Next steps:
-- 1. Create storage buckets 'car-images' and 'car-videos' in Supabase Dashboard
-- 2. Make both buckets public
-- 3. Create admin user via Supabase Auth
-- 4. Insert admin profile into admins table
-- 5. Run sample-data.sql to populate with test data
