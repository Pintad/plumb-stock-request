
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
  // Construct display title with project information and user name
  // Pour les anciens ordres: orderNumber est sans le D et zero-padding à 4
  // Pour les nouveaux ordres: orderNumber est global et zero-padding à 5
  const displayTitle = order.displayTitle || 
    (order.projectCode && order.projectName 
      ? `${order.projectCode} - ${order.projectName} - ${order.clientname} - ${order.orderNumber ? `D${String(order.orderNumber).padStart(5, '0')}` : ''}`
      : `Demande #${order.commandeid.substring(0, 8)}`);

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
