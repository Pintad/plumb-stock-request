export interface Product {
  id: string;
  name: string;
  reference: string;
  unit: string;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string;
  items: CartItem[];
  status: 'pending' | 'processed' | 'completed';
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'worker' | 'admin';
}
