
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserActivity } from './useUserActivity';

export const useOrderRealtime = (orderId: string | undefined, onUpdate: () => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { isActive } = useUserActivity({ timeout: 3 * 60 * 1000 }); // 3 minutes pour les détails
  const onUpdateRef = useRef(onUpdate);

  // Mettre à jour la référence du callback
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!orderId) return;
    
    if (isActive) {
      // Utilisateur actif - établir la connexion temps réel
      setupSubscription();
    } else {
      // Utilisateur inactif - nettoyer la connexion
      cleanupSubscription();
    }

    return cleanupSubscription;
  }, [orderId, isActive]);

  const setupSubscription = () => {
    if (!orderId) return;
    
    // Nettoyer toute souscription précédente
    cleanupSubscription();

    // Créer une nouvelle souscription avec identifiant unique
    channelRef.current = supabase
      .channel(`order-detail-${orderId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commandes',
          filter: `commandeid=eq.${orderId}`
        },
        (payload) => {
          console.log('Order detail real-time update:', payload.eventType);
          // Utiliser la référence pour éviter les dépendances stale
          onUpdateRef.current();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Order detail subscription established for ${orderId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Order detail subscription error for ${orderId}`);
        }
      });
  };

  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('Cleaning up order detail subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return null;
};
