
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
      setOrders(data || []);
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

  return {
    orders,
    loadOrders,
    createOrder,
    updateOrderStatus
  };
};
