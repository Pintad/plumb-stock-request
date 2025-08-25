-- Étendre la visibilité aux anciennes commandes enregistrées avec le nom (utilisateurs.nom)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;
CREATE POLICY "Users can view their own orders"
ON public.commandes
FOR SELECT
USING (
  -- Cas standard: clientname = email
  clientname = COALESCE(
    auth.email(),
    (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
  OR
  -- Cas legacy: clientname = nom de l'utilisateur correspondant à cet email
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);
