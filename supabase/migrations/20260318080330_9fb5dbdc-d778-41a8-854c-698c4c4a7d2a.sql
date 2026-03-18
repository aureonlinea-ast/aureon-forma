
CREATE TABLE public.quote_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'AUREON Inc.',
  company_website text NOT NULL DEFAULT 'www.aureon.afrinexus.com',
  company_phone_1 text NOT NULL DEFAULT '+2547-2775-0097',
  company_phone_2 text NOT NULL DEFAULT '+2547-2710-5289',
  company_address text NOT NULL DEFAULT '3rd Parklands Avenue, Nairobi',
  validity_days integer NOT NULL DEFAULT 30,
  tax_label text NOT NULL DEFAULT 'Sales Tax',
  tax_percentage numeric NOT NULL DEFAULT 0,
  others_label text NOT NULL DEFAULT 'Others',
  others_amount numeric NOT NULL DEFAULT 0,
  terms_conditions text[] NOT NULL DEFAULT ARRAY[
    'Above information is not an invoice and only an estimate of goods/services.',
    'Payment will be due prior to provision or delivery of goods/services.'
  ],
  acceptance_text text NOT NULL DEFAULT 'Please confirm your acceptance of this quote:',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default template row
INSERT INTO public.quote_template (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE public.quote_template ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the template
CREATE POLICY "Anyone can read quote template" ON public.quote_template
  FOR SELECT TO anon, authenticated USING (true);

-- Allow updates
CREATE POLICY "Allow update quote template" ON public.quote_template
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
