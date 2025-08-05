import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAppSettings = () => {
  const [smsButtonEnabled, setSmsButtonEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'sms_button_enabled')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading app settings:', error);
        return;
      }

      if (data) {
        setSmsButtonEnabled(data.setting_value === 'true');
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSmsButtonSetting = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'sms_button_enabled',
          setting_value: enabled.toString()
        });

      if (error) {
        console.error('Error updating SMS button setting:', error);
        toast.error('Erreur lors de la mise à jour du paramètre SMS');
        return;
      }

      setSmsButtonEnabled(enabled);
      toast.success(`Bouton SMS ${enabled ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Error updating SMS button setting:', error);
      toast.error('Erreur lors de la mise à jour du paramètre SMS');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    smsButtonEnabled,
    loading,
    updateSmsButtonSetting,
    loadSettings
  };
};