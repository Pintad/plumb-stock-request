
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('notifications-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const enableNotifications = async (): Promise<boolean> => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      setNotificationsEnabled(true);
      localStorage.setItem('notifications-enabled', 'true');
      return true;
    }
    return false;
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    localStorage.setItem('notifications-enabled', 'false');
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationsEnabled && permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  return {
    notificationsEnabled,
    permission,
    enableNotifications,
    disableNotifications,
    showNotification,
    isSupported: 'Notification' in window
  };
};
