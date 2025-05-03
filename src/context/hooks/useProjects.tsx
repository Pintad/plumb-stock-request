
import { useState, useEffect, useCallback, useRef } from 'react';
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useProjects = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadAttemptCount = useRef(0);
  const lastLoadTime = useRef<number | null>(null);
  const MIN_RETRY_INTERVAL = 10000; // 10 secondes minimum entre les tentatives

  // Function to load projects from Supabase - wrapped in useCallback to avoid recreation
  const loadProjects = useCallback(async (showToastOnError: boolean = true) => {
    // Éviter les rechargements trop fréquents
    const now = Date.now();
    if (lastLoadTime.current && now - lastLoadTime.current < MIN_RETRY_INTERVAL) {
      return; // Éviter les appels trop rapprochés
    }
    
    lastLoadTime.current = now;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('affaires')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const projectsFromDB: Project[] = data.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
        }));
        setProjects(projectsFromDB);
        setError(null);
        loadAttemptCount.current = 0; // Réinitialiser le compteur sur succès
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets depuis Supabase:", error);
      setError("Impossible de charger les affaires depuis la base de données.");
      
      // Ne pas afficher le toast pour chaque erreur
      if (showToastOnError && loadAttemptCount.current < 2) { // Limiter les toasts d'erreur
        loadAttemptCount.current++;
        toast({
          title: "Erreur",
          description: "Impossible de charger les affaires depuis la base de données.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load projects only once on component mount
  useEffect(() => {
    loadProjects(false); // Ne pas afficher de toast au chargement initial
    
    // Créer un intervalle pour vérifier la connectivité si nécessaire
    const reconnectInterval = setInterval(() => {
      if (error) {
        loadProjects(false); // Tenter de se reconnecter discrètement
      }
    }, 30000); // Tenter de se reconnecter toutes les 30 secondes
    
    return () => {
      clearInterval(reconnectInterval);
    };
  }, [loadProjects, error]);

  const addProject = useCallback(async (project: Project) => {
    try {
      // Insert project into Supabase if it does not exist
      const { data, error } = await supabase
        .from('affaires')
        .upsert({ id: project.id, code: project.code, name: project.name }, { onConflict: 'code' })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Use returned project id if different (e.g. new insert)
        const returnedProject = data[0];
        const newProject = {
          id: returnedProject.id,
          code: returnedProject.code,
          name: returnedProject.name,
        };

        setProjects(prev => {
          // Avoid duplicates by code or id
          const exists = prev.some((p) => p.id === newProject.id || p.code === newProject.code);
          if (exists) {
            return prev.map((p) => (p.id === newProject.id || p.code === newProject.code ? newProject : p));
          }
          return [...prev, newProject];
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une affaire:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'affaire dans la base de données.",
        variant: "destructive",
      });
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('affaires')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Erreur lors de la suppression d'une affaire:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'affaire de la base de données.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    projects,
    addProject,
    deleteProject,
    loadProjects,
    isLoading,
    error,
  };
};
