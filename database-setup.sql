-- Script SQL complet pour créer toutes les tables du projet
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table des affaires
CREATE TABLE public.affaires (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- 2. Créer la table des utilisateurs
CREATE TABLE public.utilisateurs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nom text,
    email text,
    role text DEFAULT 'ouvrier'::text,
    PRIMARY KEY (id)
);

-- 3. Créer la table du catalogue
CREATE TABLE public.catalogue (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    categorie text,
    designation text,
    variante text,
    reference text,
    unite text,
    image_url text,
    sur_categorie text DEFAULT 'RACCORD'::text,
    keywords text,
    PRIMARY KEY (id)
);

-- 4. Créer la séquence pour les numéros de commande
CREATE SEQUENCE commandes_numero_commande_global_seq;

-- 5. Créer la table des commandes
CREATE TABLE public.commandes (
    commandeid uuid NOT NULL DEFAULT gen_random_uuid(),
    numero_commande_global integer NOT NULL DEFAULT nextval('commandes_numero_commande_global_seq'::regclass),
    datecommande date DEFAULT now(),
    articles jsonb NOT NULL,
    titre_affichage text,
    clientname text NOT NULL,
    termine text DEFAULT 'Non'::text,
    messagefournisseur text,
    affaire_id uuid,
    date_mise_a_disposition date,
    archive boolean DEFAULT false,
    archiveclient boolean DEFAULT false,
    PRIMARY KEY (commandeid),
    FOREIGN KEY (affaire_id) REFERENCES public.affaires(id)
);

-- 6. Créer la table des profils
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    name text,
    role text NOT NULL DEFAULT 'worker'::text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. Créer la vue des commandes détaillées
CREATE VIEW public.v_commandes_detaillees AS
SELECT 
    c.numero_commande_global AS numero_demande,
    c.commandeid AS commande_id,
    a.code AS code_affaire,
    a.name AS nom_affaire,
    u.nom AS nom_utilisateur,
    c.titre_affichage
FROM commandes c
LEFT JOIN affaires a ON c.affaire_id = a.id
LEFT JOIN utilisateurs u ON u.email = (
    SELECT email FROM auth.users WHERE id = (
        SELECT id FROM profiles WHERE email = c.clientname LIMIT 1
    ) LIMIT 1
);

-- 8. Activer Row Level Security sur toutes les tables
ALTER TABLE public.affaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS pour la table affaires
CREATE POLICY "Allow authenticated users to select affaires" ON public.affaires
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert affaires" ON public.affaires
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update affaires" ON public.affaires
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete affaires" ON public.affaires
    FOR DELETE TO authenticated USING (true);

-- 10. Créer les politiques RLS pour la table utilisateurs
CREATE POLICY "Allow authenticated users to select utilisateurs" ON public.utilisateurs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert utilisateurs" ON public.utilisateurs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update utilisateurs" ON public.utilisateurs
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete utilisateurs" ON public.utilisateurs
    FOR DELETE TO authenticated USING (true);

-- 11. Créer les politiques RLS pour la table catalogue
CREATE POLICY "Public can view catalogue" ON public.catalogue
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert catalogue" ON public.catalogue
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update catalogue" ON public.catalogue
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete catalogue" ON public.catalogue
    FOR DELETE TO authenticated USING (true);

-- 12. Créer les politiques RLS pour la table commandes
CREATE POLICY "Allow authenticated users to select commandes" ON public.commandes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert commandes" ON public.commandes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update commandes" ON public.commandes
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete commandes" ON public.commandes
    FOR DELETE TO authenticated USING (true);

-- 13. Créer les politiques RLS pour la table profiles
CREATE POLICY "Users can select their own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can select all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles p2 
            WHERE p2.id = auth.uid() AND p2.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p2 
            WHERE p2.id = auth.uid() AND p2.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p2 
            WHERE p2.id = auth.uid() AND p2.role = 'admin'
        )
    );

-- 14. Créer la fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'worker'
    );
    RETURN NEW;
END;
$$;

-- 15. Créer le trigger pour la création automatique des profils
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Instructions pour configurer le projet :
-- 1. Remplacer les valeurs dans src/integrations/supabase/client.ts :
--    - SUPABASE_URL : votre URL Supabase
--    - SUPABASE_PUBLISHABLE_KEY : votre clé publique Supabase
-- 2. Configurer l'authentification dans Supabase Dashboard
-- 3. Optionnel : Importer des données de démo dans les tables