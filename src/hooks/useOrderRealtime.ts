
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
    // Réplication désactivée - pas de souscription temps réel
    console.log('Real-time subscription disabled for order details');
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
