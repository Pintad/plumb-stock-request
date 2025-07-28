-- Mettre à jour la politique SELECT pour permettre l'accès public au catalogue
DROP POLICY IF EXISTS "select_catalogue" ON public.catalogue;

-- Nouvelle politique pour permettre la lecture publique
CREATE POLICY "Public can view catalogue" 
ON public.catalogue 
FOR SELECT 
USING (true);