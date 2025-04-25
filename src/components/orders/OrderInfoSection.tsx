
import React from 'react';
import { Order } from '@/types';

interface OrderInfoSectionProps {
  order: Order;
}

const OrderInfoSection = ({ order }: OrderInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Client</p>
        <p className="font-medium">{order.clientname}</p>
      </div>
      
      {order.projectCode && (
        <div>
          <p className="text-sm text-muted-foreground">Affaire</p>
          <p className="font-medium">{order.projectCode}</p>
        </div>
      )}
      
      <div>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="font-medium">
          {order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : 'Non définie'}
        </p>
      </div>
    </div>
  );
};

export default OrderInfoSection;
