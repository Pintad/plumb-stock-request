
import { CatalogueItem, Product, ProductVariant } from '../types';

/**
 * Convertit les éléments du catalogue en produits structurés avec leurs variantes
 */
export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  // Pour déboguer
  console.log(`Traitement de ${catalogueItems.length} éléments du catalogue`);
  
  const productMap = new Map<string, Product>();
  
  // Premier passage : créer tous les produits (avec ou sans variantes)
  for (const item of catalogueItems) {
    if (!item.designation) continue;
    
    const productKey = item.designation.toLowerCase();
    
    if (!productMap.has(productKey)) {
      productMap.set(productKey, {
        id: item.id,
        name: item.designation,
        reference: item.reference || undefined,
        unit: item.unite || undefined,
        category: item.categorie || undefined,
        imageUrl: item.image_url || undefined,
        variants: []
      });
    }
    
    // Si c'est une variante, l'ajouter au produit
    if (item.variante) {
      const product = productMap.get(productKey)!;
      
      const variant: ProductVariant = {
        id: `${item.id}-${item.variante}`,
        variantName: item.variante,
        reference: item.reference || '',
        unit: item.unite || ''
      };
      
      product.variants = [...(product.variants || []), variant];
    }
  }
  
  // Pour le débogage
  const productsByCategory = Array.from(productMap.values()).reduce((acc, product) => {
    const category = product.category || 'Sans catégorie';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Répartition des produits par catégorie:', productsByCategory);
  
  // Vérifier spécifiquement la catégorie "cuivre à souder"
  const cuivreProducts = Array.from(productMap.values()).filter(p => 
    p.category && p.category.toLowerCase().includes('cuivre')
  );
  console.log(`Nombre de produits dans la catégorie cuivre: ${cuivreProducts.length}`);
  
  if (cuivreProducts.length > 0) {
    console.log('Échantillon de produits cuivre:', cuivreProducts.slice(0, 3));
  }
  
  return Array.from(productMap.values());
};
