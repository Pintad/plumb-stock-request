
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Settings, CheckCircle } from 'lucide-react';
import { Order } from '@/types';

interface OrderActionsProps {
  order: Order;
  isAdmin?: boolean;
  onManageOrder?: (order: Order) => void;
  onExportCSV: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

const OrderActions = ({ 
  order, 
  isAdmin = false, 
  onManageOrder, 
  onExportCSV,
  onPrintOrder
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
        </>
      )}
      
      {isAdmin && onManageOrder && (
        <Button 
          variant={order.termine === 'Non' ? "default" : "outline"} 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onManageOrder(order)}
        >
          {order.termine === 'Non' ? (
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
