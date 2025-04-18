
import React, { useState } from 'react';
import { Order } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';

interface OrderManagerProps {
  order: Order;
  onClose: () => void;
  isOpen?: boolean;
}

const OrderManager = ({ order, onClose, isOpen = true }: OrderManagerProps) => {
  const { updateOrderStatus } = useAppContext();
  const [message, setMessage] = useState(order.messagefournisseur || '');

  const handleStatusChange = async () => {
    await updateOrderStatus(
      order.commandeid,
      order.termine === 'Non' ? 'Oui' : 'Non',
      message
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gérer la commande #{order.commandeid}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium mb-1">Client</p>
            <p>{order.clientname}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Produit</p>
            <p>{order.produit}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Quantité</p>
            <p>{order.quantite}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Message magasinier</p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleStatusChange}>
              Marquer comme {order.termine === 'Non' ? 'terminé' : 'non terminé'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderManager;
