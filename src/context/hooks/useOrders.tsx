
import { useState } from 'react';
import { Order, User, CartItem } from '../../types';
import { demoOrders } from '@/data/demoData';

export const useOrders = (initialOrders: Order[] = demoOrders) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const createOrder = (
    user: User | null,
    cart: CartItem[],
    clearCart: () => void,
    projectCode?: string
  ): Order | undefined => {
    if (!user || cart.length === 0) return undefined;
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString(),
      items: [...cart],
      status: 'pending',
      projectCode
    };
    
    setOrders([...orders, newOrder]);
    clearCart();
    
    return newOrder;
  };

  const updateOrder = (order: Order) => {
    setOrders(orders.map(o => o.id === order.id ? order : o));
  };

  const archiveOrder = async (orderId: string): Promise<boolean> => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      
      if (!orderToUpdate) {
        return false;
      }
      
      const updatedOrder = { ...orderToUpdate, archived: true };
      updateOrder(updatedOrder);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'archivage de la commande:", error);
      return false;
    }
  };

  return {
    orders,
    createOrder,
    updateOrder,
    archiveOrder
  };
};
