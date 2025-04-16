
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order, Project } from '../types';
import { demoProducts, demoUsers, demoOrders } from '../data/demoData';
import { AppContextType } from './types';
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart as clearCartUtil } from './cartUtils';
import { loadProductsFromCSV, loadProjectsFromCSV } from './importUtils';
import { createOrder as createOrderUtil } from './orderUtils';
import { addCategory as addCategoryUtil, deleteCategory as deleteCategoryUtil } from './categoryUtils';
import { addProject as addProjectUtil, deleteProject as deleteProjectUtil } from './projectUtils';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const isAdmin = user?.role === 'admin';

  // Initialiser les catégories à partir des produits
  useEffect(() => {
    const uniqueCategories = [...new Set(products
      .map(product => product.category)
      .filter(Boolean) as string[]
    )].sort();
    setCategories(uniqueCategories);
  }, []);

  // Chargement des données depuis le localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

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
        loadProductsFromCSV: (csvContent) => loadProductsFromCSV(csvContent, setProducts, setCategories, categories),
        loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, setProjects),
        isAdmin
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
