
import React, { useState } from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import UserOrderActions from './UserOrderActions';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';
import OrderEditModal from './OrderEditModal';

interface OrderListItemCompactProps {
  order: Order;
  onClick: () => void;
}

const OrderListItemCompact = ({ order, onClick }: OrderListItemCompactProps) => {
  const { updateOrder, user } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isUserOrder = user?.name === order.clientname;

  const handleModify = (orderToModify: Order) => {
    event?.stopPropagation();
    if (!isUserOrder) {
      toast({
        variant: "destructive",
        title: "Non autorisé",
        description: "Vous ne pouvez pas modifier cette commande",
      });
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleCancel = async (orderToCancel: Order) => {
    event?.stopPropagation();
    if (!isUserOrder) {
      toast({
        variant: "destructive",
        title: "Non autorisé",
        description: "Vous ne pouvez pas annuler cette commande",
      });
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        const updatedOrder = {
          ...orderToCancel,
          termine: 'Annulée',
        };
        await updateOrder(updatedOrder);
        toast({
          title: "Commande annulée",
          description: "Votre commande a été annulée avec succès",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'annuler la commande",
        });
      }
    }
  };

  return (
    <>
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
          <div className="flex items-center space-x-4">
            <Badge 
              className={`${order.termine === 'Non' ? 'bg-yellow-500' : order.termine === 'En cours' ? 'bg-blue-500' : order.termine === 'Annulée' ? 'bg-red-500' : 'bg-green-500'} text-white`}
            >
              {order.termine === 'Non' ? 'En attente' : 
               order.termine === 'En cours' ? 'En cours' : 
               order.termine === 'Annulée' ? 'Annulée' : 'Terminée'}
            </Badge>
            <div className="flex items-center gap-2">
              {isUserOrder && (
                <UserOrderActions
                  order={order}
                  onModify={handleModify}
                  onCancel={handleCancel}
                />
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <OrderEditModal
        order={order}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default OrderListItemCompact;
