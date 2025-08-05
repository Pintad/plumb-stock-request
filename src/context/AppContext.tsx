import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, User } from '../types';
import { useProducts } from './hooks/useProducts';
import { useProjects } from './hooks/useProjects';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { useOrders } from './hooks/useOrders';
import { loadProjectsFromCSV } from './imports';
import { AppContextType } from './types';
import { AppSettingsProvider } from './AppSettingsContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, login, logout, signup, isAdmin, isSuperAdmin, loading: isLoading } = useAuth();
  const { products, setProducts, categories, addCategory, deleteCategory, addProduct, updateProduct, deleteProduct, loadProductsFromCSV } = useProducts();
  const { projects, addProject, updateProject, deleteProject, loadProjects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { 
    cart, 
    customItems,
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    addCustomItem,
    removeCustomItem,
    updateCustomItemQuantity,
    totalItems
  } = useCart();
  const { orders, createOrder, updateOrderStatus, updateOrder, deleteOrder, loadOrders } = useOrders();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | undefined>(undefined);

  // Wrapper to pass affaireId (projectCode) to createOrder in useOrders hook
  const createOrderWrapper = (projectCode?: string) => {
    if (user && (cart.length > 0 || customItems.length > 0)) {
      const projectObj = projects.find(p => p.code === projectCode);
      const affaireId = projectObj?.id;
      createOrder(user, cart, customItems, clearCart, affaireId, selectedDeliveryDate);
      return undefined;
    }
    return undefined;
  };

  // Si aucun projet n'est chargé et qu'il y a une erreur, essayer de recharger
  // discrètement les projets lorsque l'utilisateur interagit avec l'application
  useEffect(() => {
    if (projects.length === 0 && projectsError) {
      const handleUserActivity = () => {
        loadProjects(false); // Chargement discret sans message d'erreur
      };

      window.addEventListener('click', handleUserActivity, { once: true });
      return () => window.removeEventListener('click', handleUserActivity);
    }
  }, [projects.length, projectsError, loadProjects]);

  return (
    <AppSettingsProvider>
      <AppContext.Provider
        value={{
          user,
          session,
          login,
          logout,
          signup,
        isAdmin,
        isSuperAdmin,
          products,
          setProducts,
          categories,
          addCategory,
          deleteCategory,
          projects,
          addProject,
          updateProject,
          deleteProject,
          loadProjects,
          cart,
          customItems,
          addToCart,
          removeFromCart,
          updateCartItemQuantity,
          clearCart,
          addCustomItem,
          removeCustomItem,
          updateCustomItemQuantity,
          totalItems,
          orders,
          loadOrders,
          createOrder: createOrderWrapper,
          updateOrderStatus,
          updateOrder,
          deleteOrder,
          loadProductsFromCSV,
          loadProjectsFromCSV: (csvContent) => loadProjectsFromCSV(csvContent, addProject),
          isLoading: isLoading || projectsLoading,
          addProduct,
          updateProduct,
          deleteProduct,
          selectedDeliveryDate,
          setSelectedDeliveryDate
        }}
      >
        {children}
      </AppContext.Provider>
    </AppSettingsProvider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useAppContext doit être utilisé à l'intérieur d'un AppProvider");
  }
  
  return context;
};
