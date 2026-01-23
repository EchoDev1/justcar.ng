-- Add email verification columns to buyers table
-- This migration adds columns needed for custom email verification flow using Resend

ALTER TABLE public.buyers
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_buyers_verification_token ON public.buyers(verification_token) WHERE verification_token IS NOT NULL;

-- Create index for email verification status
CREATE INDEX IF NOT EXISTS idx_buyers_email_verified ON public.buyers(email_verified);

-- Update RLS policy to allow service role to insert buyers
DROP POLICY IF EXISTS "Service role can insert buyers" ON public.buyers;
CREATE POLICY "Service role can insert buyers"
  ON public.buyers FOR INSERT
  WITH CHECK (true);

-- Allow service role to update verification status
DROP POLICY IF EXISTS "Service role can update buyers" ON public.buyers;
CREATE POLICY "Service role can update buyers"
  ON public.buyers FOR UPDATE
  USING (true);
