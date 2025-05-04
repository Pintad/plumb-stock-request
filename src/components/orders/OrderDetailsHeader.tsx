
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import OrderStatusSection from './OrderStatusSection';

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
      <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'flex-row items-center justify-between space-y-0'} pb-2`}>
        <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold break-words`}>
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
