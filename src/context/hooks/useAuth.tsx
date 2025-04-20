
import { useState, useEffect } from 'react';
import { User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(true);
      if (session?.user) {
        // Defer fetchProfile to avoid async in callback
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(true);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('utilisateurs')
      .select('id, email, nom, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger le profil utilisateur.',
      });
      setProfile(null);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile({
        id: data.id,
        username: data.email ?? '',
        password: '', // Ne pas stocker le mot de passe côté frontend
        name: data.nom ?? '',
        role: data.role === 'magasinier' ? 'admin' : 'worker', // mapping roles table -> frontend
      });
    } else {
      setProfile(null);
    }

    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: "Erreur d'authentification",
        description: error?.message ?? 'Échec de la connexion.',
      });
      return false;
    }

    // fetchProfile sera déclenché par l'écouteur onAuthStateChange
    setLoading(false);
    return true;
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    setLoading(true);
    // Inscription via supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: "Erreur d'inscription",
        description: error.message,
      });
      setLoading(false);
      return false;
    }

    if (data?.user) {
      // Création de la fiche utilisateur dans la table utilisateurs
      const { error: profileError } = await supabase
        .from('utilisateurs')
        .insert({
          id: data.user.id,
          email,
          nom: name,
          role: 'ouvrier', // rôle par défaut à la création
        });

      if (profileError) {
        toast({
          variant: 'destructive',
          title: 'Erreur de création du profil',
          description: profileError.message,
        });
        setLoading(false);
        return false;
      }

      await fetchProfile(data.user.id);

      toast({
        title: 'Inscription réussie',
        description: 'Vous pouvez désormais vous connecter.',
      });
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de se déconnecter pour le moment.",
      });
    }
    setProfile(null);
    setLoading(false);
  };

  const isAdmin = profile?.role === 'admin';

  return {
    user: profile,
    login,
    logout,
    signup,
    isAdmin,
    loading,
  };
};
