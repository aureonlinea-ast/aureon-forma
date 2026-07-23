
-- 1. Remove public listing on assets bucket (public URLs still work without a SELECT policy)
DROP POLICY IF EXISTS "assets_public_read" ON storage.objects;

-- 2. Replace always-true INSERT policies with validated ones
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;
CREATE POLICY "Public can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(message) BETWEEN 1 AND 5000
    AND (phone IS NULL OR length(phone) <= 50)
    AND (company IS NULL OR length(company) <= 200)
    AND (project_type IS NULL OR length(project_type) <= 100)
  );

DROP POLICY IF EXISTS "Public can submit quote request" ON public.quote_requests;
CREATE POLICY "Public can submit quote request" ON public.quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(project_type) BETWEEN 1 AND 100
    AND length(project_classification) BETWEEN 1 AND 100
    AND length(timeline) BETWEEN 1 AND 100
    AND array_length(selected_services, 1) IS NULL OR array_length(selected_services, 1) <= 50
    AND (additional_notes IS NULL OR length(additional_notes) <= 5000)
    AND (phone IS NULL OR length(phone) <= 50)
    AND (company IS NULL OR length(company) <= 200)
    AND currency IN ('USD','EUR','GBP','AED','KES','ZAR')
    AND status = 'pending'
    AND (estimated_price IS NULL OR (estimated_price >= 0 AND estimated_price <= 100000000))
  );

-- 3. Perf metrics: validated insert + explicit deny of public reads
DROP POLICY IF EXISTS "perf_metrics insert open" ON public.perf_metrics;
CREATE POLICY "perf_metrics validated insert" ON public.perf_metrics
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(route) BETWEEN 1 AND 200
    AND metric IN ('LCP','CLS','FCP','INP','TTFB','FID')
    AND value >= 0 AND value <= 600000
    AND (rating IS NULL OR rating IN ('good','needs-improvement','poor'))
    AND (device IS NULL OR device IN ('mobile','tablet','desktop'))
    AND (connection IS NULL OR length(connection) <= 20)
    AND (viewport_w IS NULL OR (viewport_w BETWEEN 0 AND 20000))
    AND (viewport_h IS NULL OR (viewport_h BETWEEN 0 AND 20000))
    AND (user_agent IS NULL OR length(user_agent) <= 512)
  );

-- Explicit no-op SELECT policy for anon/authenticated so public reads stay blocked
-- (service role bypasses RLS for admin analytics).
CREATE POLICY "perf_metrics no public select" ON public.perf_metrics
  FOR SELECT TO anon, authenticated
  USING (false);
