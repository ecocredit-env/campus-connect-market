ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payout_account_holder text,
  ADD COLUMN IF NOT EXISTS payout_bank_name text,
  ADD COLUMN IF NOT EXISTS payout_account_number text,
  ADD COLUMN IF NOT EXISTS payout_ifsc text,
  ADD COLUMN IF NOT EXISTS payout_upi_id text;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS delivery_charge_note text;