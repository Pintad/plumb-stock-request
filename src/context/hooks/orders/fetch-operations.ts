
import { Order, CartItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

/**
 * Fetch orders from Supabase, combining detailed view data with full order information
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Récupérer les données complètes des commandes, triées par numero_commande_global décroissant (les plus récents en premier)
    const { data: fullOrders, error } = await supabase
      .from('commandes')
      .select('*')
      .order('numero_commande_global', { ascending: false });

    if (error) throw error;

    // Mapper les données pour correspondre au type Order
    const mappedOrders: Order[] = fullOrders?.map(order => {
      // Ensure articles have completed status
      const articles = (order.articles as unknown as CartItem[]).map(article => ({
        ...article,
        completed: article.completed !== undefined ? article.completed : false
      }));
      
      // Récupérer directement le titre d'affichage depuis la base de données
      // Si titre_affichage est null ou undefined, utiliser un message d'erreur clair
      const orderDisplayTitle = (order as any).titre_affichage || "[ERREUR: Titre manquant]";

      return {
        commandeid: order.commandeid,
        clientname: order.clientname,
        datecommande: order.datecommande,
        articles: articles,
        termine: order.termine || 'Non',
        messagefournisseur: order.messagefournisseur,
        archived: false, // Removed archive functionality
        titre_affichage: orderDisplayTitle, 
        date_mise_a_disposition: order.date_mise_a_disposition || null, // Nouvelle date souhaitée
        // Ces champs seront remplis si nécessaire lors de requêtes supplémentaires
        projectCode: '', 
        projectName: '', 
        status: order.termine === 'Oui' ? 'completed' : 'pending',
        displayTitle: orderDisplayTitle, // Utiliser directement le titre stocké en base
        orderNumber: order.numero_commande_global || 0
      };
    }) || [];
    
    // Pour les commandes qui ont un affaire_id, récupérer le code et nom d'affaire
    if (mappedOrders.length > 0) {
      // Fetch all projects once to avoid multiple database queries
      const { data: allProjects, error: projectsError } = await supabase
        .from('affaires')
        .select('id, code, name');
      
      if (!projectsError && allProjects) {
        const projectsMap = new Map(allProjects.map(p => [p.id, { code: p.code, name: p.name }]));
        
        // Get affaire_ids for all orders at once
        const { data: orderAffaires, error: orderAffairesError } = await supabase
          .from('commandes')
          .select('commandeid, affaire_id')
          .in('commandeid', mappedOrders.map(o => o.commandeid))
          .not('affaire_id', 'is', null);
        
        if (!orderAffairesError && orderAffaires) {
          // Create a map of commandeid to affaire_id
          const orderAffaireMap = new Map(orderAffaires.map(o => [o.commandeid, o.affaire_id]));
          
          // Update each order with project info in a single loop
          for (const order of mappedOrders) {
            const affaireId = orderAffaireMap.get(order.commandeid);
            if (affaireId) {
              const projectInfo = projectsMap.get(affaireId);
              if (projectInfo) {
                order.projectCode = projectInfo.code;
                order.projectName = projectInfo.name;
              }
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
