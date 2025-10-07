import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { NotificationSettings } from '../types';

const SETTINGS_KEY = 'commitly-settings';

const defaultSettings: NotificationSettings = {
    friendActivity: true,
    motivations: true,
    dailyChallenges: true,
    sessionReminders: true,
};

interface SettingsContextType {
    settings: NotificationSettings;
    updateSettings: (newSettings: NotificationSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<NotificationSettings>(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                // Merge stored settings with defaults to handle cases where new settings are added
                return { ...defaultSettings, ...JSON.parse(storedSettings) };
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
        }
        return defaultSettings;
    });

    const updateSettings = (newSettings: NotificationSettings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
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
