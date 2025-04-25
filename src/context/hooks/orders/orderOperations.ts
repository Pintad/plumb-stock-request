
import { Order, CartItem, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

/**
 * Fetch orders from Supabase, combining detailed view data with full order information
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Récupérer les commandes détaillées depuis la vue
    const { data: detailedOrders, error: viewError } = await supabase
      .from('v_commandes_detaillees')
      .select('*');

    if (viewError) {
      console.error("Erreur lors du chargement des commandes détaillées:", viewError);
      throw viewError;
    }

    // Récupérer les données complètes des commandes pour les articles, etc.
    const { data: fullOrders, error } = await supabase
      .from('commandes')
      .select('*')
      .order('datecommande', { ascending: false });

    if (error) throw error;

    // Fusionner les données
    const mappedOrders: Order[] = fullOrders?.map(order => {
      // Trouver les données détaillées correspondantes
      const detailedOrder = detailedOrders?.find(
        (detailed) => detailed.commande_id === order.commandeid
      );

      // Ensure articles have completed status
      const articles = (order.articles as unknown as CartItem[]).map(article => ({
        ...article,
        completed: article.completed !== undefined ? article.completed : false
      }));

      return {
        commandeid: order.commandeid,
        clientname: order.clientname,
        datecommande: order.datecommande,
        articles: articles,
        termine: order.termine || 'Non',
        messagefournisseur: order.messagefournisseur,
        archived: false, // Removed archive functionality
        projectCode: detailedOrder?.code_affaire || '',
        status: order.termine === 'Oui' ? 'completed' : 'pending',
        // Nouveaux champs depuis la vue
        displayTitle: detailedOrder?.titre_affichage || '',
        projectName: detailedOrder?.nom_affaire || '',
        orderNumber: detailedOrder?.numero_demande || 0
      };
    }) || [];
    
    return mappedOrders;
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
    throw error;
  }
};

/**
 * Create a new order in Supabase
 */
export const createOrderInDb = async (
  user: User | null,
  cart: CartItem[],
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
        .maybeSingle();

      if (affaireError) {
        console.error("Erreur lors de la récupération de l'affaire:", affaireError);
      } else if (affaireData) {
        affaireCode = affaireData.code;
      }
    }

    // Add completed: false to each cart item
    const cartWithCompletionStatus = cart.map(item => ({
      ...item,
      completed: false
    }));

    // Generate order name unique per affaire: NomAffaire - 001, 002 etc
    const orderName = affaireCode
      ? `${affaireCode} - ${String(orderCount + 1).padStart(3, '0')}`
      : `Commande - ${String(orderCount + 1).padStart(3, '0')}`;

    const orderData = {
      clientname: user.name,
      datecommande: new Date().toISOString(),
      articles: cartWithCompletionStatus as unknown as Json,
      termine: 'Non',
      archive: false, // Setting this to false by default, but no longer using it
      affaire_id: affaireId || null,
      commandeid: undefined, // Let Supabase generate UUID
      messagefournisseur: null,
    };

    const { error } = await supabase
      .from('commandes')
      .insert(orderData);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
};

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
