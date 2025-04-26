
import { useState, useEffect } from 'react';
import { Order, CartItem } from '@/types';

export const useOrderDetails = (
  order: Order | undefined,
  updateOrder: (order: Order) => void,
  updateOrderStatus: (orderId: string, status: string, message: string) => Promise<void>
) => {
  const [messageText, setMessageText] = useState<string>("");
  const [articles, setArticles] = useState<CartItem[]>([]);

  useEffect(() => {
    if (order) {
      const updatedArticles = order.articles.map(article => ({
        ...article,
        completed: article.completed || false
      }));
      setArticles(updatedArticles);
      setMessageText(order.messagefournisseur || "");
    }
  }, [order]);

  const handleItemCompletionToggle = (index: number) => {
    const updatedArticles = [...articles];
    updatedArticles[index].completed = !updatedArticles[index].completed;
    setArticles(updatedArticles);
    
    updateOrderBasedOnArticles(updatedArticles);
  };

  const updateOrderBasedOnArticles = (updatedArticles: CartItem[]) => {
    if (!order) return;
    
    let newStatus = 'Non';
    
    const allCompleted = updatedArticles.every(article => article.completed);
    const anyCompleted = updatedArticles.some(article => article.completed);
    
    if (allCompleted) {
      newStatus = 'Oui';
    } else if (anyCompleted) {
      newStatus = 'En cours';
    }
    
    const updatedOrder: Order = {
      ...order,
      articles: updatedArticles,
      termine: newStatus
    };
    
    updateOrder(updatedOrder);
    updateOrderStatus(order.commandeid, newStatus, messageText);
  };

  const handleManualStatusChange = async (status: string) => {
    if (!order) return;
    
    const updatedOrder: Order = {
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
    
    const updatedOrder: Order = {
      ...order,
      messagefournisseur: messageText
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(order.commandeid, order.termine, messageText);
  };

  return {
    messageText,
    articles,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage
  };
};

