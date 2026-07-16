
CREATE TABLE public.scraped_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  source_url text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL,
  brand text,
  description text,
  url text NOT NULL,
  category text,
  value text,
  audience text,
  image_url text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);

CREATE INDEX scraped_offers_source_idx ON public.scraped_offers (source);
CREATE INDEX scraped_offers_last_verified_idx ON public.scraped_offers (last_verified_at DESC);
CREATE INDEX scraped_offers_first_seen_idx ON public.scraped_offers (first_seen_at DESC);

GRANT SELECT ON public.scraped_offers TO anon, authenticated;
GRANT ALL ON public.scraped_offers TO service_role;

ALTER TABLE public.scraped_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view scraped offers"
  ON public.scraped_offers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.scrape_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  status text NOT NULL,
  offers_found int NOT NULL DEFAULT 0,
  offers_new int NOT NULL DEFAULT 0,
  offers_updated int NOT NULL DEFAULT 0,
  error text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

GRANT SELECT ON public.scrape_runs TO anon, authenticated;
GRANT ALL ON public.scrape_runs TO service_role;

ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view scrape runs"
  ON public.scrape_runs FOR SELECT
  TO anon, authenticated
  USING (true);
