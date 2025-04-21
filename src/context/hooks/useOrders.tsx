
import { useState } from 'react';
import { Order, CartItem, User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchOrders, 
  createOrderInDb, 
  updateOrderStatusInDb, 
  archiveOrderInDb, 
  archiveCompletedOrdersInDb 
} from './orders/orderOperations';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load orders from the database
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const loadedOrders = await fetchOrders();
      setOrders(loadedOrders);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (
    user: User | null,
    cart: CartItem[],
    clearCart: () => void,
    affaireId?: string
  ): Promise<boolean> => {
    try {
      const success = await createOrderInDb(user, cart, affaireId);
      
      if (success) {
        clearCart();
        await loadOrders();
        
        toast({
          title: "Commande créée",
          description: "Votre commande a été enregistrée avec succès",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, termine: string, messagefournisseur?: string) => {
    try {
      await updateOrderStatusInDb(orderId, termine, messagefournisseur);
      await loadOrders();
      
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  };

  // Archive a single order
  const archiveOrder = async (orderId: string): Promise<boolean> => {
    try {
      await archiveOrderInDb(orderId);
      await loadOrders();
      
      toast({
        title: "Demande archivée",
        description: "La demande a été archivée avec succès",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la demande",
        variant: "destructive",
      });
      return false;
    }
  };

  // Archive all completed orders
  const archiveCompletedOrders = async (): Promise<boolean> => {
    try {
      await archiveCompletedOrdersInDb();
      await loadOrders();
      
      toast({
        title: "Demandes archivées",
        description: "Toutes les demandes terminées ont été archivées",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver les demandes terminées",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    orders,
    isLoading,
    loadOrders,
    createOrder,
    updateOrderStatus,
    updateOrder: (updatedOrder: Order) => {
      setOrders(orders.map(order => 
        order.commandeid === updatedOrder.commandeid ? updatedOrder : order
      ));
    },
    archiveOrder,
    archiveCompletedOrders
  };
};
