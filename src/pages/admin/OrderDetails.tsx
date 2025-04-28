
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import OrderArticlesSection from '@/components/orders/OrderArticlesSection';
import MessageSection from '@/components/orders/MessageSection';
import OrderDetailsPrintExport from '@/components/orders/OrderDetailsPrintExport';
import OrderEmailConfirmDialog from '@/components/orders/OrderEmailConfirmDialog';
import OrderDetailsHeader from '@/components/orders/OrderDetailsHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrderManagement } from '@/hooks/useOrderManagement';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, isAdmin } = useAppContext();
  const isMobile = useIsMobile();
  
  const initialOrder = orderId ? orders.find(o => o.commandeid === orderId) : undefined;
  const {
    order,
    messageText,
    articles,
    showEmailConfirm,
    setShowEmailConfirm,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage,
    handleSendEmail
  } = useOrderManagement(initialOrder);

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
        <Card className="mb-6">
          <CardHeader>
            <OrderDetailsHeader
              order={order}
              isAdmin={isAdmin}
              isMobile={isMobile}
              onNavigateBack={() => navigate('/admin/orders')}
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
