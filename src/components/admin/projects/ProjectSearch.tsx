
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ProjectSearch = React.memo(({ searchTerm, onSearchChange }: ProjectSearchProps) => {
  // Debounce search input to prevent too many renders
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  return (
    <div className="relative mt-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        placeholder="Rechercher une affaire..."
        className="pl-10"
        value={searchTerm}
        onChange={handleChange}
      />
    </div>
  );
});

// Add display name for debugging
ProjectSearch.displayName = 'ProjectSearch';

export default ProjectSearch;
