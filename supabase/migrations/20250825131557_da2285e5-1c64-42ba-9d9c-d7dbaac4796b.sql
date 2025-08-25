-- Corriger les politiques RLS pour fonctionner avec les noms d'utilisateurs
DROP POLICY IF EXISTS "Users can view their own orders" ON public.commandes;
CREATE POLICY "Users can view their own orders"
ON public.commandes
FOR SELECT
USING (
  -- Vérifier si le clientname correspond au nom de l'utilisateur connecté
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.commandes;
CREATE POLICY "Users can create their own orders"
ON public.commandes
FOR INSERT
WITH CHECK (
  -- Vérifier si le clientname correspond au nom de l'utilisateur connecté
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.commandes;
CREATE POLICY "Users can update their own orders"
ON public.commandes
FOR UPDATE
USING (
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
)
WITH CHECK (
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Users can delete their own orders" ON public.commandes;
CREATE POLICY "Users can delete their own orders"
ON public.commandes
FOR DELETE
USING (
  clientname IN (
    SELECT COALESCE(u.nom, '')
    FROM public.utilisateurs u
    WHERE u.email = COALESCE(
      auth.email(),
      (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);