
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';
import OrderStatusSection from '@/components/orders/OrderStatusSection';
import OrderInfoSection from '@/components/orders/OrderInfoSection';
import OrderArticlesSection from '@/components/orders/OrderArticlesSection';
import MessageSection from '@/components/orders/MessageSection';
import OrderDetailsPrintExport from '@/components/orders/OrderDetailsPrintExport';
import { useIsMobile } from '@/hooks/use-mobile';
import OrderEmailConfirmDialog from '@/components/orders/OrderEmailConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder, updateOrderStatus, isAdmin } = useAppContext();
  const isMobile = useIsMobile();

  // Initialize state variables with explicit types
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [showEmailConfirm, setShowEmailConfirm] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [articles, setArticles] = useState<any[]>([]); // Using any[] to avoid TypeScript depth issue
  
  // Extract order from orders array when component loads or orders change
  useEffect(() => {
    if (orderId) {
      const currentOrder = orders.find(o => o.commandeid === orderId);
      if (currentOrder) {
        setOrder(currentOrder);
        setMessageText(currentOrder.messagefournisseur || "");
        setArticles(currentOrder.articles.map(article => ({
          ...article,
          completed: article.completed || false
        })));
      }
    }
  }, [orderId, orders]);

  // Handle item completion toggle
  const handleItemCompletionToggle = (index: number) => {
    if (!order) return;
    
    const updatedArticles = [...articles];
    updatedArticles[index].completed = !updatedArticles[index].completed;
    setArticles(updatedArticles);
    
    updateOrderBasedOnArticles(updatedArticles);
  };

  // Update order based on article completion status
  const updateOrderBasedOnArticles = (updatedArticles: any[]) => {
    if (!order) return;
    
    let newStatus = 'Non';
    
    const allCompleted = updatedArticles.every(article => article.completed);
    const anyCompleted = updatedArticles.some(article => article.completed);
    
    if (allCompleted) {
      newStatus = 'Oui';
    } else if (anyCompleted) {
      newStatus = 'En cours';
    }
    
    const updatedOrder = {
      ...order,
      articles: updatedArticles,
      termine: newStatus
    };
    
    updateOrder(updatedOrder);
    updateOrderStatus(order.commandeid, newStatus, messageText);
  };

  // Handle manual status change
  const handleManualStatusChange = async (status: string) => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      termine: status
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, status, messageText);
  };

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  // Handle save message
  const handleSaveMessage = async () => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      messagefournisseur: messageText
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, order.termine, messageText);
  };

  // Handle sending email notification
  const handleSendEmail = async () => {
    if (!order) return;

    try {
      // Fetch user email from profiles table using maybeSingle instead of single
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', order.clientname)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast({
          title: "Erreur",
          description: "Impossible de trouver l'email de l'utilisateur.",
          variant: "destructive",
        });
        return;
      }

      if (!userData || !userData.email) {
        console.error('No email found for user:', order.clientname);
        toast({
          title: "Erreur",
          description: "Aucune adresse email trouvée pour cet utilisateur.",
          variant: "destructive",
        });
        return;
      }

      // Call the Supabase Edge Function to send the email
      const response = await supabase.functions.invoke('send-order-ready', {
        body: {
          clientEmail: userData.email,
          orderNumber: order.orderNumber || order.commandeid
        }
      });

      if (response.error) {
        console.error('Error calling function:', response.error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'email de notification.",
          variant: "destructive",
        });
        return;
      }

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
