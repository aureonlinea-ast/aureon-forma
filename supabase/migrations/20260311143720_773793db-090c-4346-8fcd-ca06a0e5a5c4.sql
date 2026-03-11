
-- Quote requests table
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  project_type text NOT NULL,
  project_classification text NOT NULL,
  selected_services text[] NOT NULL DEFAULT '{}',
  timeline text NOT NULL,
  requirement_period text,
  additional_notes text,
  estimated_price numeric(12,2),
  status text NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quote request"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
