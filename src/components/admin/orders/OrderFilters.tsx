
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Project } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderFiltersProps {
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  projects: Project[];
  uniqueUsers: string[];
  activeStatusFilter?: string | null;
  setActiveStatusFilter?: (status: string | null) => void;
}

const OrderFilters = ({
  selectedProject,
  setSelectedProject,
  selectedUser,
  setSelectedUser,
  searchTerm,
  setSearchTerm,
  projects,
  uniqueUsers,
  activeStatusFilter,
  setActiveStatusFilter
}: OrderFiltersProps) => {
  const handleStatusChange = (value: string) => {
    if (setActiveStatusFilter) {
      setActiveStatusFilter(value === "all" ? null : value);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Status Filter Tabs */}
      {setActiveStatusFilter && (
        <Tabs 
          defaultValue={activeStatusFilter || "all"} 
          className="w-full" 
          onValueChange={handleStatusChange}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="inProgress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher une commande..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Project Filter */}
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par projet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            <SelectItem value="none">Sans projet</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.code}>
                {project.name} ({project.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* User Filter */}
        <Select
          value={selectedUser}
          onValueChange={setSelectedUser}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par demandeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les demandeurs</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default OrderFilters;
