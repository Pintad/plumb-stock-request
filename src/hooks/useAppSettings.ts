import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAppSettings = () => {
  const [smsButtonEnabled, setSmsButtonEnabled] = useState<boolean>(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(true);
  const [senderEmail, setSenderEmail] = useState<string>('magasinier@example.com');
  // Nouveaux paramètres pour les notifications de nouvelles commandes
  const [warehouseNotificationEmailEnabled, setWarehouseNotificationEmailEnabled] = useState<boolean>(false);
  const [warehouseNotificationSmsEnabled, setWarehouseNotificationSmsEnabled] = useState<boolean>(false);
  const [warehouseEmail, setWarehouseEmail] = useState<string>('');
  const [warehousePhone, setWarehousePhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'sms_button_enabled', 
          'email_notifications_enabled', 
          'sender_email',
          'warehouse_notification_email_enabled',
          'warehouse_notification_sms_enabled',
          'warehouse_email',
          'warehouse_phone'
        ]);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading app settings:', error);
        return;
      }

      if (data) {
        data.forEach((setting) => {
          switch (setting.setting_key) {
            case 'sms_button_enabled':
              setSmsButtonEnabled(setting.setting_value === 'true');
              break;
            case 'email_notifications_enabled':
              setEmailNotificationsEnabled(setting.setting_value === 'true');
              break;
            case 'sender_email':
              setSenderEmail(setting.setting_value);
              break;
            case 'warehouse_notification_email_enabled':
              setWarehouseNotificationEmailEnabled(setting.setting_value === 'true');
              break;
            case 'warehouse_notification_sms_enabled':
              setWarehouseNotificationSmsEnabled(setting.setting_value === 'true');
              break;
            case 'warehouse_email':
              setWarehouseEmail(setting.setting_value);
              break;
            case 'warehouse_phone':
              setWarehousePhone(setting.setting_value);
              break;
          }
        });
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
    } catch (error) {
      console.error('Error updating SMS button setting:', error);
      toast.error('Erreur lors de la mise à jour du paramètre SMS');
    }
  };

  const updateEmailNotificationsSetting = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'email_notifications_enabled',
          setting_value: enabled.toString()
        });

      if (error) {
        console.error('Error updating email notifications setting:', error);
        toast.error('Erreur lors de la mise à jour du paramètre email');
        return;
      }

      setEmailNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Error updating email notifications setting:', error);
      toast.error('Erreur lors de la mise à jour du paramètre email');
    }
  };

  const updateSenderEmailSetting = async (email: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'sender_email',
          setting_value: email
        });

      if (error) {
        console.error('Error updating sender email setting:', error);
        toast.error('Erreur lors de la mise à jour de l\'email d\'envoi');
        return;
      }

      setSenderEmail(email);
    } catch (error) {
      console.error('Error updating sender email setting:', error);
      toast.error('Erreur lors de la mise à jour de l\'email d\'envoi');
    }
  };

  const saveAllSettings = async (settings: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    senderEmail: string;
    warehouseNotificationEmailEnabled: boolean;
    warehouseNotificationSmsEnabled: boolean;
    warehouseEmail: string;
    warehousePhone: string;
  }) => {
    try {
      // Sauvegarder chaque paramètre individuellement pour éviter les conflits de clé unique
      const promises = [
        supabase.from('app_settings').upsert({ 
          setting_key: 'sms_button_enabled', 
          setting_value: settings.smsEnabled.toString() 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'email_notifications_enabled', 
          setting_value: settings.emailEnabled.toString() 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'sender_email', 
          setting_value: settings.senderEmail 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'warehouse_notification_email_enabled', 
          setting_value: settings.warehouseNotificationEmailEnabled.toString() 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'warehouse_notification_sms_enabled', 
          setting_value: settings.warehouseNotificationSmsEnabled.toString() 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'warehouse_email', 
          setting_value: settings.warehouseEmail 
        }, { 
          onConflict: 'setting_key' 
        }),
        supabase.from('app_settings').upsert({ 
          setting_key: 'warehouse_phone', 
          setting_value: settings.warehousePhone 
        }, { 
          onConflict: 'setting_key' 
        })
      ];

      const results = await Promise.all(promises);
      
      // Vérifier si une des opérations a échoué
      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      setSmsButtonEnabled(settings.smsEnabled);
      setEmailNotificationsEnabled(settings.emailEnabled);
      setSenderEmail(settings.senderEmail);
      setWarehouseNotificationEmailEnabled(settings.warehouseNotificationEmailEnabled);
      setWarehouseNotificationSmsEnabled(settings.warehouseNotificationSmsEnabled);
      setWarehouseEmail(settings.warehouseEmail);
      setWarehousePhone(settings.warehousePhone);
      toast.success('Configuration sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving all settings:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    smsButtonEnabled,
    emailNotificationsEnabled,
    senderEmail,
    warehouseNotificationEmailEnabled,
    warehouseNotificationSmsEnabled,
    warehouseEmail,
    warehousePhone,
    loading,
    updateSmsButtonSetting,
    updateEmailNotificationsSetting,
    updateSenderEmailSetting,
    saveAllSettings,
    loadSettings
  };
};