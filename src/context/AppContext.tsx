
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, Order } from '../types';
import { demoProducts, demoUsers, demoOrders } from '../data/demoData';
import { toast } from '@/components/ui/use-toast';

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: () => void;
  loadProductsFromCSV: (csvContent: string) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const isAdmin = user?.role === 'admin';

  // Charge l'état sauvegardé au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Chargement des produits CSV sauvegardés s'ils existent
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    // Chargement des commandes
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Sauvegarde l'état quand il change
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
    clearCart();
  };

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Mettre à jour la quantité si le produit est déjà dans le panier
      updateCartItemQuantity(product.id, existingItem.quantity + quantity);
    } else {
      // Ajouter un nouveau produit au panier
      setCart([...cart, { ...product, quantity }]);
    }
    
    toast({
      title: "Produit ajouté",
      description: `${quantity} ${product.name} ajouté au panier`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(
      cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = () => {
    if (!user || cart.length === 0) return;
    
    const newOrder: Order = {
      id: `${orders.length + 1}`,
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      status: 'pending'
    };
    
    setOrders([...orders, newOrder]);
    clearCart();
    
    toast({
      title: "Demande envoyée",
      description: "Votre demande a bien été transmise",
    });
  };

  const loadProductsFromCSV = (csvContent: string) => {
    try {
      // Diviser par lignes et supprimer la ligne d'en-tête
      const lines = csvContent.split('\n');
      if (lines.length <= 1) {
        throw new Error("Le fichier CSV est vide ou mal formaté");
      }
      
      // Extraire l'en-tête pour vérifier les colonnes
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      const nameIndex = headers.findIndex(h => h === 'designation' || h === 'nom' || h === 'name');
      const referenceIndex = headers.findIndex(h => h === 'reference' || h === 'ref');
      const unitIndex = headers.findIndex(h => h === 'unite' || h === 'unit' || h === 'conditionnement');
      
      if (nameIndex === -1 || referenceIndex === -1 || unitIndex === -1) {
        throw new Error("Format CSV invalide: colonnes manquantes");
      }
      
      // Convertir les lignes CSV en objets produits
      const newProducts: Product[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Ignorer les lignes vides
        
        const values = lines[i].split(',').map(value => value.trim());
        
        if (values.length >= Math.max(nameIndex, referenceIndex, unitIndex) + 1) {
          const product: Product = {
            id: `csv-${i}`,
            name: values[nameIndex],
            reference: values[referenceIndex],
            unit: values[unitIndex]
          };
          
          newProducts.push(product);
        }
      }
      
      if (newProducts.length === 0) {
        throw new Error("Aucun produit valide n'a pu être importé");
      }
      
      setProducts(newProducts);
      toast({
        title: "Import réussi",
        description: `${newProducts.length} produits importés avec succès`,
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        orders,
        createOrder,
        loadProductsFromCSV,
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
