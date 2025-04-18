
import { Product, CartItem, User, Order, Project } from '../types';

export interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (projectCode?: string) => Order | undefined;
  updateOrder: (order: Order) => void;
  archiveOrder: (orderId: string) => Promise<boolean>;
  loadProductsFromCSV: () => Promise<void>;
  loadProjectsFromCSV: (csvContent: string) => void;
  isAdmin: boolean;
  isLoading: boolean;
  // Nouvelles méthodes pour gérer les produits avec Supabase
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
}
