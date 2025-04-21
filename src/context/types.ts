
import { Product, CartItem, User, Order, Project } from '../types';

export interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  loadProjects: () => Promise<void>; // Added loadProjects function
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  loadOrders: () => Promise<void>;
  createOrder: (projectCode?: string) => Order | undefined;
  updateOrderStatus: (orderId: string, termine: string, messagefournisseur?: string) => Promise<void>;
  updateOrder: (order: Order) => void;
  archiveOrder: (orderId: string) => Promise<boolean>;
  archiveCompletedOrders: () => Promise<boolean>;
  loadProductsFromCSV: () => Promise<void>;
  loadProjectsFromCSV: (csvContent: string) => void;
  isAdmin: boolean;
  isLoading: boolean;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
}
