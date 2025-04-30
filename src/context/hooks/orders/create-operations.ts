
import { CartItem, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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
    // CORRECTION: Utiliser maintenant datecommande: null pour laisser Supabase générer automatiquement la date et l'heure
    const orderData = {
      clientname: user.name,
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
      .select('numero_commande_global, commandeid, datecommande')
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
