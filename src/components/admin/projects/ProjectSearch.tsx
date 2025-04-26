
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ProjectSearch = ({ searchTerm, onSearchChange }: ProjectSearchProps) => {
  return (
    <div className="relative mt-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        placeholder="Rechercher une affaire..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default ProjectSearch;
