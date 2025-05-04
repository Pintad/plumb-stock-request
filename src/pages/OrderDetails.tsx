
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import OrderDetailsReadOnly from '@/components/orders/OrderDetailsReadOnly';
import { useIsMobile } from '@/hooks/use-mobile';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders } = useAppContext();
  const isMobile = useIsMobile();
  
  const order = orders.find(o => o.commandeid === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
          <p className="text-center text-gray-500">Commande non trouvée</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <OrderDetailsReadOnly 
        order={order} 
        backUrl="/my-orders" 
        isMobile={isMobile} 
      />
    </div>
  );
};

export default OrderDetails;
