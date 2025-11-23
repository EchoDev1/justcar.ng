-- =====================================================
-- ADMIN SETUP FOR JUSTCARS.NG
-- Admin user management and queries
-- =====================================================

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. Admins MUST be created in Supabase Auth FIRST
-- 2. Then you link them here using their auth UUID
-- 3. To create admin in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Click "Add user"
--    - Enter email and password
--    - Copy the user's UUID
--    - Use that UUID in the INSERT below
-- =====================================================

-- =====================================================
-- METHOD 1: Insert admin using Auth UUID
-- (Use this AFTER creating user in Supabase Auth)
-- =====================================================

-- Example: Replace 'YOUR-AUTH-UUID-HERE' with actual UUID from Supabase Auth
-- INSERT INTO admins (id, email, role)
-- VALUES
--   ('YOUR-AUTH-UUID-HERE', 'admin@justcars.ng', 'super_admin');

-- =====================================================
-- METHOD 2: Insert multiple admins
-- =====================================================

-- Uncomment and replace UUIDs after creating users in Auth:
/*
INSERT INTO admins (id, email, role) VALUES
  ('uuid-of-super-admin', 'superadmin@justcars.ng', 'super_admin'),
  ('uuid-of-admin-1', 'admin1@justcars.ng', 'admin'),
  ('uuid-of-admin-2', 'admin2@justcars.ng', 'admin');
*/

-- =====================================================
-- USEFUL ADMIN QUERIES
-- =====================================================

-- View all admins
-- SELECT * FROM admins ORDER BY created_at DESC;

-- View admins with their auth details
-- SELECT
--   a.id,
--   a.email,
--   a.role,
--   a.created_at,
--   au.created_at as auth_created_at,
--   au.last_sign_in_at
-- FROM admins a
-- LEFT JOIN auth.users au ON a.id = au.id
-- ORDER BY a.created_at DESC;

-- Count admins by role
-- SELECT role, COUNT(*) as count
-- FROM admins
-- GROUP BY role;

-- =====================================================
-- ADMIN DASHBOARD STATISTICS QUERIES
-- =====================================================

-- Total counts for dashboard
-- SELECT
--   (SELECT COUNT(*) FROM dealers) as total_dealers,
--   (SELECT COUNT(*) FROM dealers WHERE is_verified = true) as verified_dealers,
--   (SELECT COUNT(*) FROM cars) as total_cars,
--   (SELECT COUNT(*) FROM cars WHERE is_verified = true) as verified_cars,
--   (SELECT COUNT(*) FROM cars WHERE is_featured = true) as featured_cars;

-- Recent activity
-- SELECT
--   'dealer' as type,
--   name as title,
--   email,
--   created_at,
--   is_verified
-- FROM dealers
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Cars pending verification
-- SELECT
--   c.id,
--   c.make,
--   c.model,
--   c.year,
--   c.price,
--   d.name as dealer_name,
--   c.created_at
-- FROM cars c
-- JOIN dealers d ON c.dealer_id = d.id
-- WHERE c.is_verified = false
-- ORDER BY c.created_at DESC;

-- Dealers pending verification
-- SELECT
--   id,
--   name,
--   email,
--   phone,
--   location,
--   created_at
-- FROM dealers
-- WHERE is_verified = false
-- ORDER BY created_at DESC;

-- =====================================================
-- ADMIN MANAGEMENT QUERIES
-- =====================================================

-- Promote admin to super_admin
-- UPDATE admins
-- SET role = 'super_admin'
-- WHERE email = 'admin@justcars.ng';

-- Demote super_admin to admin
-- UPDATE admins
-- SET role = 'admin'
-- WHERE email = 'admin@justcars.ng';

-- Remove admin (will also delete from auth.users due to CASCADE)
-- DELETE FROM admins WHERE email = 'admin@justcars.ng';

-- =====================================================
-- VERIFICATION ACTIONS (Admin Operations)
-- =====================================================

-- Verify a dealer
-- UPDATE dealers
-- SET is_verified = true
-- WHERE id = 'dealer-uuid-here';

-- Verify a car
-- UPDATE cars
-- SET is_verified = true
-- WHERE id = 'car-uuid-here';

-- Feature a car
-- UPDATE cars
-- SET is_featured = true
-- WHERE id = 'car-uuid-here';

