
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types';
import ProjectCSVImport from '@/components/admin/ProjectCSVImport';
import ProjectTable from '@/components/admin/projects/ProjectTable';
import ProjectSearch from '@/components/admin/projects/ProjectSearch';
import AddProjectForm from '@/components/admin/projects/AddProjectForm';
import ProjectEditDialog from '@/components/admin/projects/ProjectEditDialog';

const AdminProjects = () => {
  // Context and state
  const { projects, deleteProject, addProject, updateProject, loadProjects, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ code: '', name: '' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Memoize filtered projects to prevent unnecessary re-renders
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    return projects.filter(project => 
      project.name.toLowerCase().includes(lowerCaseSearch) || 
      project.code.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, projects]);

  // Handlers - wrapped in useCallback to prevent unnecessary re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAddProject = useCallback(async () => {
    if (!newProject.code || !newProject.name) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le code et le nom de l'affaire sont requis",
      });
      return;
    }

    const projectToAdd: Project = {
      id: `temp-${Date.now()}`,
      code: newProject.code,
      name: newProject.name,
    };

    await addProject(projectToAdd);
    setNewProject({ code: '', name: '' });
    setShowAddForm(false);
    toast({
      title: "Affaire ajoutée",
      description: "L'affaire a été ajoutée avec succès",
    });
  }, [newProject, addProject]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProject(projectId);
    toast({
      title: "Affaire supprimée",
      description: "L'affaire a été supprimée avec succès",
    });
  }, [deleteProject]);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
  }, []);

  const handleUpdateProject = useCallback(async (project: Project) => {
    await updateProject(project);
    setEditingProject(null);
  }, [updateProject]);

  const handleProjectChange = useCallback((project: { code: string; name: string }) => {
    setNewProject(project);
  }, []);

  const handleToggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
    if (showAddForm) {
      setNewProject({ code: '', name: '' });
    }
  }, [showAddForm]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des affaires</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Liste des affaires</CardTitle>
                  <Button 
                    onClick={handleToggleAddForm}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2" size={18} />
                    {showAddForm ? 'Annuler' : 'Ajouter une affaire'}
                  </Button>
                </div>
                <ProjectSearch 
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {showAddForm && (
                  <AddProjectForm
                    newProject={newProject}
                    onProjectChange={handleProjectChange}
                    onSubmit={handleAddProject}
                    onCancel={handleToggleAddForm}
                  />
                )}
                <ProjectTable 
                  projects={filteredProjects}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <ProjectCSVImport />
          </div>
        </div>

        <ProjectEditDialog
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleUpdateProject}
        />
      </main>
    </div>
  );
};

export default AdminProjects;
