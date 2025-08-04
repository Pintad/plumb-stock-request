import { useState } from 'react';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrderSMS = () => {
  const [showSMSConfirm, setShowSMSConfirm] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);

  const handleSendSMS = async (order: Order | undefined) => {
    if (!order) return;
    setSendingSMS(true);

    try {
      // Get the client phone number from database
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('numero')
        .eq('nom', order.clientname)
        .single();
      
      if (userError || !userData || !userData.numero) {
        console.error('No phone number found for user:', order.clientname);
        toast({
          title: "Erreur",
          description: "Aucun numéro de téléphone trouvé pour cet utilisateur.",
          variant: "destructive",
        });
        setSendingSMS(false);
        return;
      }
      
      const phoneNumber = userData.numero;
      const message = `Bonjour, votre commande ${order.orderNumber || order.commandeid} est prête à être retirée !`;
      
      console.log('Sending SMS to:', phoneNumber);

      const response = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber: phoneNumber,
          message: message,
          orderNumber: order.orderNumber || order.commandeid
        }
      });

      if (response.error) {
        console.error('Error calling SMS function:', response.error);
        toast({
          title: "Erreur",
          description: `Impossible d'envoyer le SMS: ${response.error.message || response.error}`,
          variant: "destructive",
        });
        setSendingSMS(false);
        return;
      }

      toast({
        title: "SMS envoyé",
        description: "Le client a été notifié par SMS que sa commande est prête.",
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer le SMS: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setSendingSMS(false);
    }
  };

  return {
    showSMSConfirm,
    sendingSMS,
    setShowSMSConfirm,
    handleSendSMS
  };
};