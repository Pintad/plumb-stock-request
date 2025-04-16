
import { Order, User, CartItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const createOrder = (
  user: User | null, 
  cart: CartItem[], 
  orders: Order[], 
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  clearCart: () => void,
  projectCode?: string
) => {
  if (!user || cart.length === 0) return;
  
  const newOrder: Order = {
    id: `${orders.length + 1}`,
    userId: user.id,
    userName: user.name,
    date: new Date().toISOString().split('T')[0],
    items: [...cart],
    status: 'pending',
    projectCode
  };
  
  setOrders([...orders, newOrder]);
  clearCart();
  
  toast({
    title: "Demande envoyée",
    description: "Votre demande a bien été transmise",
  });
};
