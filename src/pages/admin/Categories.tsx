
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AdminCategories = () => {
  const { categories, addCategory, deleteCategory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const filteredCategories = categories.filter(category => 
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom de la catégorie est requis",
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Cette catégorie existe déjà",
      });
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory('');
    toast({
      title: "Catégorie ajoutée",
      description: "La catégorie a été ajoutée avec succès",
    });
  };

  const handleDeleteCategory = (category: string) => {
    deleteCategory(category);
    toast({
      title: "Catégorie supprimée",
      description: "La catégorie a été supprimée avec succès",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des catégories</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Catégories de produits</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Rechercher une catégorie..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)} 
                  placeholder="Nouvelle catégorie" 
                />
                <Button 
                  onClick={handleAddCategory}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2" size={18} />
                  Ajouter
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCategory(category)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6">
                          {searchTerm 
                            ? "Aucune catégorie ne correspond à votre recherche" 
                            : "Aucune catégorie dans la liste"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {filteredCategories.length} catégories
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminCategories;
