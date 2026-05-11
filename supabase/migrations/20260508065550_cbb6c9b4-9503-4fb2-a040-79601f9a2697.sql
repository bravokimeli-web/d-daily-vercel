
-- Reseller applications
CREATE TYPE public.reseller_status AS ENUM ('pending','under_review','approved','rejected');

CREATE TABLE public.reseller_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  id_front_url text,
  id_back_url text,
  kra_pin_url text,
  additional_doc_url text,
  status public.reseller_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

ALTER TABLE public.reseller_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit reseller application"
ON public.reseller_applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No public read; admins via service role only
-- Storage bucket for reseller documents (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('reseller-docs','reseller-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone (anon) to upload to reseller-docs (apply uploads)
CREATE POLICY "Anyone can upload reseller docs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'reseller-docs');
