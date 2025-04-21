
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
  const { user, login, logout, signup, isAdmin, loading: isLoading } = useAuth();
  const { products, setProducts, categories, addCategory, deleteCategory, addProduct, updateProduct, deleteProduct, loadProductsFromCSV } = useProducts();
  const { projects, addProject, deleteProject, loadProjects, isLoading: projectsLoading } = useProjects();
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { orders, createOrder, updateOrderStatus, updateOrder, archiveOrder, archiveCompletedOrders, loadOrders } = useOrders();

  // Wrapper to pass affaireId (projectCode) to createOrder in useOrders hook
  const createOrderWrapper = (projectCode?: string) => {
    if (user && cart.length > 0) {
      // projectCode in context is actually code, but createOrder expects affaireId (string or undefined)
      // So we need to find the actual project id by code to pass
      const projectObj = projects.find(p => p.code === projectCode);
      const affaireId = projectObj?.id;
      createOrder(user, cart, clearCart, affaireId);
      return undefined;
    }
    return undefined;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        isAdmin,
        products,
        setProducts,
        categories,
        addCategory,
        deleteCategory,
        projects,
        addProject,
        deleteProject,
        loadProjects, // Expose loadProjects function to components
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        orders,
        loadOrders,
        createOrder: createOrderWrapper,
        updateOrderStatus,
        updateOrder,
        archiveOrder,
        archiveCompletedOrders,
        loadProductsFromCSV,
        loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, addProject),
        isLoading: isLoading || projectsLoading, // Combine loading states
        addProduct,
        updateProduct,
        deleteProduct,
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
