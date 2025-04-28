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
import OrderEmailConfirmDialog from '@/components/orders/OrderEmailConfirmDialog';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder, updateOrderStatus, isAdmin } = useAppContext();
  const isMobile = useIsMobile();

  const [order, setOrder] = useState<Order | undefined>(undefined);

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

  const handleSendEmail = async () => {
    if (!order) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', order.clientname)
        .single();

      if (userError) throw userError;

      const response = await supabase.functions.invoke('send-order-ready', {
        body: {
          clientEmail: userData.email,
          orderNumber: order.orderNumber || order.commandeid
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Email envoyé",
        description: "Le client a été notifié que sa commande est prête.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de notification.",
        variant: "destructive",
      });
    }
  };

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
              
              {isAdmin && order.termine === 'Oui' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowEmailConfirm(true)}
                  >
                    <Mail className="h-4 w-4" />
                    Envoyer un mail
                  </Button>
                </div>
              )}

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
              
              <OrderEmailConfirmDialog
                isOpen={showEmailConfirm}
                onOpenChange={setShowEmailConfirm}
                onConfirm={() => {
                  handleSendEmail();
                  setShowEmailConfirm(false);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrderDetails;
