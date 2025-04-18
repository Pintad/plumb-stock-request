
import { supabase } from '@/integrations/supabase/client';
import { CatalogueItem } from '../types';
import { toast } from '@/components/ui/use-toast';

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
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation du catalogue:", error);
    toast({
      variant: "destructive",
      title: "Erreur d'importation",
      description: "Une erreur est survenue lors de l'importation des produits",
    });
    return false;
  }
};
