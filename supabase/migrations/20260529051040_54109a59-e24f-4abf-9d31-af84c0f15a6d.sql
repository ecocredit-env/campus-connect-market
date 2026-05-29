
-- 1. Restrict profiles SELECT to own row + admins
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- 2. Public-safe profile view (non-sensitive columns)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, profile_photo, bio, average_rating,
       total_transactions, verification_status, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 3. Prevent self-promotion: trigger blocks non-admins from changing admin-controlled fields
CREATE OR REPLACE FUNCTION public.profiles_guard_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.verification_status := OLD.verification_status;
  NEW.verification_notes  := OLD.verification_notes;
  NEW.verified_at         := OLD.verified_at;
  NEW.average_rating      := OLD.average_rating;
  NEW.total_transactions  := OLD.total_transactions;
  -- Allow user to (re)submit ID doc; clearing or replacing is fine.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_admin_fields ON public.profiles;
CREATE TRIGGER profiles_guard_admin_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_admin_fields();

-- Add WITH CHECK to update policy to prevent id swap
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Listings: add WITH CHECK so seller_id can't be reassigned
DROP POLICY IF EXISTS "Sellers update own listings" ON public.listings;
CREATE POLICY "Sellers update own listings"
ON public.listings FOR UPDATE TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- 5. Interest requests: tighten INSERT and add DELETE policy
DROP POLICY IF EXISTS "Buyers create interest" ON public.interest_requests;
CREATE POLICY "Buyers create interest"
ON public.interest_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = buyer_id
  AND auth.uid() <> seller_id
  AND EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id AND l.seller_id = interest_requests.seller_id
  )
);

CREATE POLICY "Parties delete own interest"
ON public.interest_requests FOR DELETE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 6. RPC: counterparty contact, gated by approved interest_request
CREATE OR REPLACE FUNCTION public.get_counterparty_contact(_other_user uuid)
RETURNS TABLE (id uuid, full_name text, phone text, college_email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.phone, p.college_email
  FROM public.profiles p
  WHERE p.id = _other_user
    AND EXISTS (
      SELECT 1 FROM public.interest_requests ir
      WHERE ir.status = 'approved'
        AND (
          (ir.buyer_id = auth.uid() AND ir.seller_id = _other_user)
          OR (ir.seller_id = auth.uid() AND ir.buyer_id = _other_user)
        )
    );
$$;

REVOKE ALL ON FUNCTION public.get_counterparty_contact(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_counterparty_contact(uuid) TO authenticated;

-- 7. Lock down internal SECURITY DEFINER helpers from PostgREST exposure
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.profiles_guard_admin_fields() FROM public, anon, authenticated;

-- 8. Storage: drop broad listing-photos SELECT policy (public URLs still resolve via public bucket)
DROP POLICY IF EXISTS "Listing photos read authenticated" ON storage.objects;
