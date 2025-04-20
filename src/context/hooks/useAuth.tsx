
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', userId)
      .single();

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
      // Map database profile to our User type
      setProfile({
        id: data.id,
        username: data.email, // Assume username is email for now
        password: '', // Don't store password
        name: data.name || '',
        role: data.role === 'admin' ? 'admin' : 'worker',
      });
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
      return false;
    }

    // fetchProfile will be triggered by onAuthStateChange
    setLoading(false);
    return true;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription',
        description: error.message,
      });
      setLoading(false);
      return false;
    }
    if (data?.user) {
      // Insert profile row with default role worker
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          role: 'worker',
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
      // Optionally fetch profile
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
        description: 'Impossible de se déconnecter pour le moment.',
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
