
import { useState } from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrderManagement = (initialOrder: Order | undefined) => {
  const { updateOrder, updateOrderStatus } = useAppContext();
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  const [messageText, setMessageText] = useState<string>(initialOrder?.messagefournisseur || "");
  const [articles, setArticles] = useState<any[]>(
    initialOrder?.articles.map(article => ({
      ...article,
      completed: article.completed || false
    })) || []
  );
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const handleItemCompletionToggle = (index: number) => {
    if (!order) return;
    
    const updatedArticles = [...articles];
    updatedArticles[index].completed = !updatedArticles[index].completed;
    setArticles(updatedArticles);
    
    updateOrderBasedOnArticles(updatedArticles);
  };

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

  const handleManualStatusChange = async (status: string) => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      termine: status
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, status, messageText);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  const handleSaveMessage = async () => {
    if (!order) return;
    
    const updatedOrder = {
      ...order,
      messagefournisseur: messageText
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, order.termine, messageText);
  };

  const handleSendEmail = async () => {
    if (!order) return;

    try {
      const clientEmail = order.clientname;
      
      if (!clientEmail) {
        console.error('No email found for user:', order.clientname);
        toast({
          title: "Erreur",
          description: "Aucune adresse email trouvée pour cet utilisateur.",
          variant: "destructive",
        });
        return;
      }

      console.log('Sending email to:', clientEmail);

      const response = await supabase.functions.invoke('send-order-ready', {
        body: {
          clientEmail: clientEmail,
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

  return {
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
  };
};
