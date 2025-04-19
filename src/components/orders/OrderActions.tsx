
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Settings, Archive, CheckCircle } from 'lucide-react';
import { Order } from '@/types';

interface OrderActionsProps {
  order: Order;
  isAdmin?: boolean;
  onManageOrder?: (order: Order) => void;
  onExportCSV: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onArchiveOrder?: (order: Order) => void;
}

const OrderActions = ({ 
  order, 
  isAdmin = false, 
  onManageOrder, 
  onExportCSV,
  onPrintOrder,
  onArchiveOrder 
}: OrderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onExportCSV(order)}
          >
            <FileDown className="h-4 w-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onPrintOrder(order)}
          >
            <Printer className="h-4 w-4" />
            PDF
          </Button>
          {order.terme === 'Oui' && !order.archived && onArchiveOrder && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => onArchiveOrder(order)}
            >
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          )}
        </>
      )}
      
      {isAdmin && onManageOrder && (
        <Button 
          variant={order.terme === 'Non' ? "default" : "outline"} 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onManageOrder(order)}
        >
          {order.terme === 'Non' ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Valider
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Gérer
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default OrderActions;
