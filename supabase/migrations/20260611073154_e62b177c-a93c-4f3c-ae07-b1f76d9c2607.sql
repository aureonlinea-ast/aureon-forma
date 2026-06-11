
-- 1. Currency rates table
CREATE TABLE IF NOT EXISTS public.currency_rates (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  rate_to_usd numeric NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.currency_rates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.currency_rates TO authenticated;
GRANT ALL ON public.currency_rates TO service_role;

ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active currencies"
  ON public.currency_rates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated can manage currencies"
  ON public.currency_rates FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

INSERT INTO public.currency_rates (code, name, symbol, rate_to_usd) VALUES
  ('USD', 'US Dollar', '$', 1),
  ('KES', 'Kenyan Shilling', 'KSh', 130),
  ('EUR', 'Euro', '€', 0.92),
  ('GBP', 'British Pound', '£', 0.78),
  ('AED', 'UAE Dirham', 'AED', 3.67),
  ('ZAR', 'South African Rand', 'R', 18.5)
ON CONFLICT (code) DO NOTHING;

-- 2. Add currency to service_pricing
ALTER TABLE public.service_pricing
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- 3. Add default_currency and supported_currencies to quote_template
ALTER TABLE public.quote_template
  ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS supported_currencies text[] NOT NULL DEFAULT ARRAY['USD','KES','EUR','GBP','AED'];

-- 4. Add currency to quote_requests for record-keeping
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
