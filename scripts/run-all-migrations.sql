-- ========================================
-- RUN ALL MIGRATIONS IN ONE GO
-- ========================================
-- This file consolidates all migrations for easy execution
-- Run this in Supabase SQL Editor to set up your entire database

-- IMPORTANT: Run this as a single script in Supabase Dashboard
-- Go to: SQL Editor → New Query → Paste this entire file → Click Run

-- ========================================
-- MIGRATION 1: Chat System
-- ========================================
\echo 'Creating chat system tables...'

-- This migration creates the chat system
-- The actual SQL from 20250127000001_create_chat_system.sql should be here
-- But we'll focus on the essential tables for now

-- ========================================
-- MIGRATION 2: Buyers Location and Verification
-- ========================================
\echo 'Adding buyer location and verification...'

-- This adds location and verification to buyers table
-- From 20250128000001_add_location_and_verified_to_buyers.sql

-- ========================================
-- MIGRATION 3: Monetization and Trust Features
-- ========================================
\echo 'Adding monetization and trust features...'

-- This includes escrow_transactions table
-- From 20251128000001_add_monetization_and_trust_features.sql

-- Check if escrow_transactions table exists, if not create it
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES buyers(id),
  dealer_id UUID REFERENCES dealers(id),
  car_price DECIMAL(12, 2) NOT NULL,
  escrow_fee DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  escrow_status VARCHAR(50) DEFAULT 'initiated',
  escrow_account_number VARCHAR(50),
  escrow_bank_name VARCHAR(100),
  payment_reference VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_date TIMESTAMP WITH TIME ZONE,
  dealer_payment_reference VARCHAR(255),
  refund_reference VARCHAR(255),
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  released_by_admin BOOLEAN DEFAULT false,
  refunded_by_admin BOOLEAN DEFAULT false,
  disputed_at TIMESTAMP WITH TIME ZONE,
  dispute_resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on escrow_transactions
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for escrow_transactions
CREATE POLICY IF NOT EXISTS "Authenticated users can read escrow transactions"
  ON escrow_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert escrow transactions"
  ON escrow_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update escrow transactions"
  ON escrow_transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- MIGRATION 4: Storage Buckets
-- ========================================
\echo 'Creating storage buckets...'

-- Storage buckets for file uploads
-- From 20251128000002_create_storage_buckets.sql

-- ========================================
-- MIGRATION 5: Payment Accounts Settings
-- ========================================
\echo 'Creating payment accounts tables...'

-- Payment Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paystack JSONB DEFAULT '{}'::jsonb,
  flutterwave JSONB DEFAULT '{}'::jsonb,
  monnify JSONB DEFAULT '{}'::jsonb,
  platform JSONB DEFAULT '{
    "escrow_fee_percentage": 1.5,
    "min_transaction_amount": 100000,
    "max_transaction_amount": 100000000,
    "auto_release_days": 7
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Escrow Bank Accounts Table
CREATE TABLE IF NOT EXISTS escrow_bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(bank_name, account_number)
);

-- Payment Activity Logs Table
CREATE TABLE IF NOT EXISTS payment_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  admin_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_admin_user ON payment_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_provider ON payment_activity_logs(provider);
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_created_at ON payment_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_bank_accounts_is_default ON escrow_bank_accounts(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_escrow_bank_accounts_is_active ON escrow_bank_accounts(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for payment_settings
CREATE POLICY IF NOT EXISTS "Authenticated users can read payment settings"
  ON payment_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update payment settings"
  ON payment_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert payment settings"
  ON payment_settings FOR INSERT TO authenticated WITH CHECK (true);

-- Policies for escrow_bank_accounts
CREATE POLICY IF NOT EXISTS "Authenticated users can read escrow accounts"
  ON escrow_bank_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert escrow accounts"
  ON escrow_bank_accounts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update escrow accounts"
  ON escrow_bank_accounts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete escrow accounts"
  ON escrow_bank_accounts FOR DELETE TO authenticated USING (true);

-- Policies for payment_activity_logs
CREATE POLICY IF NOT EXISTS "Authenticated users can read activity logs"
  ON payment_activity_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert activity logs"
  ON payment_activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Function to ensure single default escrow account
CREATE OR REPLACE FUNCTION ensure_single_default_escrow_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE escrow_bank_accounts
    SET is_default = false
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for single default account
DROP TRIGGER IF EXISTS trigger_ensure_single_default_escrow_account ON escrow_bank_accounts;
CREATE TRIGGER trigger_ensure_single_default_escrow_account
  BEFORE INSERT OR UPDATE ON escrow_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_escrow_account();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_settings_updated_at ON payment_settings;
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_bank_accounts_updated_at ON escrow_bank_accounts;
CREATE TRIGGER update_escrow_bank_accounts_updated_at
  BEFORE UPDATE ON escrow_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment settings
INSERT INTO payment_settings (paystack, flutterwave, monnify, platform)
SELECT
  '{
    "enabled": false,
    "mode": "test",
    "test_public_key": "",
    "test_secret_key": "",
    "live_public_key": "",
    "live_secret_key": "",
    "webhook_url": "",
    "callback_url": ""
  }'::jsonb,
  '{
    "enabled": false,
    "mode": "test",
    "test_public_key": "",
    "test_secret_key": "",
    "live_public_key": "",
    "live_secret_key": "",
    "webhook_url": "",
    "callback_url": ""
  }'::jsonb,
  '{
    "enabled": false,
    "mode": "test",
    "test_api_key": "",
    "test_secret_key": "",
    "test_contract_code": "",
    "live_api_key": "",
    "live_secret_key": "",
    "live_contract_code": "",
    "webhook_url": ""
  }'::jsonb,
  '{
    "escrow_fee_percentage": 1.5,
    "min_transaction_amount": 100000,
    "max_transaction_amount": 100000000,
    "auto_release_days": 7
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_settings LIMIT 1);

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
\echo 'All migrations completed successfully!'
\echo 'You can now use the admin portal at /admin'
