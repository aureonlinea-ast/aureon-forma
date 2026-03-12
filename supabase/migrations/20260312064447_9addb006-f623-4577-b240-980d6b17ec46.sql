
-- Allow SELECT on contact_submissions for anon (admin reads without auth)
CREATE POLICY "Allow read contact submissions"
ON public.contact_submissions
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow SELECT on quote_requests for anon
CREATE POLICY "Allow read quote requests"
ON public.quote_requests
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow UPDATE on service_pricing for anon (admin edits prices)
CREATE POLICY "Allow update service pricing"
ON public.service_pricing
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
