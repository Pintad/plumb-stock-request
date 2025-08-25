
import { useState, useEffect } from 'react';
import { User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // D'abord, mettre en place l'écouteur d'événements d'authentification
    // AVANT de vérifier la session existante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Mettre à jour l'état de la session de manière synchrone
      setSession(currentSession);
      
      if (currentSession?.user?.email) {
        // Utiliser setTimeout pour éviter des appels imbriqués à l'API Supabase
        // qui peuvent causer des blocages
        setTimeout(() => fetchProfile(currentSession.user.email!), 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // ENSUITE vérifier s'il existe une session active
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user?.email) {
        fetchProfile(currentSession.user.email);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userEmail: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('utilisateurs')
      .select('id, email, nom, role')
      .eq('email', userEmail)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Impossible de charger le profil utilisateur.');
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
        role: data.role === 'magasinier' ? 'admin' : data.role === 'administrateur' ? 'superadmin' : 'worker', // mapping roles table -> frontend
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
      toast.error(error?.message ?? 'Échec de la connexion.');
      return false;
    }

    // fetchProfile sera déclenché par l'écouteur onAuthStateChange
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
      toast.error(error.message);
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
        toast.error(profileError.message);
        setLoading(false);
        return false;
      }

      toast.success('Inscription réussie. Vous pouvez désormais vous connecter.');
      
      // fetchProfile sera déclenché par l'écouteur onAuthStateChange
      return true;
    }

    setLoading(false);
    return false;
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Impossible de se déconnecter pour le moment.");
    }
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  const isAdmin = profile?.role === 'admin';
  const isSuperAdmin = profile?.role === 'superadmin';

  return {
    user: profile,
    session,
    login,
    logout,
    signup,
    isAdmin,
    isSuperAdmin,
    loading,
  };
};
