import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CatalogueItem {
  id: string;
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  variante?: string;
  reference?: string;
  unite?: string;
  image_url?: string;
  keywords?: string;
}

interface CatalogueVariant {
  id: string;
  variante?: string;
  reference?: string;
  unite?: string;
}

interface GroupedCatalogueItem {
  id: string;
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  image_url?: string;
  keywords?: string;
  variants: CatalogueVariant[];
}

export const useCatalogueOperations = () => {
  
  const addCatalogueItem = async (itemData: any) => {
    try {
      const { variants, ...baseData } = itemData;
      
      // Créer un enregistrement pour chaque variante
      const records = variants.map((variant: any) => ({
        designation: baseData.designation,
        categorie: baseData.categorie,
        sur_categorie: baseData.sur_categorie || 'RACCORD',
        image_url: baseData.image_url,
        keywords: baseData.keywords,
        variante: variant.variante,
        reference: variant.reference,
        unite: variant.unite || 'U'
      }));

      const { error } = await supabase
        .from('catalogue')
        .insert(records);

      if (error) throw error;
      toast.success('Article ajouté avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout de l\'article');
      return false;
    }
  };

  const updateCatalogueItem = async (originalItem: GroupedCatalogueItem, updatedData: any) => {
    try {
      const { variants, ...baseData } = updatedData;
      
      // 1. D'abord, supprimer tous les enregistrements existants avec la même désignation
      const { error: deleteError } = await supabase
        .from('catalogue')
        .delete()
        .eq('designation', originalItem.designation);

      if (deleteError) throw deleteError;

      // 2. Puis recréer tous les enregistrements avec les nouvelles données
      const records = variants.map((variant: any) => ({
        designation: baseData.designation,
        categorie: baseData.categorie,
        sur_categorie: baseData.sur_categorie || 'RACCORD',
        image_url: baseData.image_url,
        keywords: baseData.keywords,
        variante: variant.variante,
        reference: variant.reference,
        unite: variant.unite || 'U'
      }));

      const { error: insertError } = await supabase
        .from('catalogue')
        .insert(records);

      if (insertError) throw insertError;
      toast.success('Article mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
      return false;
    }
  };

  const deleteCatalogueItem = async (item: GroupedCatalogueItem) => {
    try {
      // Supprimer tous les enregistrements avec la même désignation
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('designation', item.designation);

      if (error) throw error;
      toast.success('Article supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'article');
      return false;
    }
  };

  const deleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      toast.success('Variante supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la variante');
      return false;
    }
  };

  return {
    addCatalogueItem,
    updateCatalogueItem,
    deleteCatalogueItem,
    deleteVariant
  };
};