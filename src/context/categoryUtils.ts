
import { Product } from '../types';
import { toast } from '@/components/ui/use-toast';

export const addCategory = (
  categories: string[],
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  category: string
) => {
  if (categories.includes(category)) return;
  setCategories([...categories, category].sort());
};

export const deleteCategory = (
  categories: string[],
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  category: string
) => {
  // Supprimer la catégorie de la liste
  setCategories(categories.filter(c => c !== category));
  
  // Mettre à jour les produits qui utilisent cette catégorie
  setProducts(products.map(product => 
    product.category === category 
      ? { ...product, category: undefined } 
      : product
  ));
};
