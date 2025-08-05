import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';

export const useOrderSMS = () => {
  const [sendingSMS, setSendingSMS] = useState(false);
  const [showSMSConfirm, setShowSMSConfirm] = useState(false);
  const { toast } = useToast();

  const handleSendSMS = async (order: Order) => {
    if (!order) return;

    try {
      setSendingSMS(true);

      // Récupérer le numéro de téléphone de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('numero')
        .eq('nom', order.clientname)
        .single();

      if (userError || !userData?.numero) {
        toast({
          title: "Erreur",
          description: "Numéro de téléphone non trouvé pour ce client",
          variant: "destructive",
        });
        return;
      }

      const message = `Bonjour, votre commande ${order.titre_affichage} est prete au magasin ! vous pouvez passer la chercher ou prendre contact avec votre conducteur de travaux pour qu'il vous la dépose à son prochain passage.`;

      // Appeler l'edge function send-sms avec la clé 'numero' (pas 'to')
      const { error: smsError } = await supabase.functions.invoke('send-sms', {
        body: {
          numero: userData.numero,
          message: message
        }
      });

      if (smsError) {
        console.error('Erreur SMS:', smsError);
        toast({
          title: "Erreur",
          description: "Échec de l'envoi du SMS",
          variant: "destructive",
        });
      } else {
        toast({
          title: "SMS envoyé",
          description: "Le SMS a été envoyé avec succès",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du SMS",
        variant: "destructive",
      });
    } finally {
      setSendingSMS(false);
    }
  };

  return {
    sendingSMS,
    showSMSConfirm,
    setShowSMSConfirm,
    handleSendSMS
  };
};
