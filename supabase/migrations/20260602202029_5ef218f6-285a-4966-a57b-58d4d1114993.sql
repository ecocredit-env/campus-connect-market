CREATE TABLE public.admin_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_applications TO authenticated;
GRANT ALL ON public.admin_applications TO service_role;

ALTER TABLE public.admin_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own application"
  ON public.admin_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own application"
  ON public.admin_applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users delete own pending application"
  ON public.admin_applications FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage applications"
  ON public.admin_applications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_admin_applications
  BEFORE UPDATE ON public.admin_applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();