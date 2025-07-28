import React, { useState } from 'react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectTableProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  isLoading: boolean;
}

type SortField = 'code' | 'name' | 'created_at';
type SortDirection = 'asc' | 'desc';

const ProjectTable = React.memo(({ projects, onEditProject, onDeleteProject, isLoading }: ProjectTableProps) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = a.created_at || '';
          bValue = b.created_at || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDirection]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement des affaires...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune affaire trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('code')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Code affaire
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </th>
            <th className="text-left p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Nom de l'affaire
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </th>
            <th className="text-left p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Date de création
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </th>
            <th className="text-right p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => (
            <tr key={project.id} className="border-b hover:bg-muted/50">
              <td className="p-3 font-mono text-sm">{project.code}</td>
              <td className="p-3">{project.name}</td>
              <td className="p-3 text-muted-foreground">{formatDate(project.created_at)}</td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProject(project)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer l'affaire "{project.name}" ({project.code}) ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteProject(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProjectTable.displayName = 'ProjectTable';

export default ProjectTable;