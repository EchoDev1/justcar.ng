-- Payment Settings Table
-- Stores configuration for payment providers (Paystack, Flutterwave, Monnify)
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
-- Stores bank account details for escrow transactions
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
-- Tracks all payment-related activities for audit purposes
CREATE TABLE IF NOT EXISTS payment_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL, -- 'settings_updated', 'account_added', 'account_deleted', 'test_connection'
  provider VARCHAR(50), -- 'paystack', 'flutterwave', 'monnify', 'escrow', 'platform'
  admin_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_admin_user ON payment_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_provider ON payment_activity_logs(provider);
CREATE INDEX IF NOT EXISTS idx_payment_activity_logs_created_at ON payment_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_bank_accounts_is_default ON escrow_bank_accounts(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_escrow_bank_accounts_is_active ON escrow_bank_accounts(is_active) WHERE is_active = true;

-- Row Level Security (RLS) Policies
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read payment settings
CREATE POLICY "Authenticated users can read payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update payment settings
CREATE POLICY "Authenticated users can update payment settings"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can insert payment settings
CREATE POLICY "Authenticated users can insert payment settings"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can read escrow bank accounts
CREATE POLICY "Authenticated users can read escrow accounts"
  ON escrow_bank_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert escrow bank accounts
CREATE POLICY "Authenticated users can insert escrow accounts"
  ON escrow_bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update escrow bank accounts
CREATE POLICY "Authenticated users can update escrow accounts"
  ON escrow_bank_accounts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete escrow bank accounts
CREATE POLICY "Authenticated users can delete escrow accounts"
  ON escrow_bank_accounts
  FOR DELETE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can read activity logs
CREATE POLICY "Authenticated users can read activity logs"
  ON payment_activity_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert activity logs
CREATE POLICY "Authenticated users can insert activity logs"
  ON payment_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to ensure only one default escrow account
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

-- Trigger to maintain single default account
DROP TRIGGER IF EXISTS trigger_ensure_single_default_escrow_account ON escrow_bank_accounts;
CREATE TRIGGER trigger_ensure_single_default_escrow_account
  BEFORE INSERT OR UPDATE ON escrow_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_escrow_account();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
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

-- Insert default payment settings if not exists
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

-- Comments for documentation
COMMENT ON TABLE payment_settings IS 'Stores payment provider configurations and platform settings';
COMMENT ON TABLE escrow_bank_accounts IS 'Stores bank account details for escrow transactions';
COMMENT ON TABLE payment_activity_logs IS 'Audit log for payment configuration changes';
COMMENT ON COLUMN payment_settings.paystack IS 'Paystack payment gateway configuration (API keys, webhooks)';
COMMENT ON COLUMN payment_settings.flutterwave IS 'Flutterwave payment gateway configuration';
COMMENT ON COLUMN payment_settings.monnify IS 'Monnify payment gateway configuration';
COMMENT ON COLUMN payment_settings.platform IS 'Platform-wide payment settings (fees, limits)';
COMMENT ON COLUMN escrow_bank_accounts.is_default IS 'Indicates if this is the default escrow account';
COMMENT ON COLUMN escrow_bank_accounts.is_active IS 'Indicates if this account is currently active';
