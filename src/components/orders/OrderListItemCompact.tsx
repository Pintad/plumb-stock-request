
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
  // Extraire uniquement le numéro de commande (format D00001) à partir du displayTitle
  const orderNumber = order.displayTitle ? 
    order.displayTitle.match(/D\d{5}/) ? 
    order.displayTitle.match(/D\d{5}/)![0] : 
    `D${String(order.orderNumber).padStart(5, '0')}` : 
    "[ERREUR: Numéro manquant]";

  // Format de la date avec heure incluse pour plus de précision
  const formattedDate = order.datecommande 
    ? new Date(order.datecommande).toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : '';

  return (
    <Card 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
        <div className="space-y-1.5">
          <CardTitle className="text-base">
            {orderNumber}
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{order.clientname}</span>
            {order.projectCode && order.projectName && (
              <>
                <span>•</span>
                <span className="font-medium">{order.projectCode} - {order.projectName}</span>
              </>
            )}
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
