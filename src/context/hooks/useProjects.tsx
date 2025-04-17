
import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useProjects = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) {
          console.error("Erreur lors du chargement des projets:", error);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les projets. Veuillez réessayer.",
          });
        } else if (projectsData) {
          const formattedProjects: Project[] = projectsData.map(project => ({
            id: project.id,
            code: project.code,
            name: project.name
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
        toast({
          variant: "destructive",
          title: "Erreur inattendue",
          description: "Une erreur s'est produite lors du chargement des projets.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
    // Supprimer les données locales car nous utilisons maintenant Supabase
    localStorage.removeItem('projects');
  }, []);

  const addProject = async (project: Project) => {
    try {
      // Si le projet a déjà un ID, vérifier s'il commence par "temp-"
      if (project.id && project.id.startsWith('temp-')) {
        // C'est un projet temporaire, donc nous devons l'insérer dans Supabase
        const { data, error } = await supabase
          .from('projects')
          .insert({
            code: project.code,
            name: project.name
          })
          .select()
          .single();
          
        if (error) {
          console.error("Erreur lors de l'ajout du projet:", error);
          toast({
            variant: "destructive",
            title: "Erreur d'ajout",
            description: `Impossible d'ajouter le projet: ${error.message}`,
          });
          return;
        }
        
        if (data) {
          // Mettre à jour l'ID avec celui généré par Supabase
          const newProject = { 
            ...project, 
            id: data.id 
          };
          setProjects(prev => [...prev, newProject]);
          return;
        }
      }
      
      // Sinon, ajouter simplement le projet à l'état local
      setProjects(prev => [...prev, project]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'ajout",
        description: "Une erreur s'est produite lors de l'ajout du projet.",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Supprimer d'abord de Supabase si c'est un ID réel (pas un ID temporaire)
      if (!projectId.startsWith('temp-')) {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
          
        if (error) {
          console.error("Erreur lors de la suppression du projet:", error);
          toast({
            variant: "destructive",
            title: "Erreur de suppression",
            description: `Impossible de supprimer le projet: ${error.message}`,
          });
          return;
        }
      }
      
      // Supprimer de l'état local
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: "Une erreur s'est produite lors de la suppression du projet.",
      });
    }
  };

  return {
    projects,
    addProject,
    deleteProject,
    isLoading
  };
};
