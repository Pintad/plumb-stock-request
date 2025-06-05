import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import ProjectSelector from '@/components/ProjectSelector';
import { DatePicker } from '@/components/DatePicker';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomItemForm from '@/components/cart/CustomItemForm';
import CustomItemsList from '@/components/cart/CustomItemsList';

const CartPage = () => {
  const { 
    cart, 
    customItems,
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart, 
    createOrder,
    selectedDeliveryDate,
    setSelectedDeliveryDate,
    loadProjects,
    projects,
    addCustomItem,
    removeCustomItem,
    updateCustomItemQuantity,
    totalItems
  } = useAppContext();
  const [selectedProject, setSelectedProject] = useState('none');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Forcer le chargement des projets quand on accède au panier
  useEffect(() => {
    console.log('CartPage: Déclenchement du chargement des projets');
    loadProjects(true); // Avec message d'erreur si échec
  }, [loadProjects]); // Se déclenche uniquement au montage du composant
  
  const handleCreateOrder = () => {
    if (cart.length === 0 && customItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Panier vide",
        description: "Votre panier est vide, impossible de créer une commande.",
      });
      return;
    }
    
    // Vérifier si une date de mise à disposition a été sélectionnée (optionnel)
    if (!selectedDeliveryDate) {
      // Optionnel: afficher une confirmation avant de créer sans date
      if (!window.confirm("Aucune date de mise à disposition n'a été sélectionnée. Voulez-vous continuer sans spécifier de date ?")) {
        return;
      }
    }
    
    // If selectedProject is "none", pass undefined instead
    createOrder(selectedProject === 'none' ? undefined : selectedProject);
    navigate('/my-orders');
  };
  
  const total = cart.reduce((sum, item) => sum + item.quantity, 0) + 
                customItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
        <h1 className="text-2xl font-bold mb-6">Mon panier</h1>
        
        {(cart.length > 0 || customItems.length > 0) ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* Formulaire pour ajouter des articles personnalisés */}
              <CustomItemForm onAddCustomItem={addCustomItem} />
              
              {/* Liste des articles personnalisés */}
              <CustomItemsList 
                customItems={customItems}
                onUpdateQuantity={updateCustomItemQuantity}
                onRemove={removeCustomItem}
              />
              
              {/* Articles du catalogue */}
              {cart.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Articles du catalogue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`${isMobile ? 'block' : 'hidden'}`}>
                      {/* Version mobile: afficher comme une liste de cartes */}
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <Card key={item.cartItemId || `${item.id}-${item.selectedVariantId || ''}`} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                {item.imageUrl && (
                                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain mr-3" />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-sm mb-1">{item.name}</div>
                                  <div className="text-xs text-gray-500 mb-1">{item.reference}</div>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border rounded-md">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-10 w-10 p-0 rounded-r-none"
                                        onClick={() => updateCartItemQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                        aria-label="Diminuer la quantité"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="font-medium w-10 text-center">
                                        {item.quantity}
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-10 w-10 p-0 rounded-l-none"
                                        onClick={() => updateCartItemQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                        aria-label="Augmenter la quantité"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFromCart(item.cartItemId || item.id)}
                                      className="text-red-500 h-10 w-10"
                                      aria-label="Supprimer l'article"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`${isMobile ? 'hidden' : 'block'} overflow-x-auto`}>
                      {/* Version desktop: afficher comme un tableau */}
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
                            <TableRow key={item.cartItemId || `${item.id}-${item.selectedVariantId || ''}`}>
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
                                    onClick={() => updateCartItemQuantity(item.cartItemId || item.id, item.quantity - 1)}
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
                                    onClick={() => updateCartItemQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.cartItemId || item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between items-center w-full">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className={isMobile ? "text-sm py-5" : ""}
                      >
                        Vider le panier
                      </Button>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 'articles' : 'article'} du catalogue
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProjectSelector 
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                  />
                  
                  <DatePicker 
                    date={selectedDeliveryDate}
                    onDateChange={setSelectedDeliveryDate}
                  />
                  
                  <div className="my-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold">{total} {total > 1 ? 'articles' : 'article'}</span>
                    </div>
                    {customItems.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        dont {customItems.length} article{customItems.length > 1 ? 's' : ''} personnalisé{customItems.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full bg-plumbing-blue hover:bg-blue-600 ${isMobile ? 'py-6' : ''}`}
                    onClick={handleCreateOrder}
                    disabled={cart.length === 0 && customItems.length === 0}
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
              className={`bg-plumbing-blue hover:bg-blue-600 ${isMobile ? 'py-6' : ''}`}
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
