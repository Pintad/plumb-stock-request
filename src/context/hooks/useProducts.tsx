
import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*)');
        
        if (productsError) {
          console.error("Erreur lors du chargement des produits:", productsError);
        } else if (productsData) {
          const formattedProducts: Product[] = productsData.map(product => {
            const variants = product.product_variants 
              ? product.product_variants.map((variant: any) => ({
                  id: variant.id,
                  variantName: variant.variant_name,
                  reference: variant.reference,
                  unit: variant.unit
                }))
              : undefined;
            
            let categoryName;
            if (product.category_id) {
              categoryName = undefined;
            }
            
            return {
              id: product.id,
              name: product.name,
              reference: product.reference || undefined,
              unit: product.unit || undefined,
              category: categoryName,
              imageUrl: product.image_url || undefined,
              variants: variants && variants.length > 0 ? variants : undefined
            };
          });
          
          setProducts(formattedProducts);
          
          const productsWithCategoryIds = productsData.filter(p => p.category_id);
          if (productsWithCategoryIds.length > 0) {
            const categoryIds = [...new Set(productsWithCategoryIds.map(p => p.category_id))];
            const { data: categoriesData, error: catError } = await supabase
              .from('categories')
              .select('id, name')
              .in('id', categoryIds);
              
            if (!catError && categoriesData) {
              const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));
              setProducts(prevProducts => 
                prevProducts.map(product => {
                  const originalProduct = productsData.find(p => p.id === product.id);
                  if (originalProduct?.category_id) {
                    return {
                      ...product,
                      category: categoryMap.get(originalProduct.category_id) || undefined
                    };
                  }
                  return product;
                })
              );
            }
          }
        }

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name');
        
        if (categoriesError) {
          console.error("Erreur lors du chargement des catégories:", categoriesError);
        } else if (categoriesData) {
          setCategories(categoriesData.map(cat => cat.name).sort());
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
    try {
      let categoryId = null;
      
      if (product.category) {
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .single();
        
        if (existingCategories) {
          categoryId = existingCategories.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: product.category })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          reference: product.reference,
          unit: product.unit,
          category_id: categoryId,
          image_url: product.imageUrl
        })
        .select()
        .single();
      
      if (productError) throw productError;
      
      if (product.variants && product.variants.length > 0) {
        const variantsToInsert = product.variants.map(variant => ({
          product_id: newProduct.id,
          variant_name: variant.variantName,
          reference: variant.reference,
          unit: variant.unit
        }));
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);
        
        if (variantError) throw variantError;
      }

      setProducts(prev => [...prev, { ...product, id: newProduct.id }]);
      
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category!].sort());
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      return false;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      let categoryId = null;
      
      if (product.category) {
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .single();
        
        if (existingCategories) {
          categoryId = existingCategories.id;
        } else {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: product.category })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }

      const { error: productError } = await supabase
        .from('products')
        .update({
          name: product.name,
          reference: product.reference || null,
          unit: product.unit || null,
          category_id: categoryId,
          image_url: product.imageUrl || null
        })
        .eq('id', product.id);
      
      if (productError) throw productError;

      if (product.variants && product.variants.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', product.id);
        
        const variantsToInsert = product.variants.map(variant => ({
          product_id: product.id,
          variant_name: variant.variantName,
          reference: variant.reference,
          unit: variant.unit
        }));
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);
        
        if (variantError) throw variantError;
      }

      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error: variantError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);
      
      if (variantError) {
        console.error("Erreur lors de la suppression des variantes:", variantError);
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        console.error("Erreur lors de la suppression du produit:", error);
        return false;
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      return false;
    }
  };

  const addCategory = (category: string) => {
    if (categories.includes(category)) return;
    setCategories([...categories, category].sort());
  };

  const deleteCategory = (
    category: string
  ) => {
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
