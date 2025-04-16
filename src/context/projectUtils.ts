
import { Project } from '../types';

export const addProject = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  project: Project
) => {
  setProjects([...projects, project]);
};

export const deleteProject = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  projectId: string
) => {
  setProjects(projects.filter(project => project.id !== projectId));
};
