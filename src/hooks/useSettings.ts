import { useState, useEffect } from 'react';
import { UserSettings } from '../types/weather';

const STORAGE_KEY = 'ootd_user_settings';

const defaultSettings: UserSettings = {
  coldSensitivity: 'normal',
  activityLevel: 'normal',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as UserSettings;
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  const updateColdSensitivity = (coldSensitivity: UserSettings['coldSensitivity']) => {
    setSettings((prev) => ({ ...prev, coldSensitivity }));
  };

  const updateActivityLevel = (activityLevel: UserSettings['activityLevel']) => {
    setSettings((prev) => ({ ...prev, activityLevel }));
  };

  return {
    settings,
    updateColdSensitivity,
    updateActivityLevel,
  };
}
