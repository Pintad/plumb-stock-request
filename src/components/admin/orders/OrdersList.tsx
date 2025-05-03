
import React from 'react';
import OrderListItemCompact from '@/components/orders/OrderListItemCompact';
import { Order } from '@/types';

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  onOrderClick: (orderId: string) => void;
}

const OrdersList = ({ orders, isLoading, onOrderClick }: OrdersListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Aucune commande trouvée
      </p>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {orders.map(order => (
        <OrderListItemCompact
          key={order.commandeid}
          order={order}
          onClick={() => onOrderClick(order.commandeid)}
        />
      ))}
    </div>
  );
};

export default OrdersList;
