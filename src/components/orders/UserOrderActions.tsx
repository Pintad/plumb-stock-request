
import React from 'react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

interface UserOrderActionsProps {
  order: Order;
  onModify: (order: Order) => void;
  onCancel: (order: Order) => void;
}

const UserOrderActions = ({ order, onModify, onCancel }: UserOrderActionsProps) => {
  // Seules les commandes "en attente" peuvent être modifiées ou annulées
  const canModify = order.termine === 'Non';

  if (!canModify) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onModify(order)}
      >
        <Edit className="h-4 w-4" />
        Modifier
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onCancel(order)}
      >
        <Trash2 className="h-4 w-4" />
        Annuler
      </Button>
    </div>
  );
};

export default UserOrderActions;
