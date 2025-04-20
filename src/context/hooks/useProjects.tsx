
import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useProjects = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    const loadProjects = async () => {
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
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des projets depuis Supabase:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les affaires depuis la base de données.",
          variant: "destructive",
        });
      }
    };

    loadProjects();
  }, []);

  const addProject = async (project: Project) => {
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
  };

  const deleteProject = async (projectId: string) => {
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
  };

  return {
    projects,
    addProject,
    deleteProject,
  };
};
