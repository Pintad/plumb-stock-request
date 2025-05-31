
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
  const MIN_RETRY_INTERVAL = 5000; // Réduit à 5 secondes pour être plus réactif

  // Function to load projects from Supabase - wrapped in useCallback to avoid recreation
  const loadProjects = useCallback(async (showToastOnError: boolean = true) => {
    // Éviter les rechargements trop fréquents
    const now = Date.now();
    if (lastLoadTime.current && now - lastLoadTime.current < MIN_RETRY_INTERVAL) {
      console.log('useProjects: Rechargement trop rapide, ignoré');
      return; // Éviter les appels trop rapprochés
    }
    
    lastLoadTime.current = now;
    setIsLoading(true);
    console.log('useProjects: Début du chargement des projets');
    
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
        console.log(`useProjects: ${projectsFromDB.length} projets chargés avec succès`);
      } else {
        setProjects([]);
        console.log('useProjects: Aucun projet trouvé');
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets depuis Supabase:", error);
      setError("Impossible de charger les affaires depuis la base de données.");
      
      // Afficher le toast seulement si demandé et pas trop d'erreurs consécutives
      if (showToastOnError && loadAttemptCount.current < 3) { 
        loadAttemptCount.current++;
        toast({
          title: "Erreur",
          description: "Impossible de charger les affaires. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load projects only once on component mount
  useEffect(() => {
    console.log('useProjects: Initialisation du hook');
    loadProjects(false); // Ne pas afficher de toast au chargement initial
  }, [loadProjects]);

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
