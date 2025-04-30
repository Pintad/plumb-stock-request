
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

/**
 * Update an order's status in Supabase
 */
export const updateOrderStatusInDb = async (
  orderId: string, 
  termine: string, 
  messagefournisseur?: string
): Promise<void> => {
  try {
    // First get the current order to get the articles array
    const { data: currentOrder, error: fetchError } = await supabase
      .from('commandes')
      .select('articles')
      .eq('commandeid', orderId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Then update the order with the new status and message
    const { error } = await supabase
      .from('commandes')
      .update({ 
        termine: termine, 
        ...(messagefournisseur !== undefined && { messagefournisseur })
      })
      .eq('commandeid', orderId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    throw error;
  }
};

/**
 * Update an order's articles and status in Supabase
 */
export const updateOrderInDb = async (order: Order): Promise<void> => {
  try {
    const { error } = await supabase
      .from('commandes')
      .update({ 
        articles: order.articles as unknown as Json,
        termine: order.termine,
        messagefournisseur: order.messagefournisseur
      })
      .eq('commandeid', order.commandeid);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    throw error;
  }
};
