-- Activer RLS sur les tables qui n'en ont pas (pas les vues)
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;  

-- Créer des politiques de base pour ces tables
-- Politique pour commandes (authentifié seulement)
CREATE POLICY "Allow authenticated users to select commandes" 
ON public.commandes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert commandes" 
ON public.commandes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update commandes" 
ON public.commandes 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete commandes" 
ON public.commandes 
FOR DELETE 
TO authenticated 
USING (true);

-- Politique pour utilisateurs (authentifié seulement)
CREATE POLICY "Allow authenticated users to select utilisateurs" 
ON public.utilisateurs 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert utilisateurs" 
ON public.utilisateurs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update utilisateurs" 
ON public.utilisateurs 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete utilisateurs" 
ON public.utilisateurs 
FOR DELETE 
TO authenticated 
USING (true);