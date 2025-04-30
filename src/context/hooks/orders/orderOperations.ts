
import { Order, CartItem, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

/**
 * Fetch orders from Supabase, combining detailed view data with full order information
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Récupérer les données complètes des commandes
    const { data: fullOrders, error } = await supabase
      .from('commandes')
      .select('*')
      .order('datecommande', { ascending: false });

    if (error) throw error;

    // Mapper les données pour correspondre au type Order
    const mappedOrders: Order[] = fullOrders?.map(order => {
      // Ensure articles have completed status
      const articles = (order.articles as unknown as CartItem[]).map(article => ({
        ...article,
        completed: article.completed !== undefined ? article.completed : false
      }));
      
      // Construct the display title using the ordre number or fallback
      const orderTitleDisplay = order.numero_commande_global ? 
        `${order.clientname} - D${String(order.numero_commande_global).padStart(5, '0')}` :
        `${order.clientname} - ${order.commandeid.substring(0, 8)}`;

      return {
        commandeid: order.commandeid,
        clientname: order.clientname,
        datecommande: order.datecommande,
        articles: articles,
        termine: order.termine || 'Non',
        messagefournisseur: order.messagefournisseur,
        archived: false, // Removed archive functionality
        titre_affichage: order.titre_affichage || orderTitleDisplay, // Use stored value or fallback
        // Utiliser directement le code et nom d'affaire stockés en base
        projectCode: '', // Ces champs seront remplis si nécessaire lors de requêtes supplémentaires
        projectName: '', // Ces champs seront remplis si nécessaire lors de requêtes supplémentaires
        status: order.termine === 'Oui' ? 'completed' : 'pending',
        displayTitle: order.titre_affichage || orderTitleDisplay, // Use stored value or fallback
        orderNumber: order.numero_commande_global || 0
      };
    }) || [];
    
    // Pour les commandes qui ont un affaire_id, récupérer le code et nom d'affaire
    if (mappedOrders.length > 0) {
      const ordersWithAffaireId = mappedOrders.filter(order => order.displayTitle && !order.projectCode);
      
      if (ordersWithAffaireId.length > 0) {
        // Pour chaque commande avec un affaire_id mais sans projectCode
        for (const order of ordersWithAffaireId) {
          const { data: commande, error: cmdError } = await supabase
            .from('commandes')
            .select('affaire_id')
            .eq('commandeid', order.commandeid)
            .maybeSingle();
            
          if (!cmdError && commande && commande.affaire_id) {
            const { data: affaire, error: affaireError } = await supabase
              .from('affaires')
              .select('code, name')
              .eq('id', commande.affaire_id)
              .maybeSingle();
              
            if (!affaireError && affaire) {
              order.projectCode = affaire.code;
              order.projectName = affaire.name;
            }
          }
        }
      }
    }
    
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
    
    // Ajouter completed: false à chaque article
    const cartWithCompletionStatus = cart.map(item => ({
      ...item,
      completed: false
    }));

    // Récupérer les détails de l'affaire si un ID est fourni
    let affaireCode = "";
    let affaireName = "";
    if (affaireId) {
      const { data: affaireData, error: affaireError } = await supabase
        .from('affaires')
        .select('code, name')
        .eq('id', affaireId)
        .maybeSingle();

      if (!affaireError && affaireData) {
        affaireCode = affaireData.code;
        affaireName = affaireData.name;
      }
    }

    // Les données de la commande à insérer
    const orderData = {
      clientname: user.name,
      datecommande: new Date().toISOString(),
      articles: cartWithCompletionStatus as unknown as Json,
      termine: 'Non',
      archive: false,
      affaire_id: affaireId || null,
      messagefournisseur: null,
    };

    // Insérer la commande pour obtenir le numero_commande_global généré automatiquement
    const { data, error } = await supabase
      .from('commandes')
      .insert(orderData)
      .select('numero_commande_global, commandeid')
      .single();

    if (error) throw error;
    
    // Maintenant que nous avons le numero_commande_global, nous pouvons générer le titre d'affichage
    // et mettre à jour la commande
    const orderNumber = data.numero_commande_global;
    const orderName = `D${String(orderNumber).padStart(5, '0')}`;
    
    // Construire le titre d'affichage
    let displayTitle = "";
    if (affaireCode && affaireName) {
      // Format: [Code Affaire] - [Nom Affaire] - [Nom Utilisateur] - D00001
      displayTitle = `${affaireCode} - ${affaireName} - ${user.name} - ${orderName}`;
    } else {
      displayTitle = `${user.name} - ${orderName}`;
    }
    
    // Mettre à jour la commande avec le titre d'affichage
    const { error: updateError } = await supabase
      .from('commandes')
      .update({ titre_affichage: displayTitle } as any)
      .eq('commandeid', data.commandeid);
    
    if (updateError) throw updateError;
    
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
