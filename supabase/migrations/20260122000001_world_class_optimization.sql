-- =====================================================
-- World-Class Optimization Migration
-- Performance tuning for millions of users
-- Created: 2026-01-22
-- =====================================================

-- =====================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- Based on existing table columns
-- =====================================================

-- Composite index for brand + price filtering (luxury brands)
CREATE INDEX IF NOT EXISTS idx_cars_make_price
ON cars(make, price DESC);

-- Index for location-based searches
CREATE INDEX IF NOT EXISTS idx_cars_location_created
ON cars(location, created_at DESC);

-- Index for condition filtering (Nigerian Used, Foreign Used, New)
CREATE INDEX IF NOT EXISTS idx_cars_condition_created
ON cars(condition, created_at DESC);

-- Composite index for advanced filtering
CREATE INDEX IF NOT EXISTS idx_cars_multi_filter
ON cars(make, body_type, fuel_type, transmission, price);

-- =====================================================
-- LUXURY CARS OPTIMIZATION
-- For the luxury section (≥ ₦150 Million)
-- =====================================================

-- Partial index specifically for luxury cars
CREATE INDEX IF NOT EXISTS idx_cars_luxury_price
ON cars(price DESC, created_at DESC)
WHERE price >= 150000000;

-- =====================================================
-- FULL TEXT SEARCH OPTIMIZATION
-- =====================================================

-- Enhanced full text search index (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_cars_search_v2 ON cars USING GIN (
  to_tsvector('english',
    coalesce(make, '') || ' ' ||
    coalesce(model, '') || ' ' ||
    coalesce(location, '') || ' ' ||
    coalesce(body_type, '') || ' ' ||
    coalesce(condition, '')
  )
);

-- =====================================================
-- DEALER QUERIES OPTIMIZATION
-- =====================================================

-- Index for dealer car queries
CREATE INDEX IF NOT EXISTS idx_cars_dealer_created
ON cars(dealer_id, created_at DESC);

-- =====================================================
-- STATISTICS UPDATE
-- Ensures the query planner has accurate statistics
-- =====================================================

-- Update statistics for cars table
ANALYZE cars;

-- Update statistics for dealers table
ANALYZE dealers;

-- Update statistics for car_images table
ANALYZE car_images;
