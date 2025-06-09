
import { CatalogueItem, Product, ProductVariant } from '../types';

export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  // Grouper les éléments par désignation ET catégorie pour identifier les vraies variantes
  const groupedItems = catalogueItems.reduce((acc, item) => {
    if (!item.designation) return acc;
    
    // Clé composite : nom + catégorie pour identifier les variantes d'un même produit
    const key = `${item.designation}|||${item.categorie || 'NO_CATEGORY'}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CatalogueItem[]>);

  // Convertir chaque groupe en produit
  const products: Product[] = Object.entries(groupedItems).map(([key, items]) => {
    const baseItem = items[0];
    
    // Si il y a plusieurs éléments avec des références différentes, créer des variantes
    if (items.length > 1) {
      const variants: ProductVariant[] = items.map((item, index) => ({
        id: item.id,
        variantName: item.reference || item.variante || `Variante ${index + 1}`,
        reference: item.reference || '',
        unit: item.unite || ''
      }));

      return {
        id: baseItem.id,
        name: baseItem.designation!,
        reference: undefined, // Pas de référence au niveau du produit principal
        unit: undefined, // Pas d'unité au niveau du produit principal
        imageUrl: baseItem.image_url,
        category: baseItem.categorie,
        superCategory: baseItem.sur_categorie,
        keywords: baseItem.keywords,
        variants: variants
      };
    } else {
      // Si il n'y a qu'un seul élément, créer un produit simple
      return {
        id: baseItem.id,
        name: baseItem.designation!,
        reference: baseItem.reference,
        unit: baseItem.unite,
        imageUrl: baseItem.image_url,
        category: baseItem.categorie,
        superCategory: baseItem.sur_categorie,
        keywords: baseItem.keywords,
        variants: undefined
      };
    }
  });

  console.log(`Conversion terminée: ${products.length} produits créés à partir de ${catalogueItems.length} éléments du catalogue`);
  
  // Log des sur-catégories trouvées
  const superCategories = [...new Set(products.map(p => p.superCategory).filter(Boolean))];
  console.log(`Sur-catégories trouvées: ${superCategories.length}`, superCategories);
  
  // Log des mots-clés pour vérifier le mapping
  const productsWithKeywords = products.filter(p => p.keywords && p.keywords.trim() !== '');
  console.log(`Produits avec mots-clés: ${productsWithKeywords.length}`);
  if (productsWithKeywords.length > 0) {
    console.log('Échantillon de produits avec mots-clés:', productsWithKeywords.slice(0, 3).map(p => ({
      name: p.name,
      keywords: p.keywords
    })));
  }

  // Log pour vérifier le regroupement des variantes
  const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0);
  console.log(`Produits avec variantes: ${productsWithVariants.length}`);
  if (productsWithVariants.length > 0) {
    console.log('Échantillon de produits avec variantes:', productsWithVariants.slice(0, 3).map(p => ({
      name: p.name,
      category: p.category,
      variantsCount: p.variants?.length || 0,
      variants: p.variants?.map(v => v.variantName)
    })));
  }
  
  return products;
};
