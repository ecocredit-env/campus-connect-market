
CREATE OR REPLACE FUNCTION public.profiles_guard_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Service role (used by server functions) bypasses the guard.
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.verification_status := OLD.verification_status;
  NEW.verification_notes  := OLD.verification_notes;
  NEW.verified_at         := OLD.verified_at;
  NEW.average_rating      := OLD.average_rating;
  NEW.total_transactions  := OLD.total_transactions;
  RETURN NEW;
END;
$function$;
