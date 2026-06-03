-- 1) Restrict sellers' UPDATE on interest_requests
DROP POLICY IF EXISTS "Sellers respond to interest" ON public.interest_requests;

CREATE POLICY "Sellers respond to interest"
ON public.interest_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (
  auth.uid() = seller_id
  AND seller_id = (SELECT ir.seller_id FROM public.interest_requests ir WHERE ir.id = interest_requests.id)
  AND buyer_id  = (SELECT ir.buyer_id  FROM public.interest_requests ir WHERE ir.id = interest_requests.id)
  AND listing_id = (SELECT ir.listing_id FROM public.interest_requests ir WHERE ir.id = interest_requests.id)
  AND initial_message IS NOT DISTINCT FROM (SELECT ir.initial_message FROM public.interest_requests ir WHERE ir.id = interest_requests.id)
  AND created_at = (SELECT ir.created_at FROM public.interest_requests ir WHERE ir.id = interest_requests.id)
);

-- 2) Add explicit SELECT policy for listing-photos storage bucket
DROP POLICY IF EXISTS "Listing photos are publicly readable" ON storage.objects;
CREATE POLICY "Listing photos are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-photos');
