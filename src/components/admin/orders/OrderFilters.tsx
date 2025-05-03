
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Project } from '@/types';

interface OrderFiltersProps {
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  projects: Project[];
  uniqueUsers: string[];
}

const OrderFilters = ({
  selectedProject,
  setSelectedProject,
  selectedUser,
  setSelectedUser,
  searchTerm,
  setSearchTerm,
  projects,
  uniqueUsers
}: OrderFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filtrer par affaire</label>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les affaires" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les affaires</SelectItem>
                <SelectItem value="none">Sans affaire</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.code}>
                    {project.code} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* User filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filtrer par utilisateur</label>
            <Select 
              value={selectedUser} 
              onValueChange={setSelectedUser}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les utilisateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {uniqueUsers.map((user, index) => (
                  <SelectItem key={index} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Rechercher</label>
            <Input 
              type="text" 
              placeholder="Rechercher une commande..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
