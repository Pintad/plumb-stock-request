
import React, { createContext, useContext, useState } from 'react';
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
  const { user, session, login, logout, signup, isAdmin, loading: isLoading } = useAuth();
  const { products, setProducts, categories, addCategory, deleteCategory, addProduct, updateProduct, deleteProduct, loadProductsFromCSV } = useProducts();
  const { projects, addProject, deleteProject, loadProjects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { orders, createOrder, updateOrderStatus, updateOrder, loadOrders } = useOrders();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | undefined>(undefined);

  // Wrapper to pass affaireId (projectCode) to createOrder in useOrders hook
  const createOrderWrapper = (projectCode?: string) => {
    if (user && cart.length > 0) {
      // projectCode in context is actually code, but createOrder expects affaireId (string or undefined)
      // So we need to find the actual project id by code to pass
      const projectObj = projects.find(p => p.code === projectCode);
      const affaireId = projectObj?.id;
      createOrder(user, cart, clearCart, affaireId, selectedDeliveryDate);
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
    <AppContext.Provider
      value={{
        user,
        session,
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
        loadProjects,
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
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error("useAppContext doit être utilisé à l'intérieur d'un AppProvider");
  }
  
  return context;
};
