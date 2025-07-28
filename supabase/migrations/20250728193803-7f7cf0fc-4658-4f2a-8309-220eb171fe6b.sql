-- Ajouter les politiques RLS manquantes pour la table catalogue

-- Politique pour INSERT
CREATE POLICY "Allow authenticated users to insert catalogue" 
ON public.catalogue 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Politique pour UPDATE
CREATE POLICY "Allow authenticated users to update catalogue" 
ON public.catalogue 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Politique pour DELETE
CREATE POLICY "Allow authenticated users to delete catalogue" 
ON public.catalogue 
FOR DELETE 
TO authenticated 
USING (true);