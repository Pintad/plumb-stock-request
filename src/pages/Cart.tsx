
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import ProjectSelector from '@/components/ProjectSelector';

const CartPage = () => {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, createOrder } = useAppContext();
  const [selectedProject, setSelectedProject] = useState('');
  const navigate = useNavigate();
  
  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Panier vide",
        description: "Votre panier est vide, impossible de créer une commande.",
      });
      return;
    }
    
    createOrder(selectedProject);
    navigate('/my-orders');
  };
  
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Mon panier</h1>
        
        {cart.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain mr-4" />
                              )}
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.unit}</div>
                                {item.category && (
                                  <div className="text-xs text-gray-500">Catégorie: {item.category}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.reference}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-10 text-center">
                                {item.quantity}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <Button 
                      variant="outline" 
                      onClick={clearCart}
                    >
                      Vider le panier
                    </Button>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {total} {total > 1 ? 'articles' : 'article'}
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectSelector 
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                  />
                  
                  <div className="my-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold">{total} {total > 1 ? 'articles' : 'article'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-plumbing-blue hover:bg-blue-600"
                    onClick={handleCreateOrder}
                    disabled={cart.length === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Valider ma demande
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">
              Vous n'avez aucun produit dans votre panier
            </p>
            <Button 
              className="bg-plumbing-blue hover:bg-blue-600"
              onClick={() => navigate('/')}
            >
              Parcourir les produits
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
