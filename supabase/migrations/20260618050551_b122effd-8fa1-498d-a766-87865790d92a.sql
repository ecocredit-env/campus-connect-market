ALTER TABLE public.profiles
  ADD COLUMN college_email_verified boolean
  GENERATED ALWAYS AS (
    college_email IS NOT NULL
    AND lower(college_email) ~ '@([a-z0-9-]+\.)*(ac\.in|edu|edu\.in)$'
  ) STORED;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  profile_photo,
  bio,
  average_rating,
  total_transactions,
  verification_status,
  college_email_verified,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;