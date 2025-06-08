
import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const fetchCatalogueItems = async (): Promise<CatalogueItem[]> => {
  try {
    // Utilisation d'une stratégie de pagination pour récupérer tous les éléments
    let allData: CatalogueItem[] = [];
    let page = 0;
    const pageSize = 1000; // Taille maximale par page
    let hasMoreData = true;

    console.log("Démarrage de la récupération paginée du catalogue");

    while (hasMoreData) {
      const { data, error, count } = await supabase
        .from('catalogue')
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error("Erreur lors de la récupération du catalogue (page " + page + "):", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les produits depuis la base de données",
        });
        throw error;
      }
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        console.log(`Page ${page + 1}: ${data.length} éléments récupérés. Total actuel: ${allData.length}`);
        page++;
        
        // Si la page n'est pas complète, on a atteint la fin des données
        hasMoreData = data.length === pageSize;
      } else {
        hasMoreData = false;
      }
    }
    
    const totalItemsCount = allData.length;
    console.log(`Récupération terminée: ${totalItemsCount} éléments récupérés au total`);
    
    // Vérifier si nous avons bien la catégorie "cuivre à souder"
    const cuivreItems = allData.filter(item => 
      item.categorie && item.categorie.toLowerCase().includes('cuivre')
    );
    
    console.log(`Nombre d'éléments dans la catégorie cuivre: ${cuivreItems?.length || 0}`);
    
    if (cuivreItems && cuivreItems.length > 0) {
      console.log('Échantillon d\'éléments cuivre:', cuivreItems.slice(0, 3));
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
