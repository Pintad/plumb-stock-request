
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Settings, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Order } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle, 
  DrawerFooter
} from '@/components/ui/drawer';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface OrderActionsProps {
  order: Order;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onManageOrder?: (order: Order) => void;
  onExportCSV: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

const OrderActions = ({ 
  order, 
  isAdmin = false, 
  isSuperAdmin = false,
  onManageOrder, 
  onExportCSV,
  onPrintOrder
}: OrderActionsProps) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="flex items-center justify-end w-full">
        {(isAdmin || isSuperAdmin) ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => onExportCSV(order)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => onPrintOrder(order)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer PDF
                </Button>
                {onManageOrder && (
                  <Button 
                    variant={order.termine === 'Non' ? "default" : "ghost"} 
                    size="sm" 
                    className="justify-start"
                    onClick={() => onManageOrder(order)}
                  >
                    {order.termine === 'Non' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Gérer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button 
            variant={order.termine === 'Non' ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-1 text-xs px-2 h-7"
            onClick={() => onManageOrder && onManageOrder(order)}
          >
            {order.termine === 'Non' ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Valider
              </>
            ) : (
              <>
                <Settings className="h-3 w-3" />
                Gérer
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {(isAdmin || isSuperAdmin) && (
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
      
      {(isAdmin || isSuperAdmin) && onManageOrder && (
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
