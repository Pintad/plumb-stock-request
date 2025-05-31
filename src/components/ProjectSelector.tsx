
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectSelectorProps {
  selectedProject: string;
  onSelectProject: (projectCode: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ selectedProject, onSelectProject }) => {
  const { projects, isLoading, loadProjects } = useAppContext();
  
  // Tentative de rechargement si aucun projet n'est disponible
  useEffect(() => {
    if (projects.length === 0 && !isLoading) {
      console.log('ProjectSelector: Aucun projet disponible, tentative de rechargement');
      loadProjects(false); // Chargement discret sans message d'erreur
    }
  }, [projects.length, isLoading, loadProjects]);
  
  // Conserver la valeur actuelle même si les projets ne sont pas chargés
  const keepSelectedValue = !projects.length && selectedProject !== 'none';

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Affaire</label>
      <Select 
        value={selectedProject} 
        onValueChange={onSelectProject}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Chargement des affaires..." : "Sélectionner une affaire"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune affaire</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.code}>
              {project.code} - {project.name}
            </SelectItem>
          ))}
          {keepSelectedValue && (
            <SelectItem value={selectedProject}>
              {selectedProject} - Chargement...
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        L'affaire sera associée à votre demande de stock
        {isLoading && (
          <span className="ml-2 text-blue-600">• Chargement en cours...</span>
        )}
      </p>
    </div>
  );
};

export default ProjectSelector;
