
import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';

export const useProjects = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Store projects locally for now since there's no projects table in Supabase yet
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
      }
    };

    loadProjects();
  }, []);

  const addProject = (project: Project) => {
    setProjects(prev => {
      const updated = [...prev, project];
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
  };

  return {
    projects,
    addProject,
    deleteProject
  };
};
