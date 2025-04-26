
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import OrderStatusSection from '@/components/orders/OrderStatusSection';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import OrderArticlesSection from '@/components/orders/OrderArticlesSection';
import MessageSection from '@/components/orders/MessageSection';
import OrderDetailsPrintExport from '@/components/orders/OrderDetailsPrintExport';
import { useOrderDetails } from '@/hooks/useOrderDetails';
import { useIsMobile } from '@/hooks/use-mobile';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder, updateOrderStatus, isAdmin } = useAppContext();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<Order | undefined>(
    orders.find(o => o.commandeid === orderId)
  );

  useEffect(() => {
    const currentOrder = orders.find(o => o.commandeid === orderId);
    if (currentOrder) {
      setOrder(currentOrder);
    }
  }, [orderId, orders]);

  const {
    messageText,
    articles,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage
  } = useOrderDetails(order, updateOrder, updateOrderStatus);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 container px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/orders')}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <p>Commande non trouvée</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className={`flex-1 container ${isMobile ? 'px-2' : 'px-4'} py-6`}>
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className={`flex flex-col ${isMobile ? 'space-y-4' : 'flex-row items-center justify-between space-y-0'} pb-2`}>
            <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold break-words`}>
              {order.displayTitle || `Commande #${order.commandeid}`}
            </CardTitle>
            <OrderStatusSection 
              status={order.termine}
              isAdmin={isAdmin}
              onStatusChange={handleManualStatusChange}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OrderInfoSection order={order} />
              
              <OrderArticlesSection 
                articles={articles}
                isAdmin={isAdmin}
                onItemCompletionToggle={handleItemCompletionToggle}
              />

              {isAdmin && (
                <MessageSection 
                  message={messageText}
                  onChange={handleMessageChange}
                  onSave={handleSaveMessage}
                />
              )}

              <OrderDetailsPrintExport order={order} isMobile={isMobile} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetails;

