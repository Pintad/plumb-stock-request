
import { Order, User, CartItem } from '../types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const createOrder = (
  user: User | null, 
  cart: CartItem[], 
  orders: Order[], 
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  clearCart: () => void,
  projectCode?: string
): Order | undefined => {
  if (!user || cart.length === 0) return undefined;
  
  // Create an order compatible with our database structure
  const newOrder: Order = {
    commandeid: orders.length + 1,
    clientname: user.name,
    datecommande: new Date().toISOString().split('T')[0],
    produit: cart[0].name,  // For simplicity, just use the first item
    reference: cart[0].reference || '',
    quantite: cart[0].quantity,
    termine: 'Non',
    messagefournisseur: null,
    
    // Frontend application fields
    userId: user.id,
    userName: user.name,
    projectCode,
    archived: false,
    status: 'pending',
    items: [...cart]
  };
  
  setOrders([...orders, newOrder]);
  clearCart();
  
  // Try to save to Supabase if possible
  try {
    supabase
      .from('commandes')
      .insert({
        clientname: user.name,
        produit: cart[0].name,
        reference: cart[0].reference || '',
        quantite: cart[0].quantity,
        termine: 'Non'
      })
      .then(({ error }) => {
        if (error) {
          console.error("Erreur d'insertion dans la base de données:", error);
        }
      });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
  }
  
  toast({
    title: "Demande envoyée",
    description: "Votre demande a bien été transmise",
  });
  
  return newOrder;
};

export const updateOrder = (
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  updatedOrder: Order
) => {
  const newOrders = orders.map(order => 
    order.commandeid === updatedOrder.commandeid ? updatedOrder : order
  );
  
  setOrders(newOrders);
};

export const archiveOrder = async (
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  orderId: string
): Promise<boolean> => {
  try {
    // Find the order to archive
    const orderToArchive = orders.find(order => order.id === orderId);
    if (!orderToArchive) return false;
    
    // Update the order in state
    const updatedOrder = { ...orderToArchive, archived: true };
    const newOrders = orders.map(order => 
      order.id === orderId ? updatedOrder : order
    );
    
    // For now, we're storing archive status locally
    // as the commandes table doesn't have an archived column
    
    setOrders(newOrders);
    
    toast({
      title: "Demande archivée",
      description: "La demande a été déplacée dans les archives",
    });
    
    return true;
  } catch (error) {
    console.error("Error archiving order:", error);
    return false;
  }
};
