
import { useState } from 'react';
import { Order, CartItem, User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('datecommande', { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = data?.map(order => ({
        commandeid: order.commandeid,
        clientname: order.clientname,
        datecommande: order.datecommande,
        articles: Array.isArray(order.articles) ? order.articles as CartItem[] : [],
        termine: order.termine || 'Non',
        messagefournisseur: order.messagefournisseur,
        archived: false,
        status: order.termine === 'Oui' ? 'completed' : 'pending'
      })) || [];
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    }
  };

  const createOrder = async (
    user: User | null,
    cart: CartItem[],
    clearCart: () => void,
  ): Promise<boolean> => {
    try {
      if (!user || cart.length === 0) return false;

      const orderData = {
        clientname: user.name,
        datecommande: new Date().toISOString(),
        articles: cart,
        termine: 'Non'
      };

      const { error } = await supabase
        .from('commandes')
        .insert(orderData);

      if (error) throw error;

      clearCart();
      loadOrders(); // Reload orders after creation

      toast({
        title: "Commande créée",
        description: "Votre commande a été enregistrée avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, termine: string, messagefournisseur?: string) => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ 
          termine, 
          ...(messagefournisseur && { messagefournisseur })
        })
        .eq('commandeid', orderId);

      if (error) throw error;

      await loadOrders();
      
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été mis à jour",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  };

  // Add updateOrder function
  const updateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(order => 
      order.commandeid === updatedOrder.commandeid ? updatedOrder : order
    ));
  };

  // Add archiveOrder function
  const archiveOrder = async (orderId: string): Promise<boolean> => {
    try {
      // Find the order to archive
      const orderToArchive = orders.find(order => order.commandeid === orderId);
      if (!orderToArchive) return false;
      
      // Update the order in state
      const updatedOrder = { ...orderToArchive, archived: true };
      setOrders(orders.map(order => 
        order.commandeid === orderId ? updatedOrder : order
      ));
      
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

  return {
    orders,
    loadOrders,
    createOrder,
    updateOrderStatus,
    updateOrder,
    archiveOrder
  };
};
