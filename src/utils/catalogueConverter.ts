
import { CatalogueItem, Product, ProductVariant } from '../types';

export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  // Grouper les éléments par désignation
  const groupedItems = catalogueItems.reduce((acc, item) => {
    if (!item.designation) return acc;
    
    const key = item.designation;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CatalogueItem[]>);

  // Convertir chaque groupe en produit
  const products: Product[] = Object.entries(groupedItems).map(([designation, items]) => {
    const baseItem = items[0];
    
    // Si il y a plusieurs éléments avec des variantes différentes, créer des variantes
    const variants: ProductVariant[] = items
      .filter(item => item.variante && item.variante.trim() !== '')
      .map(item => ({
        id: item.id,
        variantName: item.variante!,
        reference: item.reference || '',
        unit: item.unite || ''
      }));

    // Si il n'y a qu'un seul élément sans variante, ne pas créer de variants
    const hasVariants = variants.length > 0;

    return {
      id: baseItem.id,
      name: designation,
      reference: hasVariants ? undefined : baseItem.reference,
      unit: hasVariants ? undefined : baseItem.unite,
      imageUrl: baseItem.image_url,
      category: baseItem.categorie,
      superCategory: baseItem.sur_categorie, // Ajout de la sur-catégorie
      variants: hasVariants ? variants : undefined
    };
  });

  console.log(`Conversion terminée: ${products.length} produits créés à partir de ${catalogueItems.length} éléments du catalogue`);
  
  // Log des sur-catégories trouvées
  const superCategories = [...new Set(products.map(p => p.superCategory).filter(Boolean))];
  console.log(`Sur-catégories trouvées: ${superCategories.length}`, superCategories);
  
  return products;
};
