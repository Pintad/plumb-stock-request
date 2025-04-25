
import React from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface OrderListItemCompactProps {
  order: Order;
  onClick: () => void;
}

const OrderListItemCompact = ({ order, onClick }: OrderListItemCompactProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <div className="space-y-1.5">
          <CardTitle className="text-base">
            {order.displayTitle || `Commande #${order.commandeid}`}
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{order.datecommande ? new Date(order.datecommande).toLocaleDateString('fr-FR') : ''}</span>
            <span>•</span>
            <span>{order.clientname}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={`${order.termine === 'Non' ? 'bg-yellow-500' : order.termine === 'En cours' ? 'bg-blue-500' : 'bg-green-500'} text-white`}
          >
            {order.termine === 'Non' ? 'En attente' : order.termine === 'En cours' ? 'En cours' : 'Terminée'}
          </Badge>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default OrderListItemCompact;
