-- Ajouter le rôle 'administrateur' aux options existantes
-- Modifier la contrainte pour inclure les trois rôles: ouvrier, magasinier, administrateur
ALTER TABLE public.utilisateurs 
DROP CONSTRAINT IF EXISTS utilisateurs_role_check;

ALTER TABLE public.utilisateurs 
ADD CONSTRAINT utilisateurs_role_check 
CHECK (role IN ('ouvrier', 'magasinier', 'administrateur'));