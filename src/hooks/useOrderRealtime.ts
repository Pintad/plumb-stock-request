
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderRealtime = (orderId: string | undefined, onUpdate: () => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    if (!orderId) return;
    
    // Fonction pour créer et configurer un canal
    const setupChannel = () => {
      // Nettoyer toute souscription précédente
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Créer une nouvelle souscription
      channelRef.current = supabase
        .channel(`order-detail-${orderId}-${Date.now()}`) // Identifiant unique pour éviter les conflits
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
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' && reconnectAttemptsRef.current < maxReconnectAttempts) {
            // En cas d'erreur, tentative de reconnexion
            reconnectAttemptsRef.current++;
            
            // Attendre un peu avant de tenter de se reconnecter (délai exponentiel)
            const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
            setTimeout(setupChannel, delay);
          }
        });
    };

    // Configuration initiale du canal
    setupChannel();
    
    // Nettoyage lors du démontage ou changement d'ID de commande
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
    };
  }, [orderId, onUpdate]);

  return null;
};
