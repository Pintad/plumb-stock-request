
import { CatalogueItem, Product, ProductVariant } from '../types';

export const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
  // Créer un produit distinct pour chaque élément du catalogue
  // Ne grouper que si c'est vraiment la même référence de base avec des variantes
  const products: Product[] = catalogueItems
    .filter(item => item.designation) // S'assurer qu'il y a une désignation
    .map(item => {
      // Chaque élément du catalogue devient un produit distinct
      return {
        id: item.id,
        name: item.designation!,
        reference: item.reference,
        unit: item.unite,
        imageUrl: item.image_url,
        category: item.categorie,
        superCategory: item.sur_categorie,
        keywords: item.keywords,
        // Pas de variantes pour l'instant - chaque élément est un produit à part entière
        variants: undefined
      };
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

  // Log pour vérifier qu'on n'a plus de déduplication
  const productNames = products.map(p => p.name);
  const uniqueNames = [...new Set(productNames)];
  console.log(`Produits total: ${products.length}, noms uniques: ${uniqueNames.length}`);
  if (products.length > uniqueNames.length) {
    console.log('✅ Plusieurs produits avec le même nom détectés (comportement attendu)');
  }
  
  return products;
};
