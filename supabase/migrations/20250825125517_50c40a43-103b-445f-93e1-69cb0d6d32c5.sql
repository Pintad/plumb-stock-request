-- Align admin check with application roles stored in public.utilisateurs
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.utilisateurs u
    WHERE u.email = public.jwt_email()
      AND u.role IN ('magasinier', 'administrateur')
  );
$$;