
import { fetchCatalogueItems } from '@/api/catalogueImport';
import { Product } from '@/types';
import { convertCatalogueToProducts } from '@/utils/catalogueConverter';

/**
 * Rafraîchit la liste des produits depuis Supabase
 */
export const refreshProductList = async (
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    const catalogueItems = await fetchCatalogueItems();
    
    if (!catalogueItems || catalogueItems.length === 0) {
      console.log("Aucun produit trouvé dans le catalogue");
      setProducts([]);
      return [];
    }
    
    const products = convertCatalogueToProducts(catalogueItems);
    console.log(`${products.length} produits chargés depuis le catalogue`);
    setProducts(products);
    
    return products;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement de la liste des produits:", error);
    throw error;
  }
};
