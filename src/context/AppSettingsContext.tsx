import React, { createContext, useContext } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

interface AppSettingsContextType {
  smsButtonEnabled: boolean;
  loading: boolean;
  updateSmsButtonSetting: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appSettings = useAppSettings();

  return (
    <AppSettingsContext.Provider value={appSettings}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettingsContext = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettingsContext must be used within an AppSettingsProvider');
  }
  return context;
};