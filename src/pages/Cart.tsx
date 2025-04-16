
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Trash, ArrowLeft, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, createOrder } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItemQuantity(productId, currentQuantity - 1);
    }
  };
  
  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateCartItemQuantity(productId, currentQuantity + 1);
  };
  
  const handleSubmit = () => {
    createOrder();
    toast({
      title: "Demande envoyée",
      description: "Votre demande a bien été transmise",
    });
    navigate('/my-orders');
  };
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        
        <main className="flex-1 container px-4 py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-500"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au catalogue
            </Button>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-lg font-medium mb-2">Votre panier est vide</p>
                <p className="text-gray-500 mb-6">Ajoutez des produits depuis le catalogue</p>
                <Button 
                  className="bg-plumbing-blue hover:bg-blue-600"
                  onClick={() => navigate('/')}
                >
                  Parcourir le catalogue
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-500"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au catalogue
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Votre panier</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Produit</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.reference}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDecrement(item.id, item.quantity)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleIncrement(item.id, item.quantity)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-4">
                <Button variant="ghost" onClick={clearCart}>
                  Vider le panier
                </Button>
                <div className="text-sm text-gray-500">
                  {cart.length} références · {totalItems} articles
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt>Nombre de références</dt>
                    <dd>{cart.length}</dd>
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt>Total articles</dt>
                    <dd>{totalItems}</dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-plumbing-blue hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider la demande
                </Button>
              </CardFooter>
            </Card>
            
            <Alert className="mt-6">
              <AlertDescription>
                Cette demande sera transmise au responsable du stock pour préparation.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
