
-- Fix search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict execute on SECURITY DEFINER functions (trigger funcs don't need PUBLIC execute)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Tighten listing-photos: drop broad public read, require authenticated
DROP POLICY "Listing photos public read" ON storage.objects;
CREATE POLICY "Listing photos read authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'listing-photos');
