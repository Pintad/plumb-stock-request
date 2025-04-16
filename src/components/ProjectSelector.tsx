
import React from 'react';
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
  const { projects } = useAppContext();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Affaire</label>
      <Select 
        value={selectedProject} 
        onValueChange={onSelectProject}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner une affaire" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune affaire</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.code}>
              {project.code} - {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        L'affaire sera associée à votre demande de stock
      </p>
    </div>
  );
};

export default ProjectSelector;
