
import React, { useState } from 'react';
import OrderListItemCompact from '@/components/orders/OrderListItemCompact';
import { PasswordConfirmationDialog } from '@/components/ui/password-confirmation-dialog';
import { Order } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  onOrderClick: (orderId: string) => void;
}

const OrdersList = ({ orders, isLoading, onOrderClick }: OrdersListProps) => {
  const { deleteOrder } = useAppContext();
  const [deleteOrderItem, setDeleteOrderItem] = useState<Order | null>(null);

  const handleDeleteOrder = (order: Order) => {
    setDeleteOrderItem(order);
  };

  const handleConfirmDelete = async () => {
    if (deleteOrderItem) {
      await deleteOrder(deleteOrderItem.commandeid);
      setDeleteOrderItem(null);
    }
  };

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
    <>
      <div className="space-y-4 mb-6">
        {orders.map(order => (
          <OrderListItemCompact
            key={order.commandeid}
            order={order}
            onClick={() => onOrderClick(order.commandeid)}
            onDelete={handleDeleteOrder}
            showDeleteButton={true}
          />
        ))}
      </div>
      
      <PasswordConfirmationDialog
        open={!!deleteOrderItem}
        onOpenChange={(open) => !open && setDeleteOrderItem(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la commande"
        description="Cette action supprimera définitivement cette commande. Cette action est irréversible."
        itemName={deleteOrderItem ? 
          (deleteOrderItem.titre_affichage?.match(/D\d{5}/) 
            ? deleteOrderItem.titre_affichage.match(/D\d{5}/)![0]
            : deleteOrderItem.commandeid
          ) : undefined}
      />
    </>
  );
};

export default OrdersList;
