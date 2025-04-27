
import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const fetchCatalogueItems = async (): Promise<CatalogueItem[]> => {
  try {
    // Augmentons la limite pour être sûr de récupérer tous les éléments
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
    
    console.log(`${data?.length || 0} éléments récupérés sur un total de ${count || 'inconnu'} dans la table catalogue`);
    
    // Vérifier si nous avons bien la catégorie "cuivre à souder"
    const cuivreItems = data?.filter(item => 
      item.categorie && item.categorie.toLowerCase().includes('cuivre')
    );
    
    console.log(`Nombre d'éléments dans la catégorie cuivre: ${cuivreItems?.length || 0}`);
    
    if (cuivreItems && cuivreItems.length > 0) {
      console.log('Échantillon d\'éléments cuivre:', cuivreItems.slice(0, 3));
    }
    
    return data as CatalogueItem[] || [];
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
