
import { useState } from 'react';
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrderEmail = () => {
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async (order: Order | undefined) => {
    if (!order) return;
    setSendingEmail(true);

    try {
      // Get the client email from order.clientname or from database
      let clientEmail = order.clientname;
      
      // Check if the client name is a valid email address
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail)) {
        console.log('Invalid email format, checking database:', clientEmail);
        
        // Try to find a valid email for this user in the database
        const { data: userData, error: userError } = await supabase
          .from('utilisateurs')
          .select('email')
          .eq('nom', clientEmail)
          .single();
        
        if (userError || !userData) {
          console.error('No email found for user:', clientEmail);
          toast({
            title: "Erreur",
            description: "L'email de l'utilisateur n'est pas valide et aucun email n'a été trouvé dans la base de données.",
            variant: "destructive",
          });
          setSendingEmail(false);
          return;
        }
        
        clientEmail = userData.email;
      }
      
      console.log('Sending email to:', clientEmail);

      const response = await supabase.functions.invoke('send-order-ready', {
        body: {
          clientEmail: clientEmail,
          orderNumber: order.orderNumber || order.commandeid
        }
      });

      if (response.error) {
        console.error('Error calling function:', response.error);
        toast({
          title: "Erreur",
          description: `Impossible d'envoyer l'email de notification: ${response.error.message || response.error}`,
          variant: "destructive",
        });
        setSendingEmail(false);
        return;
      }

      // Vérifier si l'email a été envoyé mais a rencontré une limitation de compte gratuit
      if (response.data?.simulated) {
        console.warn('Email simulation (free tier limitation):', response.data);
        toast({
          title: "Email simulé",
          description: "L'email n'a pas été envoyé car votre compte Resend est en version d'essai. Veuillez vérifier un domaine dans les paramètres Resend pour envoyer des emails réels.",
          variant: "destructive",
        });
        setSendingEmail(false);
        return;
      }

      toast({
        title: "Email envoyé",
        description: "Le client a été notifié que sa commande est prête.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer l'email de notification: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    showEmailConfirm,
    sendingEmail,
    setShowEmailConfirm,
    handleSendEmail
  };
};
