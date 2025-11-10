
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../api';
import type { SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await api.getSiteSettings();
        setSettings(siteSettings);
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    try {
        const updatedSettings = await api.updateSiteSettings(newSettings);
        setSettings(updatedSettings);
    } catch(error) {
        console.error("Failed to update settings:", error);
        throw error; // Re-throw to be caught in the admin panel
    }
  };


  const value = {
    settings,
    isLoading,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {!isLoading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};