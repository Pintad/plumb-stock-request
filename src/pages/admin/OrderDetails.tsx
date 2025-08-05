
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, MessageSquare } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import OrderArticlesSection from '@/components/orders/OrderArticlesSection';
import MessageSection from '@/components/orders/MessageSection';
import OrderDetailsPrintExport from '@/components/orders/OrderDetailsPrintExport';
import OrderEmailConfirmDialog from '@/components/orders/OrderEmailConfirmDialog';
import OrderSMSConfirmDialog from '@/components/orders/OrderSMSConfirmDialog';
import OrderDetailsHeader from '@/components/orders/OrderDetailsHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { useOrderRealtime } from '@/hooks/useOrderRealtime';
import { useAppSettingsContext } from '@/context/AppSettingsContext';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, isAdmin, loadOrders } = useAppContext();
  const { smsButtonEnabled } = useAppSettingsContext();
  const isMobile = useIsMobile();
  
  const initialOrder = orderId ? orders.find(o => o.commandeid === orderId) : undefined;
  const {
    order,
    messageText,
    articles,
    showEmailConfirm,
    sendingEmail,
    setShowEmailConfirm,
    showSMSConfirm,
    sendingSMS,
    setShowSMSConfirm,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage,
    handleSendEmail,
    handleSendSMS
  } = useOrderManagement(initialOrder);
  
  // Subscribe to real-time updates for the current order
  useOrderRealtime(orderId, loadOrders);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
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
          <CardHeader className={isMobile ? 'px-3 py-3' : ''}>
            <OrderDetailsHeader
              order={order}
              isAdmin={isAdmin}
              isMobile={isMobile}
              onNavigateBack={() => navigate('/admin/orders')}
              onStatusChange={handleManualStatusChange}
            />
          </CardHeader>
          <CardContent className={isMobile ? 'px-3' : ''}>
            <div className="space-y-4">
              <OrderInfoSection order={order} />
              
              {isAdmin && order.termine === 'Oui' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowEmailConfirm(true)}
                    disabled={sendingEmail}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Mail className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                    {sendingEmail ? "Envoi en cours..." : "Envoyer un mail"}
                  </Button>
                  {smsButtonEnabled && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setShowSMSConfirm(true)}
                      disabled={sendingSMS}
                      size={isMobile ? "sm" : "default"}
                    >
                      <MessageSquare className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                      {sendingSMS ? "Envoi en cours..." : "Envoyer un SMS"}
                    </Button>
                  )}
                </div>
              )}

              <OrderArticlesSection 
                articles={articles}
                isAdmin={isAdmin}
                onItemCompletionToggle={handleItemCompletionToggle}
                isMobile={isMobile}
              />

              {isAdmin && (
                <MessageSection 
                  message={messageText}
                  onChange={handleMessageChange}
                  onSave={handleSaveMessage}
                  isMobile={isMobile}
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
              
              <OrderSMSConfirmDialog
                isOpen={showSMSConfirm}
                onOpenChange={setShowSMSConfirm}
                onConfirm={() => {
                  handleSendSMS();
                  setShowSMSConfirm(false);
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
