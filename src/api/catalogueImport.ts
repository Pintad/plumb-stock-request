import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const fetchCatalogueItems = async (): Promise<CatalogueItem[]> => {
  try {
    console.log("Démarrage de la récupération du catalogue complet");

    // Récupérer tous les éléments sans pagination
    const { data, error } = await supabase
      .from('catalogue')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération du catalogue:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les produits depuis la base de données",
      });
      throw error;
    }
    
    const totalItemsCount = data?.length || 0;
    console.log(`Récupération terminée: ${totalItemsCount} éléments récupérés au total`);
    
    // Vérifier si nous avons l'article spécifique mentionné
    const specificItem = data?.find(item => item.reference === '34CO045MF080');
    if (specificItem) {
      console.log('Article 34CO045MF080 trouvé dans la base:', specificItem);
    } else {
      console.log('Article 34CO045MF080 non trouvé dans la base de données');
    }
    
    // Vérifier si nous avons bien la catégorie "cuivre à souder"
    const cuivreItems = data?.filter(item => 
      item.categorie && item.categorie.toLowerCase().includes('cuivre')
    ) || [];
    
    console.log(`Nombre d'éléments dans la catégorie cuivre: ${cuivreItems.length}`);
    
    if (cuivreItems.length > 0) {
      console.log('Échantillon d\'éléments cuivre:', cuivreItems.slice(0, 3));
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération du catalogue:", error);
    return [];
  }
};

export const importCatalogueItems = async (items: CatalogueItem[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('catalogue')
      .insert(items.map(item => ({
        designation: item.designation,
        reference: item.reference || null,
        unite: item.unite || null,
        categorie: item.categorie || null,
        image_url: item.image_url || null,
        variante: item.variante || null
      })));
    
    if (error) {
      console.error("Erreur d'insertion dans la table catalogue:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: "Une erreur est survenue lors de l'importation des produits",
      });
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation du catalogue:", error);
    return false;
  }
};
