
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useOrderStatus } from './useOrderStatus';
import { useOrderEmail } from './useOrderEmail';
import { useOrderSMS } from './useOrderSMS';
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

  // Subscribe to real-time updates avec la nouvelle gestion optimisée
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

  // Import SMS functionality
  const {
    showSMSConfirm,
    sendingSMS,
    setShowSMSConfirm,
    handleSendSMS
  } = useOrderSMS();

  // Wrap email sending to pass the current order
  const sendEmail = () => {
    handleSendEmail(order);
  };

  // Wrap SMS sending to pass the current order
  const sendSMS = () => {
    handleSendSMS(order);
  };

  return {
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
    handleSendEmail: sendEmail,
    handleSendSMS: sendSMS
  };
};
