
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import CSVImport from '@/components/CSVImport';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = async (formData: any) => {
    const newProduct: Product = {
      id: `temp-${Date.now()}`, // ID temporaire, sera remplacé par l'ID de Supabase
      name: formData.name,
      reference: formData.reference,
      unit: formData.unit,
      category: formData.category === 'none' ? undefined : formData.category,
      imageUrl: formData.imageUrl || undefined,
      variants: formData.variants
    };

    const success = await addProduct(newProduct);
    
    if (success) {
      setShowAddForm(false);
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit",
      });
    }
  };

  const handleEditProduct = async (formData: any) => {
    if (!editingProduct) return;

    const updatedProduct = {
      ...editingProduct,
      name: formData.name,
      reference: formData.reference,
      unit: formData.unit,
      category: formData.category === 'none' ? undefined : formData.category,
      imageUrl: formData.imageUrl || undefined,
      variants: formData.variants
    };

    const success = await updateProduct(updatedProduct);
    
    if (success) {
      setEditingProduct(null);
      toast({
        title: "Produit modifié",
        description: "Le produit a été modifié avec succès",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du produit",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId);
    
    if (success) {
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Gestion du catalogue</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Catalogue de produits</CardTitle>
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!!editingProduct}
                  >
                    <Plus className="mr-2" size={18} />
                    Ajouter un produit
                  </Button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Rechercher un produit..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && !editingProduct && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Ajouter un nouveau produit</h3>
                    <ProductForm 
                      onSubmit={handleAddProduct} 
                      onCancel={() => setShowAddForm(false)}
                    />
                  </div>
                )}
                
                {editingProduct && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Modifier le produit</h3>
                    <ProductForm 
                      initialData={editingProduct} 
                      onSubmit={handleEditProduct}
                      onCancel={() => setEditingProduct(null)}
                    />
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Désignation</TableHead>
                        <TableHead>Conditionnement</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            Chargement des produits...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling;
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={product.imageUrl ? "hidden" : "w-12 h-12 bg-gray-100 rounded flex items-center justify-center"}>
                                <ImageIcon className="text-gray-400" size={24} />
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">{product.reference}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProduct(product)}
                                  disabled={!!editingProduct}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            {searchTerm 
                              ? "Aucun produit ne correspond à votre recherche" 
                              : "Aucun produit dans le catalogue"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {filteredProducts.length} produits sur {products.length}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <CSVImport />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;
