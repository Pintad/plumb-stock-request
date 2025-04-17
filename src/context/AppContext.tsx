
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, Project } from '../types';
import { demoProducts, demoUsers, demoOrders } from '../data/demoData';
import { AppContextType } from './types';
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart as clearCartUtil } from './cartUtils';
import { loadProductsFromCSV, loadProjectsFromCSV } from './imports';
import { createOrder as createOrderUtil, updateOrder as updateOrderUtil, archiveOrder } from './orderUtils';
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

  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    setCategories(uniqueCategories);
  }, []);

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

        if (user) {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id);
          
          if (ordersError) {
            console.error("Erreur lors du chargement des commandes:", ordersError);
          } else if (ordersData) {
          }
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSupabaseData();
    } else {
      loadSupabaseData();
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('orders');
    localStorage.removeItem('projects');
  }, [user?.id]);

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

  useEffect(() => {
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('orders');
    localStorage.removeItem('projects');
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

  const createOrderWrapper = (projectCode?: string): Order | undefined => {
    if (!user || cart.length === 0) return undefined;
    
    return createOrderUtil(user, cart, orders, setOrders, () => clearCartUtil(setCart), projectCode);
  };

  const archiveOrderWrapper = async (orderId: string): Promise<boolean> => {
    return archiveOrder(orders, setOrders, orderId);
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
        createOrder: createOrderWrapper,
        updateOrder: (order) => updateOrderUtil(orders, setOrders, order),
        archiveOrder: archiveOrderWrapper,
        loadProductsFromCSV: (csvContent) => loadProductsFromCSV(csvContent, setProducts, setCategories, categories),
        loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, setProjects),
        isAdmin,
        isLoading,
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
