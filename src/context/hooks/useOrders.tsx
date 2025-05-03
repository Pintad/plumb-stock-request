
import { useState, useEffect, useRef } from 'react';
import { Order, CartItem, User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchOrders, 
  createOrderInDb, 
  updateOrderStatusInDb, 
  updateOrderInDb 
} from './orders';
import { supabase } from '@/integrations/supabase/client';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

  // Écouter les modifications en temps réel sur la table commandes avec une référence stable
  useEffect(() => {
    // S'assurer qu'on ne crée qu'une seule souscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    // Créer une nouvelle souscription
    channelRef.current = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (insert, update, delete)
          schema: 'public',
          table: 'commandes'
        },
        () => {
          // Recharger les commandes quand des changements sont détectés
          loadOrders();
        }
      )
      .subscribe();

    // Nettoyage lors du démontage
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

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
    affaireId?: string,
    dateMiseADisposition?: Date | null
  ): Promise<boolean> => {
    try {
      const success = await createOrderInDb(user, cart, affaireId, dateMiseADisposition);
      
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

  return {
    orders,
    isLoading,
    loadOrders,
    createOrder,
    updateOrderStatus,
    updateOrder
  };
};
