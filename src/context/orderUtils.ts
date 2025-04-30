
// Note: This file is being kept for historical purposes,
// but all functionality has been moved to src/context/hooks/orders/orderOperations.ts
// If you need to update order-related functionality, please work with that file instead.

import { Order, User, CartItem } from '../types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Legacy function, kept for reference but not actively used
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
    commandeid: `${orders.length + 1}`, // Convert to string as per updated type
    clientname: user.name,
    datecommande: new Date().toISOString().split('T')[0],
    articles: [...cart],  // Store the complete cart
    termine: 'Non',
    messagefournisseur: null,
    
    // Frontend application fields
    projectCode,
    archived: false,
    status: 'pending',
    
    // New required fields
    titre_affichage: `${user.name} - D${String(orders.length + 1).padStart(5, '0')}`,
    displayTitle: `${user.name} - D${String(orders.length + 1).padStart(5, '0')}`
  };
  
  setOrders([...orders, newOrder]);
  clearCart();
  
  // Try to save to Supabase if possible
  try {
    supabase
      .from('commandes')
      .insert({
        clientname: user.name,
        datecommande: new Date().toISOString(),
        articles: cart as unknown as Json,
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

// Legacy functions, kept for reference but not actively used
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
    const orderToArchive = orders.find(order => order.commandeid === orderId);
    if (!orderToArchive) return false;
    
    // Update the order in state
    const updatedOrder = { ...orderToArchive, archived: true };
    const newOrders = orders.map(order => 
      order.commandeid === orderId ? updatedOrder : order
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

