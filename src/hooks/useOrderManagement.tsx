
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useOrderStatus } from './useOrderStatus';
import { useOrderEmail } from './useOrderEmail';
import { useOrderRealtime } from './useOrderRealtime';
import { useAppContext } from '@/context/AppContext';

export const useOrderManagement = (initialOrder: Order | undefined) => {
  const { loadOrders } = useAppContext();
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  
  // Mettre à jour l'état local lorsque les props changent
  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialOrder]);

  // Subscribe to real-time updates
  useOrderRealtime(order?.commandeid, loadOrders);

  // Import order status management functionality
  const {
    messageText,
    articles,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage
  } = useOrderStatus(order);

  // Import email functionality
  const {
    showEmailConfirm,
    sendingEmail,
    setShowEmailConfirm,
    handleSendEmail
  } = useOrderEmail();

  // Wrap email sending to pass the current order
  const sendEmail = () => {
    handleSendEmail(order);
  };

  return {
    order,
    messageText,
    articles,
    showEmailConfirm,
    sendingEmail,
    setShowEmailConfirm,
    handleItemCompletionToggle,
    handleManualStatusChange,
    handleMessageChange,
    handleSaveMessage,
    handleSendEmail: sendEmail
  };
};
