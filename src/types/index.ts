
export interface ProductVariant {
  id: string;
  variantName: string;
  reference: string;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  reference?: string;
  unit?: string;
  imageUrl?: string;
  category?: string;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  completed?: boolean;
  selectedVariantId?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: CartItem[];
  status: 'pending' | 'processed' | 'completed';
  projectCode?: string;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'worker' | 'admin';
}

export interface Project {
  id: string;
  code: string;
  name: string;
}
