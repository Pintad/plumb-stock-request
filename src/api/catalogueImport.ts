
import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const fetchCatalogueItems = async (): Promise<CatalogueItem[]> => {
  try {
    console.log("Démarrage de la récupération du catalogue complet");

    // Approche hybride : d'abord essayer de récupérer tout d'un coup
    let { data, error } = await supabase
      .from('catalogue')
      .select('*');

    // Si l'approche directe échoue, utiliser la pagination
    if (error || !data) {
      console.log("Récupération directe impossible, utilisation de la pagination");
      
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMoreData = true;

      while (hasMoreData) {
        const { data: pageData, error: pageError } = await supabase
          .from('catalogue')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (pageError) {
          console.error(`Erreur lors de la récupération du catalogue (page ${page}):`, pageError);
          if (page === 0) {
            // Si la première page échoue, on lance l'erreur
            toast({
              variant: "destructive",
              title: "Erreur de chargement",
              description: "Impossible de charger les produits depuis la base de données",
            });
            throw pageError;
          } else {
            // Si une page suivante échoue, on continue avec ce qu'on a
            console.log(`Arrêt de la pagination à la page ${page} à cause d'une erreur`);
            break;
          }
        }
        
        if (pageData && pageData.length > 0) {
          allData = [...allData, ...pageData];
          console.log(`Page ${page + 1}: ${pageData.length} éléments récupérés. Total actuel: ${allData.length}`);
          page++;
          
          // Si la page n'est pas complète, on a atteint la fin des données
          hasMoreData = pageData.length === pageSize;
        } else {
          hasMoreData = false;
        }
        
        // Sécurité : éviter les boucles infinies
        if (page > 100) {
          console.log("Arrêt de la pagination après 100 pages pour éviter les boucles infinies");
          break;
        }
      }
      
      data = allData;
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
