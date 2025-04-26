
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProjectCSVImport from '@/components/admin/ProjectCSVImport';
import ProjectList from '@/components/admin/projects/ProjectList';
import ProjectSearch from '@/components/admin/projects/ProjectSearch';
import AddProjectForm from '@/components/admin/projects/AddProjectForm';

const AdminProjects = () => {
  const { projects, deleteProject, addProject, loadProjects, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ code: '', name: '' });
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const handleAddProject = async () => {
    if (!newProject.code || !newProject.name) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le code et le nom de l'affaire sont requis",
      });
      return;
    }

    const { data, error } = await supabase
      .from('affaires')
      .upsert(
        { code: newProject.code, name: newProject.name },
        { onConflict: 'code' }
      )
      .select();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'ajout",
        description: `Impossible d'ajouter l'affaire: ${error.message}`,
      });
      return;
    }

    let insertedProject = data?.[0] 
      ? {
          id: data[0].id,
          code: data[0].code,
          name: data[0].name,
        }
      : {
          id: `project-temp-${Date.now()}`,
          code: newProject.code,
          name: newProject.name,
        };

    addProject(insertedProject);
    setNewProject({ code: '', name: '' });
    setShowAddForm(false);
    toast({
      title: "Affaire ajoutée",
      description: "L'affaire a été ajoutée avec succès",
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('affaires')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: `Impossible de supprimer l'affaire: ${error.message}`,
      });
      return;
    }

    deleteProject(projectId);
    toast({
      title: "Affaire supprimée",
      description: "L'affaire a été supprimée avec succès",
    });
  };

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
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2" size={18} />
                    Ajouter une affaire
                  </Button>
                </div>
                <ProjectSearch 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <AddProjectForm
                    newProject={newProject}
                    onProjectChange={setNewProject}
                    onSubmit={handleAddProject}
                    onCancel={() => setShowAddForm(false)}
                  />
                )}
                <ProjectList 
                  projects={filteredProjects}
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
      </main>
    </div>
  );
};

export default AdminProjects;
