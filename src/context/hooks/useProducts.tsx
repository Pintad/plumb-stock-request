import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { toast } from '@/components/ui/use-toast';
import { refreshProductList } from '@/context/imports/productImport';
import { 
  addProductToSupabase, 
  updateProductInSupabase, 
  deleteProductFromSupabase 
} from '@/api/productOperations';

export const useProducts = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [superCategories, setSuperCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extraire les catégories et sur-catégories des produits
  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    
    const uniqueSuperCategories = [...new Set(products
      .map(product => product.superCategory)
      .filter(Boolean) as string[]
    )].sort();
    
    setCategories(uniqueCategories);
    setSuperCategories(uniqueSuperCategories);
    
    console.log(`${uniqueCategories.length} catégories extraites des produits`);
    console.log(`${uniqueSuperCategories.length} sur-catégories extraites des produits`);
    console.log('Catégories disponibles:', uniqueCategories);
    console.log('Sur-catégories disponibles:', uniqueSuperCategories);
    
    // Ajout de logs détaillés sur les produits par catégorie
    uniqueCategories.forEach(category => {
      const productsInCategory = products.filter(p => p.category === category);
      console.log(`Catégorie "${category}": ${productsInCategory.length} produits`);
      
      // Vérifier en particulier pour la catégorie 'cuivre'
      if (category.toLowerCase().includes('cuivre')) {
        console.log(`Détail des produits dans la catégorie ${category}:`, 
          productsInCategory.map(p => ({ 
            id: p.id, 
            name: p.name, 
            variantsCount: p.variants?.length || 0 
          }))
        );
      }
    });
  }, [products]);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des données depuis Supabase...");
        const loadedProducts = await refreshProductList(setProducts);
        console.log(`${loadedProducts.length} produits chargés avec succès`);
        
        // Vérifier les produits par catégorie
        const productsByCategory = loadedProducts.reduce((acc, product) => {
          const category = product.category || 'Sans catégorie';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('Répartition des produits par catégorie après chargement:', productsByCategory);
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
    try {
      const success = await addProductToSupabase(product);
      
      if (success) {
        await refreshProductList(setProducts);
        
        if (product.category && !categories.includes(product.category)) {
          setCategories(prev => [...prev, product.category!].sort());
        }
        
        if (product.superCategory && !superCategories.includes(product.superCategory)) {
          setSuperCategories(prev => [...prev, product.superCategory!].sort());
        }
        
        toast({
          title: "Produit ajouté",
          description: "Le produit a été ajouté avec succès à la base de données",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du produit",
      });
      return false;
    }
  };

  // Mettre à jour un produit
  const updateProduct = async (product: Product) => {
    try {
      const success = await updateProductInSupabase(product);
      
      if (success) {
        await refreshProductList(setProducts);
        
        toast({
          title: "Produit mis à jour",
          description: "Le produit a été mis à jour avec succès",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du produit",
      });
      return false;
    }
  };

  // Supprimer un produit
  const deleteProduct = async (productId: string) => {
    try {
      const success = await deleteProductFromSupabase(productId);
      
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        
        toast({
          title: "Produit supprimé",
          description: "Le produit a été supprimé avec succès",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit",
      });
      return false;
    }
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

  // Gérer les sur-catégories
  const addSuperCategory = (superCategory: string) => {
    if (superCategories.includes(superCategory)) return;
    setSuperCategories([...superCategories, superCategory].sort());
  };

  const deleteSuperCategory = (superCategory: string) => {
    setSuperCategories(superCategories.filter(sc => sc !== superCategory));
    setProducts(products.map(product => 
      product.superCategory === superCategory 
        ? { ...product, superCategory: undefined } 
        : product
    ));
  };

  // Méthode pour rafraîchir les produits depuis Supabase
  const loadProductsFromCSV = async () => {
    try {
      setIsLoading(true);
      await refreshProductList(setProducts);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Une erreur est survenue lors du chargement des produits",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    setProducts,
    categories,
    superCategories,
    addCategory,
    deleteCategory,
    addSuperCategory,
    deleteSuperCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    loadProductsFromCSV
  };
};
