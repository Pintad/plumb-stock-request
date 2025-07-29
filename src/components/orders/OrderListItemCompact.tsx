
import React from 'react';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderListItemCompactProps {
  order: Order;
  onClick: () => void;
  onDelete?: (order: Order) => void;
  showDeleteButton?: boolean;
}

const OrderListItemCompact = ({ order, onClick, onDelete, showDeleteButton = false }: OrderListItemCompactProps) => {
  const isMobile = useIsMobile();
  
  // Always use the display title from the titre_affichage field without any fallbacks
  // If it's missing, show a clear error message
  const orderDisplayTitle = order.titre_affichage || "[ERREUR: Titre manquant]";
  
  // Extract the order number pattern (D00001) from the display title if possible
  const orderNumber = orderDisplayTitle.match(/D\d{5}/) 
    ? orderDisplayTitle.match(/D\d{5}/)![0]
    : "[ERREUR: Numéro manquant]";

  // Format de la date SANS l'heure
  const formattedDate = order.datecommande 
    ? new Date(order.datecommande).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      }) 
    : '';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(order);
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'py-3 px-4' : 'py-4'}`}>
        <div className="space-y-1.5">
          <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'}`}>
            {orderNumber}
          </CardTitle>
          <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex items-center space-x-2'} text-sm text-muted-foreground`}>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{formattedDate}</span>
            
            {isMobile ? (
              <div className="flex items-center space-x-1 text-xs">
                <span>{order.clientname}</span>
                {order.projectCode && (
                  <span className="font-medium truncate max-w-[140px]">{order.projectCode}</span>
                )}
              </div>
            ) : (
              <>
                <span>•</span>
                <span>{order.clientname}</span>
                {order.projectCode && order.projectName && (
                  <>
                    <span>•</span>
                    <span className="font-medium">{order.projectCode} - {order.projectName}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            className={`${order.termine === 'Non' ? 'bg-yellow-500' : order.termine === 'En cours' ? 'bg-blue-500' : 'bg-green-500'} text-white ${isMobile ? 'text-xs px-1.5 py-0.5' : ''}`}
          >
            {order.termine === 'Non' ? 'En attente' : order.termine === 'En cours' ? 'En cours' : 'Terminée'}
          </Badge>
          {showDeleteButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
    </Card>
  );
};

export default OrderListItemCompact;
