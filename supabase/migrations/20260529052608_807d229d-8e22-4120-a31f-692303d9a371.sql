-- Restore EXECUTE on has_role so RLS policies that call it work for normal users.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_counterparty_contact(uuid) TO authenticated;