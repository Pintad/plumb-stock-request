
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, Project } from '../types';
import { demoProducts, demoUsers, demoOrders } from '../data/demoData';
import { AppContextType } from './types';
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart as clearCartUtil } from './cartUtils';
import { loadProductsFromCSV, loadProjectsFromCSV } from './importUtils';
import { createOrder as createOrderUtil, updateOrder as updateOrderUtil } from './orderUtils';
import { addCategory as addCategoryUtil, deleteCategory as deleteCategoryUtil } from './categoryUtils';
import { addProject as addProjectUtil, deleteProject as deleteProjectUtil } from './projectUtils';
import { supabase } from '@/integrations/supabase/client';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const isAdmin = user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser les catégories à partir des produits
  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    setCategories(uniqueCategories);
  }, []);

  // Charger les données depuis Supabase
  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoading(true);
      try {
        // Charger les produits depuis Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*)');
        
        if (productsError) {
          console.error("Erreur lors du chargement des produits:", productsError);
        } else if (productsData) {
          // Convertir les produits Supabase au format de l'application
          const formattedProducts: Product[] = productsData.map(product => {
            const variants = product.product_variants 
              ? product.product_variants.map((variant: any) => ({
                  id: variant.id,
                  variantName: variant.variant_name,
                  reference: variant.reference,
                  unit: variant.unit
                }))
              : undefined;
            
            return {
              id: product.id,
              name: product.name,
              reference: product.reference || undefined,
              unit: product.unit || undefined,
              category: product.category_id ? product.category_name || undefined : undefined,
              imageUrl: product.image_url || undefined,
              variants: variants && variants.length > 0 ? variants : undefined
            };
          });
          
          setProducts(formattedProducts);
        }

        // Charger les catégories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name');
        
        if (categoriesError) {
          console.error("Erreur lors du chargement des catégories:", categoriesError);
        } else if (categoriesData) {
          setCategories(categoriesData.map(cat => cat.name).sort());
        }

        // Charger les projets
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
        
        if (projectsError) {
          console.error("Erreur lors du chargement des projets:", projectsError);
        } else if (projectsData) {
          const formattedProjects: Project[] = projectsData.map(project => ({
            id: project.id,
            code: project.code,
            name: project.name
          }));
          setProjects(formattedProjects);
        }

        // Charger les commandes si l'utilisateur est connecté
        if (user) {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id);
          
          if (ordersError) {
            console.error("Erreur lors du chargement des commandes:", ordersError);
          } else if (ordersData) {
            // TODO: Implémenter la conversion des commandes au format de l'application
          }
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Si l'utilisateur est connecté, charger les données depuis Supabase
    if (user) {
      loadSupabaseData();
    } else {
      // Essayer de charger au moins les données publiques (produits, catégories, projets)
      loadSupabaseData();
    }

    // Chargement des données depuis le localStorage (comme fallback ou pour le panier)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Ne plus utiliser les données localStorage pour produits, projets, catégories
    // car ils viennent maintenant de Supabase
    
  }, [user?.id]);

  // Sauvegarde des données dans le localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Supprimer les sauvegardes localStorage des données qui viennent maintenant de Supabase
  useEffect(() => {
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('orders');
    localStorage.removeItem('projects');
  }, []);

  const addProduct = async (product: Product) => {
    try {
      // D'abord insérer dans Supabase
      let categoryId = null;
      
      // Si le produit a une catégorie, vérifier si elle existe déjà
      if (product.category) {
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .single();
        
        if (existingCategories) {
          categoryId = existingCategories.id;
        } else {
          // Créer la catégorie si elle n'existe pas
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: product.category })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }

      // Insérer le produit
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
      
      // Si le produit a des variantes, les insérer aussi
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

      // Mettre à jour l'état local
      setProducts(prev => [...prev, { ...product, id: newProduct.id }]);
      
      // Mettre à jour les catégories si nécessaire
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
      
      // Gestion de la catégorie
      if (product.category) {
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', product.category)
          .single();
        
        if (existingCategories) {
          categoryId = existingCategories.id;
        } else {
          // Créer la catégorie si elle n'existe pas
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({ name: product.category })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        }
      }

      // Mettre à jour le produit
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

      // Gérer les variantes
      if (product.variants && product.variants.length > 0) {
        // Supprimer les anciennes variantes
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', product.id);
        
        // Insérer les nouvelles variantes
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

      // Mettre à jour l'état local
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Supprimer de Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;

      // Mettre à jour l'état local
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      return false;
    }
  };

  const login = (username: string, password: string): boolean => {
    const foundUser = demoUsers.find(
      (u) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    clearCartUtil(setCart);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        products,
        setProducts,
        categories,
        addCategory: (category) => addCategoryUtil(categories, setCategories, category),
        deleteCategory: (category) => deleteCategoryUtil(categories, setCategories, products, setProducts, category),
        projects,
        addProject: (project) => addProjectUtil(projects, setProjects, project),
        deleteProject: (projectId) => deleteProjectUtil(projects, setProjects, projectId),
        cart,
        addToCart: (product, quantity) => addToCart(cart, setCart, product, quantity),
        removeFromCart: (productId) => removeFromCart(cart, setCart, productId),
        updateCartItemQuantity: (productId, quantity) => updateCartItemQuantity(cart, setCart, productId, quantity),
        clearCart: () => clearCartUtil(setCart),
        orders,
        createOrder: (projectCode) => createOrderUtil(user, cart, orders, setOrders, () => clearCartUtil(setCart), projectCode),
        updateOrder: (order) => updateOrderUtil(orders, setOrders, order),
        loadProductsFromCSV: (csvContent) => loadProductsFromCSV(csvContent, setProducts, setCategories, categories),
        loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, setProjects),
        isAdmin,
        isLoading,
        // Nouvelles méthodes pour gérer les produits avec Supabase
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useAppContext doit être utilisé à l'intérieur d'un AppProvider");
  }
  
  return context;
};
