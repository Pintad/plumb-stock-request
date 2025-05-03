
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderRealtime = (orderId: string | undefined, onUpdate: () => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Nettoyer toute souscription précédente
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Créer une nouvelle souscription
    channelRef.current = supabase
      .channel(`order-detail-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commandes',
          filter: `commandeid=eq.${orderId}`
        },
        () => {
          // Recharger les commandes quand des changements sont détectés
          onUpdate();
        }
      )
      .subscribe();

    // Nettoyage lors du démontage ou changement d'ID de commande
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId, onUpdate]);

  return null;
};
