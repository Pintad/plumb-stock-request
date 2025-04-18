
import { useState, useEffect } from 'react';
import { Product, CatalogueItem, ProductVariant } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { convertCatalogueToProducts } from '@/utils/catalogueConverter';
import { addProductToSupabase, updateProductInSupabase, deleteProductFromSupabase } from '@/api/productOperations';

export const useProducts = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    setCategories(uniqueCategories);
  }, [products]);

  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoading(true);
      try {
        const { data: catalogueData, error: catalogueError } = await supabase
          .from('catalogue')
          .select('*');
        
        if (catalogueError) {
          console.error("Erreur lors du chargement du catalogue:", catalogueError);
        } else if (catalogueData) {
          const formattedProducts = convertCatalogueToProducts(catalogueData);
          setProducts(formattedProducts);
          
          const catalogueCategories = [...new Set(catalogueData
            .map(item => item.categorie)
            .filter(Boolean)
          )].sort();
          
          setCategories(catalogueCategories);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSupabaseData();
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
  }, []);

  const addProduct = async (product: Product) => {
    const success = await addProductToSupabase(product);
    
    if (success) {
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select('*');
        
      if (catalogueData) {
        const updatedProducts = convertCatalogueToProducts(catalogueData);
        setProducts(updatedProducts);
      }
      
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category!].sort());
      }
    }
    
    return success;
  };

  const updateProduct = async (product: Product) => {
    const success = await updateProductInSupabase(product);
    
    if (success) {
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select('*');
        
      if (catalogueData) {
        const updatedProducts = convertCatalogueToProducts(catalogueData);
        setProducts(updatedProducts);
      }
    }
    
    return success;
  };

  const deleteProduct = async (productId: string) => {
    const success = await deleteProductFromSupabase(productId);
    
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
    
    return success;
  };

  const addCategory = (category: string) => {
    if (categories.includes(category)) return;
    setCategories([...categories, category].sort());
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
    setProducts(products.map(product => 
      product.category === category 
        ? { ...product, category: undefined } 
        : product
    ));
  };

  return {
    products,
    setProducts,
    categories,
    addCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading
  };
};
