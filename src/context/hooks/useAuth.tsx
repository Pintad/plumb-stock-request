
import { useState, useEffect } from 'react';
import { User } from '../../types';
import { demoUsers } from '@/data/demoData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier le statut d'authentification au chargement
  useEffect(() => {
    // Vérifier si la session existe déjà
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setUser(null);
          return;
        }
        
        if (session?.user) {
          // Récupérer les informations de profil de l'utilisateur
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            return;
          }
          
          // Créer l'objet utilisateur à partir des données Supabase
          if (profile) {
            // Utiliser une assertion de type pour s'assurer que TypeScript accepte l'objet
            setUser({
              id: session.user.id,
              username: session.user.email || '',
              name: profile.name,
              role: profile.role as 'admin' | 'worker'
            } as User);
          }
        } else {
          // Essayer de récupérer depuis localStorage pour compatibilité
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Erreur inattendue lors de la vérification de la session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Récupérer les informations de profil de l'utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            // Utiliser une assertion de type pour s'assurer que TypeScript accepte l'objet
            setUser({
              id: session.user.id,
              username: session.user.email || '',
              name: profile.name,
              role: profile.role as 'admin' | 'worker'
            } as User);
          }
        } else {
          setUser(null);
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Garder la compatibilité avec le localStorage pour faciliter la transition
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Fonction de login modifiée pour utiliser Supabase
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Dans un premier temps, essayer l'authentification Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });
      
      if (error) {
        console.log("Erreur d'authentification Supabase, tentative avec les utilisateurs de démo:", error);
        
        // En cas d'erreur, essayer avec les utilisateurs de démo pour la compatibilité
        const foundUser = demoUsers.find(
          (u) => u.username === username && u.password === password
        );
        
        if (foundUser) {
          setUser(foundUser);
          return true;
        }
        
        return false;
      }
      
      if (data.user) {
        // L'utilisateur est authentifié via Supabase
        // Le reste sera géré par l'écouteur onAuthStateChange
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la tentative de connexion.",
      });
      return false;
    }
  };

  // Fonction de déconnexion modifiée pour utiliser Supabase
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  const isAdmin = user?.role === 'admin';

  return {
    user,
    login,
    logout,
    isAdmin,
    loading
  };
};
