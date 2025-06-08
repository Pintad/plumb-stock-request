import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const fetchCatalogueItems = async (): Promise<CatalogueItem[]> => {
  try {
    console.log("Démarrage de la récupération complète du catalogue");

    // Récupération de tous les éléments sans pagination
    const { data, error, count } = await supabase
      .from('catalogue')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error("Erreur lors de la récupération du catalogue:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les produits depuis la base de données",
      });
      throw error;
    }
    
    const allData = data || [];
    const totalItemsCount = allData.length;
    console.log(`Récupération terminée: ${totalItemsCount} éléments récupérés au total`);
    console.log(`Nombre total d'éléments dans la base selon count: ${count}`);
    
    // Vérifier si nous avons bien la catégorie "cuivre à souder"
    const cuivreItems = allData.filter(item => 
      item.categorie && item.categorie.toLowerCase().includes('cuivre')
    );
    
    console.log(`Nombre d'éléments dans la catégorie cuivre: ${cuivreItems?.length || 0}`);
    
    if (cuivreItems && cuivreItems.length > 0) {
      console.log('Échantillon d\'éléments cuivre:', cuivreItems.slice(0, 3));
    }

    // Vérifier spécifiquement l'article mentionné
    const specificItem = allData.find(item => 
      item.reference && item.reference.includes('34CO045MF080')
    );
    
    if (specificItem) {
      console.log('Article 34CO045MF080 trouvé:', specificItem);
    } else {
      console.log('Article 34CO045MF080 NON trouvé dans les données récupérées');
      
      // Recherche plus large au cas où la référence serait légèrement différente
      const similarItems = allData.filter(item => 
        item.reference && (
          item.reference.includes('34CO045') || 
          item.reference.includes('MF080') ||
          item.designation?.includes('34CO045MF080')
        )
      );
      
      if (similarItems.length > 0) {
        console.log('Articles similaires trouvés:', similarItems);
      }
    }
    
    return allData;
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
