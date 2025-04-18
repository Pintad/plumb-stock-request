
import { CatalogueItem, Product, ProductVariant } from '../types';

export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  const productMap = new Map<string, Product>();
  const variantMap = new Map<string, Map<string, ProductVariant>>();
  
  // Traiter d'abord les éléments sans variante
  catalogueItems.filter(item => !item.variante).forEach(item => {
    productMap.set(item.designation, {
      id: item.id,
      name: item.designation,
      reference: item.reference || undefined,
      unit: item.unite || undefined,
      category: item.categorie || undefined,
      imageUrl: item.image_url || undefined,
      variants: []
    });
  });
  
  // Traiter ensuite les variantes
  catalogueItems.filter(item => item.variante).forEach(item => {
    if (!variantMap.has(item.designation)) {
      variantMap.set(item.designation, new Map());
    }
    
    const productVariants = variantMap.get(item.designation)!;
    
    productVariants.set(item.variante!, {
      id: `${item.id}-${item.variante}`,
      variantName: item.variante!,
      reference: item.reference || '',
      unit: item.unite || ''
    });
    
    // Créer ou mettre à jour le produit
    if (!productMap.has(item.designation)) {
      productMap.set(item.designation, {
        id: item.id,
        name: item.designation,
        category: item.categorie || undefined,
        imageUrl: item.image_url || undefined,
        variants: []
      });
    }
  });
  
  // Ajouter les variantes aux produits
  for (const [designation, variants] of variantMap.entries()) {
    if (productMap.has(designation)) {
      const product = productMap.get(designation)!;
      product.variants = Array.from(variants.values());
    }
  }
  
  return Array.from(productMap.values());
};
