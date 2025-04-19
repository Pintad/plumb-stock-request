
import { useState, useEffect } from 'react';
import { Order, CartItem, User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les commandes au montage et à chaque modification
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
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
        articles: order.articles as unknown as CartItem[],
        termine: order.termine || 'Non',
        messagefournisseur: order.messagefournisseur,
        archived: order.archive || false,
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
    } finally {
      setIsLoading(false);
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
        articles: cart as unknown as Json,
        termine: 'Non',
        archive: false
      };

      const { error } = await supabase
        .from('commandes')
        .insert(orderData);

      if (error) throw error;

      clearCart();
      loadOrders(); // Recharger les commandes après création

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

  const archiveOrder = async (orderId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ archive: true })
        .eq('commandeid', orderId);

      if (error) throw error;

      await loadOrders();
      
      toast({
        title: "Demande archivée",
        description: "La demande a été archivée avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Error archiving order:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la demande",
        variant: "destructive",
      });
      return false;
    }
  };

  const archiveCompletedOrders = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ archive: true })
        .eq('termine', 'Oui')
        .eq('archive', false);

      if (error) throw error;

      await loadOrders();
      
      toast({
        title: "Demandes archivées",
        description: "Toutes les demandes terminées ont été archivées",
      });
      
      return true;
    } catch (error) {
      console.error("Error archiving completed orders:", error);
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
