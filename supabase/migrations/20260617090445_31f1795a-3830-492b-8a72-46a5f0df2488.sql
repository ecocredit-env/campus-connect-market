CREATE POLICY "Users update own listing photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Public can view listing photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-photos');