-- Corriger la fonction jwt_email pour mieux gérer l'extraction de l'email
CREATE OR REPLACE FUNCTION public.jwt_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'email'),
    auth.email()
  );
$$;

-- Mettre à jour les politiques RLS pour les commandes pour utiliser l'email de l'utilisateur authentifié
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;
CREATE POLICY "Users can view their own orders" 
ON public.commandes 
FOR SELECT 
USING (
  clientname = COALESCE(
    auth.email(),
    (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);