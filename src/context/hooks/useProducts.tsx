
import { useState, useEffect } from 'react';
import { Product, CatalogueItem } from '../../types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  addProductToSupabase, 
  updateProductInSupabase, 
  deleteProductFromSupabase,
  fetchAllProducts
} from '@/api/productOperations';

export const useProducts = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extraire les catégories des produits
  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    setCategories(uniqueCategories);
  }, [products]);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les produits depuis la base de données.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSupabaseData();
  }, []);

  // Ajouter un produit
  const addProduct = async (product: Product) => {
    const success = await addProductToSupabase(product);
    
    if (success) {
      const updatedProducts = await fetchAllProducts();
      setProducts(updatedProducts);
      
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category!].sort());
      }
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès à la base de données",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit",
      });
    }
    
    return success;
  };

  // Mettre à jour un produit
  const updateProduct = async (product: Product) => {
    const success = await updateProductInSupabase(product);
    
    if (success) {
      const updatedProducts = await fetchAllProducts();
      setProducts(updatedProducts);
      
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du produit",
      });
    }
    
    return success;
  };

  // Supprimer un produit
  const deleteProduct = async (productId: string) => {
    const success = await deleteProductFromSupabase(productId);
    
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit",
      });
    }
    
    return success;
  };

  // Gérer les catégories
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
    isLoading,
    loadProductsFromCSV: async (csvContent: string) => {
      try {
        // Cette fonction pourrait être implémentée si nécessaire
        // pour l'importation directe dans la table catalogue
        toast({
          title: "Importation",
          description: "Fonctionnalité d'importation à implémenter",
        });
      } catch (error) {
        console.error("Erreur lors de l'importation CSV:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'importation",
          description: "Une erreur est survenue lors de l'importation des produits",
        });
      }
    }
  };
};
