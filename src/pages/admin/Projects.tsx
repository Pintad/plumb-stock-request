
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminProjects = () => {
  const { projects, deleteProject, addProject, loadProjects, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ code: '', name: '' });
  
  // Load projects when component mounts
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = async () => {
    if (!newProject.code || !newProject.name) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le code et le nom de l'affaire sont requis",
      });
      return;
    }

    // Insert into Supabase first without invalid 'returning' option
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
    let insertedProject: Project | undefined = undefined;
    if (data && data.length > 0) {
      const returned = data[0];
      insertedProject = {
        id: returned.id,
        code: returned.code,
        name: returned.name,
      };
    } else {
      insertedProject = {
        id: `project-temp-${Date.now()}`,
        code: newProject.code,
        name: newProject.name,
      };
    }

    // Add to local context
    addProject(insertedProject);

    setNewProject({ code: '', name: '' });
    setShowAddForm(false);
    toast({
      title: "Affaire ajoutée",
      description: "L'affaire a été ajoutée avec succès",
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    // Delete from Supabase
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

    // Delete from local context
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
          <div className="md:col-span-3">
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
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher une affaire..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle affaire</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Code</label>
                        <Input 
                          value={newProject.code} 
                          onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                          placeholder="Code de l'affaire"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nom</label>
                        <Input 
                          value={newProject.name} 
                          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                          placeholder="Nom de l'affaire"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddProject}>
                        Ajouter
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-mono">{project.code}</TableCell>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteProject(project.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-6">
                              {searchTerm 
                                ? "Aucune affaire ne correspond à votre recherche" 
                                : "Aucune affaire dans la liste"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {filteredProjects.length} affaires
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;
