
-- contact_submissions
DROP POLICY IF EXISTS "Allow read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Public can submit contact form" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
-- no SELECT/UPDATE/DELETE for anon/authenticated — service_role bypasses RLS

-- quote_requests
DROP POLICY IF EXISTS "Allow read quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow update quote status" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can submit quote request" ON public.quote_requests;
CREATE POLICY "Public can submit quote request" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

-- invoices
DROP POLICY IF EXISTS "Anyone can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can update invoices" ON public.invoices;
-- no policies for anon/authenticated — service_role only

-- service_pricing
DROP POLICY IF EXISTS "Allow update service pricing" ON public.service_pricing;
-- keep "Anyone can read active service pricing" SELECT policy

-- quote_template
DROP POLICY IF EXISTS "Allow update quote template" ON public.quote_template;
-- keep "Anyone can read quote template" SELECT policy

-- currency_rates
DROP POLICY IF EXISTS "Authenticated can manage currencies" ON public.currency_rates;
-- keep "Anyone can read active currencies" SELECT policy

-- Revoke broad write privileges; service_role retains ALL by default
REVOKE INSERT, UPDATE, DELETE ON public.contact_submissions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quote_requests FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.invoices FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.service_pricing FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.currency_rates FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.quote_template FROM anon, authenticated;

GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT SELECT ON public.service_pricing TO anon, authenticated;
GRANT SELECT ON public.currency_rates TO anon, authenticated;
GRANT SELECT ON public.quote_template TO anon, authenticated;
GRANT ALL ON public.contact_submissions, public.quote_requests, public.invoices, public.service_pricing, public.currency_rates, public.quote_template TO service_role;

-- Storage: assets bucket - keep public read, lock writes to service_role
DROP POLICY IF EXISTS "assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_write" ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "assets_admin_delete" ON storage.objects;

CREATE POLICY "assets_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'assets');
CREATE POLICY "assets_admin_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "assets_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "assets_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (false);
