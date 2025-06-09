
import { CatalogueItem, Product, ProductVariant } from '../types';

export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  // Convertir chaque élément du catalogue en produit distinct
  const products: Product[] = catalogueItems
    .filter(item => item.designation) // Garder seulement les éléments avec une désignation
    .map(item => ({
      id: item.id,
      name: item.designation!,
      reference: item.reference,
      unit: item.unite,
      imageUrl: item.image_url,
      category: item.categorie,
      superCategory: item.sur_categorie,
      keywords: item.keywords,
      // Pas de variantes - chaque article est un produit à part entière
      variants: undefined
    }));

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
  
  // Log pour vérifier les doublons de noms
  const nameGroups = products.reduce((acc, product) => {
    acc[product.name] = (acc[product.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const duplicateNames = Object.entries(nameGroups).filter(([name, count]) => count > 1);
  if (duplicateNames.length > 0) {
    console.log(`Articles avec le même nom (affichés séparément): ${duplicateNames.length}`, duplicateNames);
  }
  
  return products;
};
