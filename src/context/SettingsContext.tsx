import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type WallpaperType = 'none' | 'fluid' | 'hyperspace' | 'network' | 'waves' | 'grid' | 'matrix' | 'rain' | 'circuit' | 'aurora' | 'particles' | 'constellation' | 'orbs' | 'ripple' | 'polyrhythm' | 'dna' | 'polymetric' | 'static-image';

interface Settings {
  // Theme & Wallpaper
  activeWallpaper: WallpaperType;
  staticWallpaper?: string;
  wallpaperColor: string;
  wallpaperSpeed: number;
  wallpaperBrightness: number;
  wallpaperQuality: 'low' | 'balanced' | 'ultra';
  
  // Visual & UI
  uiIntensity: 'high' | 'medium' | 'minimal';
  themeMode: 'system' | 'light' | 'dark';
  animationsEnabled: boolean;
  blurEffects: boolean;
  cardStyle: 'glass' | 'solid' | 'minimal';
  
  // AI & Voice
  aiAssistantPersona: 'clinical' | 'friendly' | 'direct';
  aiVoiceSpeed: number;
  aiVoicePitch: number;
  aiPredictiveSuggestions: boolean;
  aiAutoSpeak: boolean;
  aiConfidenceThreshold: number;
  aiResponseDetail: 'concise' | 'standard' | 'verbose';
  
  // Accessibility & UX
  fontSizeMultiplier: number;
  highContrastMode: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  screenReaderOptimized: boolean;
  autoSaveDrafts: boolean;
  
  // App Behavior
  enableNotifications: boolean;
  notificationSound: boolean;
  notificationDuration: number;
  showLogoCycling: boolean;
  clinicLocationPreference: 'all' | 'canterbury' | 'herne-bay';
  showClinicalStats: boolean;
  dashboardLayout: 'grid' | 'list' | 'dense';
  colorAccent: string;
  enableVoiceWake: boolean;
  holographicEffects: boolean;
  parallaxEnabled: boolean;
  experimentalFeatures: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  activeWallpaper: 'polymetric',
  wallpaperColor: '#14b8a6', // Teal
  wallpaperSpeed: 1,
  wallpaperBrightness: 1,
  wallpaperQuality: 'balanced',
  uiIntensity: 'high',
  themeMode: 'system',
  animationsEnabled: true,
  blurEffects: true,
  cardStyle: 'glass',
  aiAssistantPersona: 'clinical',
  aiVoiceSpeed: 1,
  aiVoicePitch: 1,
  aiPredictiveSuggestions: true,
  aiAutoSpeak: true,
  aiConfidenceThreshold: 0.85,
  aiResponseDetail: 'standard',
  fontSizeMultiplier: 1,
  highContrastMode: false,
  reduceMotion: false,
  hapticFeedback: true,
  screenReaderOptimized: false,
  autoSaveDrafts: true,
  enableNotifications: true,
  notificationSound: true,
  notificationDuration: 5000,
  showLogoCycling: true,
  clinicLocationPreference: 'all',
  showClinicalStats: true,
  dashboardLayout: 'grid',
  colorAccent: '#14b8a6',
  enableVoiceWake: false,
  holographicEffects: true,
  parallaxEnabled: true,
  experimentalFeatures: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('ct6-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      console.error("Failed to parse settings", e);
      return defaultSettings;
    }
  });

  useEffect(() => {
     localStorage.setItem('ct6-settings', JSON.stringify(settings));
     // Apply some global styles based on settings if needed
     if (settings.highContrastMode) {
         document.documentElement.classList.add('high-contrast');
     } else {
         document.documentElement.classList.remove('high-contrast');
     }
     
     // Set body background to wallpaper color to avoid white flashes and support transparent themes
     document.body.style.backgroundColor = settings.activeWallpaper === 'none' ? '#f8fafc' : '#0f172a'; // slate-50 or slate-900
     document.documentElement.style.setProperty('--color-accent-dynamic', settings.colorAccent);
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
     setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
      setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
