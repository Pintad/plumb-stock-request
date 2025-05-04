
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import OrderStatusSection from './OrderStatusSection';
import { 
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';

interface OrderDetailsHeaderProps {
  order: Order;
  isAdmin: boolean;
  isMobile: boolean;
  onNavigateBack: () => void;
  onStatusChange: (status: string) => void;
}

const OrderDetailsHeader = ({
  order,
  isAdmin,
  isMobile,
  onNavigateBack,
  onStatusChange
}: OrderDetailsHeaderProps) => {
  // Use only the stored display title without fallback
  const displayTitle = order.titre_affichage || "[ERREUR: Titre manquant]";

  if (isMobile) {
    return (
      <>
        <div className="flex items-center space-x-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onNavigateBack}
            className="p-1 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Button>
          <CardTitle className="text-base font-bold truncate flex-1">
            {displayTitle}
          </CardTitle>
          
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                État
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Changer l'état de la commande</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <OrderStatusSection 
                  status={order.termine}
                  isAdmin={isAdmin}
                  onStatusChange={onStatusChange}
                />
              </div>
              <DrawerFooter>
                <Button variant="outline" size="sm" onClick={() => {}} className="w-full">
                  Fermer
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onNavigateBack}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold break-words">
          {displayTitle}
        </CardTitle>
        <OrderStatusSection 
          status={order.termine}
          isAdmin={isAdmin}
          onStatusChange={onStatusChange}
        />
      </div>
    </>
  );
};

export default OrderDetailsHeader;
