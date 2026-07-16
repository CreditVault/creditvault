
CREATE TABLE public.offer_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  claim_url TEXT NOT NULL,
  value TEXT,
  category TEXT NOT NULL,
  audience TEXT NOT NULL,
  description TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.offer_submissions TO anon, authenticated;
GRANT ALL ON public.offer_submissions TO service_role;

ALTER TABLE public.offer_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an offer"
  ON public.offer_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(brand) BETWEEN 2 AND 80
    AND char_length(name) BETWEEN 4 AND 140
    AND char_length(claim_url) BETWEEN 1 AND 400
    AND (value IS NULL OR char_length(value) <= 60)
    AND char_length(category) BETWEEN 1 AND 80
    AND audience IN ('student','startup','developer')
    AND char_length(description) BETWEEN 20 AND 1000
    AND char_length(submitter_email) BETWEEN 3 AND 255
    AND submitter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND status = 'pending'
  );
