
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  isMobile?: boolean;
}

const NotificationSettings = ({ isMobile = false }: NotificationSettingsProps) => {
  const { 
    notificationsEnabled, 
    permission, 
    enableNotifications, 
    disableNotifications,
    isSupported 
  } = useNotifications();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const success = await enableNotifications();
      if (!success) {
        console.warn('Failed to enable notifications');
      }
    } else {
      disableNotifications();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
      {notificationsEnabled ? (
        <Bell className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-500`} />
      ) : (
        <BellOff className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
      )}
      <span className={isMobile ? 'text-xs' : 'text-sm'}>
        Notifications
      </span>
      <Switch
        checked={notificationsEnabled}
        onCheckedChange={handleToggle}
        disabled={permission === 'denied'}
      />
    </div>
  );
};

export default NotificationSettings;
