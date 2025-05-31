

import { Product, Project, User, Order, CartItem } from '../types';

export interface AppContextType {
  user: User | null;
  session: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  isAdmin: boolean;
  products: Product[];
  setProducts: (products: Product[]) => void;
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  projects: Project[];
  addProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  loadProjects: (showToastOnError?: boolean) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  loadOrders: () => void;
  createOrder: (projectCode?: string) => void;
  updateOrderStatus: (orderId: string, status: string, message?: string) => Promise<void>;
  updateOrder: (updatedOrder: Order) => Promise<boolean>;
  loadProductsFromCSV: (csvContent: string) => Promise<void>;
  loadProjectsFromCSV: (csvContent: string) => Promise<void>;
  isLoading: boolean;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  selectedDeliveryDate: Date | undefined;
  setSelectedDeliveryDate: (date: Date | undefined) => void;
}

