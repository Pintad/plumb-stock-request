
import { useState, useEffect, useRef } from 'react';
import { Order, CartItem, User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchOrders, 
  createOrderInDb, 
  updateOrderStatusInDb, 
  updateOrderInDb,
  deleteOrderInDb 
} from './orders';
import { supabase } from '@/integrations/supabase/client';
import { useUserActivity } from '@/hooks/useUserActivity';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const loadingRef = useRef(false);
  
  // Détection d'inactivité (5 minutes)
  const { isActive } = useUserActivity({ timeout: 5 * 60 * 1000 });

  // Charge automatiquement les commandes au montage du hook
  useEffect(() => {
    loadOrders();
    
    return () => {
      // Nettoyage de la souscription lors du démontage
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Gestion de l'écoute temps réel basée sur l'activité de l'utilisateur
  useEffect(() => {
    if (isActive) {
      // Utilisateur actif - activer les souscriptions temps réel
      setupRealtimeSubscription();
    } else {
      // Utilisateur inactif - désactiver les souscriptions
      if (channelRef.current) {
        console.log('User inactive - pausing real-time subscriptions');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isActive]);

  const setupRealtimeSubscription = () => {
    // Réplication désactivée - pas de souscription temps réel
    console.log('Real-time subscription disabled - manual refresh required');
  };

  // Load orders from the database avec protection contre les appels multiples
  const loadOrders = async () => {
    if (loadingRef.current) {
      console.log('Load already in progress, skipping...');
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const loadedOrders = await fetchOrders();
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  // Create a new order
  const createOrder = async (
    user: User | null,
    cart: CartItem[],
    customItems: any[] = [],
    clearCart: () => void,
    affaireId?: string,
    dateMiseADisposition?: Date | null
  ): Promise<boolean> => {
    try {
      const success = await createOrderInDb(user, cart, customItems, affaireId, dateMiseADisposition);
      
      if (success) {
        clearCart();
        // Recharger seulement si l'utilisateur est actif
        if (isActive) {
          await loadOrders();
        }
        
        toast({
          title: "Commande créée",
          description: "Votre commande a été enregistrée avec succès",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error creating order:', error);
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
      
      // Recharger seulement si l'utilisateur est actif
      if (isActive) {
        await loadOrders();
      }
      
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été mis à jour",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  };

  // Update an entire order (including articles with completed status)
  const updateOrder = async (updatedOrder: Order) => {
    try {
      // Update the order locally
      setOrders(orders.map(order => 
        order.commandeid === updatedOrder.commandeid ? updatedOrder : order
      ));
      
      // Update the order in the database
      await updateOrderInDb(updatedOrder);
      
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  };

  // Delete an order
  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      await deleteOrderInDb(orderId);
      
      // Remove the order from local state
      setOrders(orders.filter(order => order.commandeid !== orderId));
      
      toast({
        title: "Commande supprimée",
        description: "La commande a été supprimée avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande",
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
    updateOrder,
    deleteOrder,
    isUserActive: isActive
  };
};