-- Unfeature a car
-- UPDATE cars
-- SET is_featured = false
-- WHERE id = 'car-uuid-here';

-- =====================================================
-- BULK OPERATIONS
-- =====================================================

-- Verify all dealers from a specific location
-- UPDATE dealers
-- SET is_verified = true
-- WHERE location = 'Lagos' AND is_verified = false;

-- Verify all cars from verified dealers
-- UPDATE cars c
-- SET is_verified = true
-- FROM dealers d
-- WHERE c.dealer_id = d.id
--   AND d.is_verified = true
--   AND c.is_verified = false;

-- =====================================================
-- REPORTS AND ANALYTICS
-- =====================================================

-- Cars by location
-- SELECT
--   location,
--   COUNT(*) as total_cars,
--   COUNT(*) FILTER (WHERE is_verified = true) as verified_cars,
--   AVG(price)::BIGINT as avg_price,
--   MIN(price) as min_price,
--   MAX(price) as max_price
-- FROM cars
-- GROUP BY location
-- ORDER BY total_cars DESC;

-- Cars by make
-- SELECT
--   make,
--   COUNT(*) as total_cars,
--   AVG(price)::BIGINT as avg_price
-- FROM cars
-- GROUP BY make
-- ORDER BY total_cars DESC;

-- Dealers by location
-- SELECT
--   location,
--   COUNT(*) as total_dealers,
--   COUNT(*) FILTER (WHERE is_verified = true) as verified_dealers
-- FROM dealers
-- GROUP BY location
-- ORDER BY total_dealers DESC;

-- Most expensive cars
-- SELECT
--   c.make,
--   c.model,
--   c.year,
--   c.price,
--   c.location,
--   d.name as dealer_name
-- FROM cars c
-- JOIN dealers d ON c.dealer_id = d.id
-- ORDER BY c.price DESC
-- LIMIT 10;

-- Most active dealers (by number of cars)
-- SELECT
--   d.name,
--   d.email,
--   d.location,
--   COUNT(c.id) as total_cars,
--   COUNT(c.id) FILTER (WHERE c.is_verified = true) as verified_cars
-- FROM dealers d
-- LEFT JOIN cars c ON d.id = c.dealer_id
-- GROUP BY d.id, d.name, d.email, d.location
-- ORDER BY total_cars DESC
-- LIMIT 10;

-- =====================================================
-- QUICK START GUIDE
-- =====================================================

-- STEP 1: Create admin user in Supabase Dashboard
-- - Go to Authentication > Users > Add user
-- - Email: admin@justcars.ng
-- - Password: (create a strong password)
-- - Copy the user's UUID

-- STEP 2: Link the auth user to admins table
-- Replace 'YOUR-UUID-HERE' with the actual UUID from step 1:
-- INSERT INTO admins (id, email, role)
-- VALUES ('YOUR-UUID-HERE', 'admin@justcars.ng', 'super_admin');

-- STEP 3: Verify the admin was created
-- SELECT * FROM admins;

-- STEP 4: Test admin login
-- - Log in with the email and password you created
-- - Your app should check if the user exists in admins table
-- - If yes, grant admin access based on their role

-- =====================================================
-- EXAMPLE: Create a test admin (for development only)
-- =====================================================

-- For testing purposes, you can create a test admin like this:

-- 1. First, create the user in Supabase Auth Dashboard with:
--    Email: test-admin@justcars.ng
--    Password: TestAdmin123!

-- 2. After creating, get the UUID and run:
-- INSERT INTO admins (id, email, role)
-- VALUES ('paste-uuid-here', 'test-admin@justcars.ng', 'admin');

-- =====================================================
-- SECURITY NOTES
-- =====================================================

-- 1. NEVER share admin credentials
-- 2. Use strong passwords (min 12 characters, mixed case, numbers, symbols)
-- 3. Super admins can manage all admins and data
-- 4. Regular admins can verify dealers/cars but cannot manage other admins
-- 5. Always use RLS (Row Level Security) policies in production
-- 6. Consider implementing 2FA for admin accounts
-- 7. Regularly audit admin actions using Supabase logs

-- =====================================================
-- COMPLETION
-- =====================================================

-- Admin setup guide complete!
-- Follow the Quick Start Guide above to create your first admin user.

