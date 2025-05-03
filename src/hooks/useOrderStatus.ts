
import { useState } from 'react';
import { Order } from '@/types';
import { useAppContext } from '@/context/AppContext';

export const useOrderStatus = (initialOrder: Order | undefined) => {
  const { updateOrder, updateOrderStatus } = useAppContext();
  const [articles, setArticles] = useState<any[]>(
    initialOrder?.articles.map(article => ({
      ...article,
      completed: article.completed || false
    })) || []
  );
  const [messageText, setMessageText] = useState<string>(initialOrder?.messagefournisseur || "");

  const handleItemCompletionToggle = (index: number) => {
    if (!initialOrder) return;
    
    const updatedArticles = [...articles];
    updatedArticles[index].completed = !updatedArticles[index].completed;
    setArticles(updatedArticles);
    
    updateOrderBasedOnArticles(updatedArticles);
  };

  const updateOrderBasedOnArticles = (updatedArticles: any[]) => {
    if (!initialOrder) return;
    
    let newStatus = 'Non';
    
    const allCompleted = updatedArticles.every(article => article.completed);
    const anyCompleted = updatedArticles.some(article => article.completed);
    
    if (allCompleted) {
      newStatus = 'Oui';
    } else if (anyCompleted) {
      newStatus = 'En cours';
    }
    
    const updatedOrder = {
      ...initialOrder,
      articles: updatedArticles,
      termine: newStatus
    };
    
    updateOrder(updatedOrder);
    updateOrderStatus(initialOrder.commandeid, newStatus, messageText);
  };

  const handleManualStatusChange = async (status: string) => {
    if (!initialOrder) return;
    
    const updatedOrder = {
      ...initialOrder,
      termine: status
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(initialOrder.commandeid, status, messageText);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  const handleSaveMessage = async () => {
    if (!initialOrder) return;
    
    const updatedOrder = {
      ...initialOrder,
      messagefournisseur: messageText
    };
    
    updateOrder(updatedOrder);
    await updateOrderStatus(initialOrder.commandeid, initialOrder.termine, messageText);
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
