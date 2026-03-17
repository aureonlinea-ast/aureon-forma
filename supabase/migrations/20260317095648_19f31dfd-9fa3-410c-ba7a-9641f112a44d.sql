-- Allow updating quote request status
CREATE POLICY "Allow update quote status"
ON public.quote_requests
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);