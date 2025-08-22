
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from 'sonner';

export const useBarcodeScanner = () => {
  const [loading, setLoading] = useState(false);

  const searchProductByBarcode = async (barcode: string): Promise<Product | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('catalogue')
        .select('*')
        .eq('reference', barcode.trim())
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la recherche:', error);
        toast.error('Erreur lors de la recherche du code-barres');
        return null;
      }

      if (!data) {
        toast.error('Article inconnu - Référence non trouvée');
        return null;
      }

      // Convertir les données catalogue en format Product
      const product: Product = {
        id: data.id,
        name: data.designation || '',
        category: data.categorie || '',
        superCategory: data.sur_categorie || 'RACCORD',
        reference: data.reference || '',
        unit: data.unite || 'U',
        imageUrl: data.image_url || '',
        keywords: data.keywords || '',
        variants: data.variante ? [{
          id: `${data.id}-variant`,
          variantName: data.variante,
          reference: data.reference || '',
          unit: data.unite || 'U'
        }] : undefined
      };

      return product;
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la recherche');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchProductByBarcode,
    loading
  };
};
