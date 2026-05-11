
DROP POLICY "Anyone can submit reseller application" ON public.reseller_applications;
CREATE POLICY "Public can submit reseller application"
ON public.reseller_applications FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) between 2 and 120
  AND length(phone) between 7 and 20
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND status = 'pending'
);

DROP POLICY "Anyone can upload reseller docs" ON storage.objects;
CREATE POLICY "Public can upload reseller docs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'reseller-docs'
  AND (storage.foldername(name))[1] = 'applications'
);
