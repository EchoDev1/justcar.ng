-- Migration: Create dealer_bank_details table
-- Description: Stores dealer bank account information for payment processing
-- Date: 2025-12-14

-- Create dealer_bank_details table
CREATE TABLE IF NOT EXISTS dealer_bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(10),
  account_type VARCHAR(20) DEFAULT 'savings' CHECK (account_type IN ('savings', 'current')),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(dealer_id),
  CHECK (LENGTH(account_number) >= 10 AND LENGTH(account_number) <= 20)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dealer_bank_details_dealer_id ON dealer_bank_details(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_bank_details_is_verified ON dealer_bank_details(is_verified);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dealer_bank_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dealer_bank_details_updated_at
  BEFORE UPDATE ON dealer_bank_details
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_bank_details_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE dealer_bank_details ENABLE ROW LEVEL SECURITY;

-- Policy: Dealers can view and manage their own bank details
CREATE POLICY dealer_bank_details_dealer_policy ON dealer_bank_details
  FOR ALL
  USING (dealer_id = auth.uid())
  WITH CHECK (dealer_id = auth.uid());

-- Policy: Admins can view all bank details
CREATE POLICY dealer_bank_details_admin_policy ON dealer_bank_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- Policy: Admins can update verification status
CREATE POLICY dealer_bank_details_admin_update_policy ON dealer_bank_details
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON dealer_bank_details TO authenticated;
GRANT SELECT ON dealer_bank_details TO anon;

-- Add comment to table
COMMENT ON TABLE dealer_bank_details IS 'Stores dealer bank account information for receiving payments and payouts';
COMMENT ON COLUMN dealer_bank_details.is_verified IS 'Indicates if admin has verified the bank account information';
COMMENT ON COLUMN dealer_bank_details.verified_at IS 'Timestamp when admin verified the bank account';
