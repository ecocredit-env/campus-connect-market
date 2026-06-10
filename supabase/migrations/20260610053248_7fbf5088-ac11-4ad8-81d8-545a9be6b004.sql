
DROP POLICY IF EXISTS "Listing photos are publicly readable" ON storage.objects;
CREATE POLICY "Users delete own ID docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = (auth.uid())::text);
