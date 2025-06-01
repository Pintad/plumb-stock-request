
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';

export const useOrderNotifications = () => {
  const { showNotification, notificationsEnabled } = useNotifications();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!notificationsEnabled) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new subscription for order insertions
    channelRef.current = supabase
      .channel('new-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commandes'
        },
        (payload) => {
          console.log('New order detected:', payload);
          
          const newOrder = payload.new;
          const orderNumber = newOrder.titre_affichage?.match(/D\d{5}/)?.[0] || 'Nouvelle commande';
          const clientName = newOrder.clientname || 'Client inconnu';
          
          showNotification(`🔔 ${orderNumber}`, {
            body: `Nouvelle commande de ${clientName}`,
            tag: 'new-order',
            requireInteraction: false,
            silent: false
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [notificationsEnabled, showNotification]);

  return null;
};
