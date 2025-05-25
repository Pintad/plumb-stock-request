
import { useMemo } from 'react';
import { Product, SuperCategory, CategoryHierarchy } from '@/types';

export const useCategoryHierarchy = (products: Product[]) => {
  const categoryHierarchy = useMemo<CategoryHierarchy>(() => {
    // Grouper les produits par sur-catégorie et catégorie
    const superCategoryMap = new Map<string, Map<string, number>>();
    const uncategorizedCategories = new Set<string>();

    products.forEach(product => {
      if (!product.category) return;

      const superCategory = product.superCategory;
      const category = product.category;

      if (superCategory) {
        if (!superCategoryMap.has(superCategory)) {
          superCategoryMap.set(superCategory, new Map());
        }
        const categoryMap = superCategoryMap.get(superCategory)!;
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      } else {
        uncategorizedCategories.add(category);
      }
    });

    // Créer la structure des sur-catégories
    const superCategories: SuperCategory[] = Array.from(superCategoryMap.entries())
      .map(([superCatName, categoryMap]) => ({
        name: superCatName,
        categories: Array.from(categoryMap.keys()).sort(),
        productCount: Array.from(categoryMap.values()).reduce((sum, count) => sum + count, 0)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      superCategories,
      uncategorizedCategories: Array.from(uncategorizedCategories).sort()
    };
  }, [products]);

  return categoryHierarchy;
};
