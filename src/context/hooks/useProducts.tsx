
import { useState, useEffect } from 'react';
import { Product, CatalogueItem, ProductVariant } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useProducts = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour convertir les éléments du catalogue en produits
  const convertCatalogueToProducts = (catalogueItems: CatalogueItem[]): Product[] => {
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
        // Charger directement depuis la table catalogue au lieu de products
        const { data: catalogueData, error: catalogueError } = await supabase
          .from('catalogue')
          .select('*');
        
        if (catalogueError) {
          console.error("Erreur lors du chargement du catalogue:", catalogueError);
        } else if (catalogueData) {
          // Convertir les données du catalogue en produits
          const formattedProducts = convertCatalogueToProducts(catalogueData);
          setProducts(formattedProducts);
          
          // Extraire les catégories uniques du catalogue
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

  // La fonction addProduct utilise maintenant les triggers pour synchroniser avec le catalogue
  const addProduct = async (product: Product) => {
    try {
      let categoryId = null;
      
      if (product.category) {
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .maybeSingle();
        
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

      // Le produit sera automatiquement ajouté au catalogue par le trigger
      // Charger les dernières données pour s'assurer que tout est synchronisé
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select('*');
        
      if (catalogueData) {
        const updatedProducts = convertCatalogueToProducts(catalogueData);
        setProducts(updatedProducts);
      } else {
        // Fallback si la requête du catalogue échoue
        setProducts(prev => [...prev, { ...product, id: newProduct.id }]);
      }
      
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
          .maybeSingle();
        
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

      // Le produit sera automatiquement mis à jour dans le catalogue par le trigger
      // Charger les dernières données pour s'assurer que tout est synchronisé
      const { data: catalogueData } = await supabase
        .from('catalogue')
        .select('*');
        
      if (catalogueData) {
        const updatedProducts = convertCatalogueToProducts(catalogueData);
        setProducts(updatedProducts);
      } else {
        // Fallback si la requête du catalogue échoue
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Supprimer le produit de Supabase
      // Les triggers s'occuperont de supprimer les entrées correspondantes du catalogue
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
