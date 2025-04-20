
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
        .select('*, affaire_id, affaires:affaires(id, code, name)')
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
        projectCode: order.affaires?.code || '',
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
    affaireId?: string
  ): Promise<boolean> => {
    try {
      if (!user || cart.length === 0) return false;

      // Count existing orders for the given affaire to generate sequence number
      let orderCount = 0;
      if (affaireId) {
        const { count, error: countError } = await supabase
          .from('commandes')
          .select('commandeid', { count: 'exact', head: true })
          .eq('affaire_id', affaireId);

        if (countError) {
          console.error("Erreur de comptage des commandes pour l'affaire:", countError);
        } else if (typeof count === 'number') {
          orderCount = count;
        }
      }

      // Fetch affaire details to build the order name
      let affaireCode = "";
      if (affaireId) {
        const { data: affaireData, error: affaireError } = await supabase
          .from('affaires')
          .select('code')
          .eq('id', affaireId)
          .single();
        if (affaireError) {
          console.error("Erreur lors de la récupération de l'affaire:", affaireError);
        } else {
          affaireCode = affaireData.code;
        }
      }

      // Generate order name unique per affaire: NomAffaire - 001, 002 etc
      // Using zero padded 3 digits
      const orderName = affaireCode
        ? `${affaireCode} - ${String(orderCount + 1).padStart(3, '0')}`
        : `Commande - ${String(orderCount + 1).padStart(3, '0')}`;

      const orderData = {
        clientname: user.name,
        datecommande: new Date().toISOString(),
        articles: cart as unknown as Json,
        termine: 'Non',
        archive: false,
        affaire_id: affaireId || null,
        commandeid: undefined, // Let Supabase generate UUID
        messagefournisseur: null,
        // Remove "name" field here as it causes DB error (column does not exist)
        // name: orderName
      };

      const { error } = await supabase
        .from('commandes')
        .insert(orderData);

      if (error) throw error;

      clearCart();
      await loadOrders(); // Recharger les commandes après création

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
          termine: termine, 
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

      // Reload orders from the database to get the latest data
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

      // Reload orders from the database to get the latest data
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

