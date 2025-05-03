
import React from 'react';
import { Order } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderInfoSectionProps {
  order: Order;
}

const OrderInfoSection = ({ order }: OrderInfoSectionProps) => {
  // Format des dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

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
        <p className="text-sm text-muted-foreground">Date de commande</p>
        <p className="font-medium">
          {formatDate(order.datecommande)}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Date de mise à disposition souhaitée</p>
        <p className="font-medium">
          {order.date_mise_a_disposition ? formatDate(order.date_mise_a_disposition) : 'Non spécifiée'}
        </p>
      </div>
    </div>
  );
};

export default OrderInfoSection;
