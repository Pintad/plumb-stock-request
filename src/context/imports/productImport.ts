
import { parseCatalogueCSV } from '@/utils/csvCatalogueParser';
import { importCatalogueItems } from '@/api/catalogueImport';
import { showImportSuccess, showImportError } from './csvUtils';
import { Product } from '@/types';
import { convertCatalogueToProducts } from '@/utils/catalogueConverter';
import { supabase } from '@/integrations/supabase/client';

/**
 * Load products from CSV content and store them in Supabase
 */
export const loadProductsFromCSV = async (
  csvContent: string,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    const catalogueItems = parseCatalogueCSV(csvContent);
    
    if (catalogueItems.length === 0) {
      throw new Error("Aucun produit valide n'a pu être extrait du fichier CSV");
    }
    
    const success = await importCatalogueItems(catalogueItems);
    
    if (success) {
      await refreshProductList(setProducts);
      showImportSuccess(catalogueItems.length, "produits");
    }
    
  } catch (error) {
    console.error("Erreur d'importation:", error);
    showImportError(error);
  }
};

/**
 * Rafraîchit la liste des produits depuis Supabase
 */
export const refreshProductList = async (
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    const { data: catalogueItems, error } = await supabase
      .from('catalogue')
      .select('*');
    
    if (error) throw error;
    
    if (!catalogueItems || catalogueItems.length === 0) {
      setProducts([]);
      return [];
    }
    
    const products = convertCatalogueToProducts(catalogueItems);
    setProducts(products);
    
    return products;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement de la liste des produits:", error);
    throw error;
  }
};
