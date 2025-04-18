
import React, { createContext, useContext } from 'react';
import { Order, User } from '../types';
import { useProducts } from './hooks/useProducts';
import { useProjects } from './hooks/useProjects';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';
import { loadProjectsFromCSV } from './imports';
import { AppContextType } from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login, logout, isAdmin } = useAuth();
  const { products, setProducts, categories, addCategory, deleteCategory, addProduct, updateProduct, deleteProduct, isLoading, loadProductsFromCSV } = useProducts();
  const { projects, addProject, deleteProject } = useProjects();
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { orders, createOrder: createOrderBase, updateOrder, archiveOrder, updateOrderStatus } = useOrders();

  // Wrapper functions
  const createOrderWrapper = (projectCode?: string): Order | undefined => {
    return createOrderBase(user, cart, clearCart) ? {} as Order : undefined;
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
        addCategory,
        deleteCategory,
        projects,
        addProject,
        deleteProject,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        orders,
        createOrder: createOrderWrapper,
        updateOrder,
        archiveOrder,
        loadProductsFromCSV,
        loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, addProject),
        isAdmin,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus
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
