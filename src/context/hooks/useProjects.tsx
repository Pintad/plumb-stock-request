
import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';

export const useProjects = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
        
        if (projectsError) {
          console.error("Erreur lors du chargement des projets:", projectsError);
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
      }
    };

    loadProjects();
    localStorage.removeItem('projects');
  }, []);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  return {
    projects,
    addProject,
    deleteProject
  };
};
