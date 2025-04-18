
import { useState } from 'react';
import { Order, CartItem, User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('datecommande', { ascending: false });

      if (error) throw error;
      
      // Map database records to frontend model
      const mappedOrders = data?.map(order => ({
        ...order,
        id: order.commandeid.toString(),
        userName: order.clientname,
        date: order.datecommande,
        status: order.termine === 'Oui' ? 'completed' : 'pending',
        message: order.messagefournisseur,
        // Create a single item based on the order info
        items: [{
          id: `item-${order.commandeid}`,
          name: order.produit || '',
          reference: order.reference || '',
          quantity: order.quantite || 0,
          completed: order.termine === 'Oui'
        }]
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
      const orderPromises = cart.map(item => {
        const orderData = {
          clientname: user?.name || 'Anonymous',
          datecommande: new Date().toISOString(),
          produit: item.name,
          reference: item.reference || '',
          quantite: item.quantity,
          termine: 'Non',
        };

        return supabase
          .from('commandes')
          .insert(orderData);
      });

      await Promise.all(orderPromises);
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

  const updateOrderStatus = async (orderId: number, termine: string, messagefournisseur?: string) => {
    try {
      const { error } = await supabase
        .from('commandes')
        .update({ 
          termine, 
          ...(messagefournisseur && { messagefournisseur })
        })
        .eq('commandeid', orderId);

      if (error) throw error;

      await loadOrders(); // Reload orders after update
      
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

  // Add updateOrder and archiveOrder functions to match the context interface
  const updateOrder = (updatedOrder: Order) => {
    // Map to actual database fields and update in Supabase
    updateOrderStatus(
      updatedOrder.commandeid,
      updatedOrder.termine || 'Non',
      updatedOrder.messagefournisseur || ''
    );
  };

  const archiveOrder = async (orderId: string): Promise<boolean> => {
    try {
      // In this implementation, we don't have a real "archive" column in the database
      // So we'll just mark it as complete for now
      const orderToArchive = orders.find(order => order.id === orderId);
      if (!orderToArchive) return false;
      
      await updateOrderStatus(orderToArchive.commandeid, 'Oui');
      
      // Update the local state to mark it as archived
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, archived: true } : order
        )
      );
      
      toast({
        title: "Commande archivée",
        description: "La commande a été archivée avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'archivage de la commande:", error);
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
