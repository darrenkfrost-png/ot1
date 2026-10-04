import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MotionConfig } from 'motion/react';

type WallpaperType = 'none' | 'fluid' | 'hyperspace' | 'network' | 'waves' | 'grid' | 'matrix' | 'rain' | 'circuit' | 'aurora' | 'particles' | 'constellation' | 'orbs' | 'ripple' | 'polyrhythm' | 'dna' | 'polymetric' | 'static-image' | 'video';

interface Settings {
  // Theme & Wallpaper
  activeWallpaper: WallpaperType;
  staticWallpaper?: string;
  videoWallpaper?: string;
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
  /** The listen chip: rest on a passage, press, hear it. Browser voice, free. */
  readAloudEnabled: boolean;
  readAloudRate: number;
  /** Colour of the aura around the passage under the cursor or finger. */
  readingAuraColor: string;
  /** Quiet seconds before the idle screen appears. */
  screensaverDelaySeconds: number;
  hapticFeedback: boolean;
  screenReaderOptimized: boolean;
  autoSaveDrafts: boolean;
  
  // App Behavior
  enableNotifications: boolean;
  notificationSound: boolean;
  notificationDuration: number;
  showLogoCycling: boolean;
  showClinicalStats: boolean;
  dashboardLayout: 'grid' | 'list' | 'dense';
  colorAccent: string;
  enableVoiceWake: boolean;
  /**
   * "Clean View": swaps the round floating settings button for a small
   * 'Settings' tab in the same corner, so less sits over the page. The tab is
   * the way back (SettingsPanel renders it while this is on), because a clean
   * view that cannot be undone is a trap rather than a feature. The microphone
   * and assistant this once also hid no longer exist.
   */
  hideOverlays: boolean;
  /** Look of the header, sidebar and the ground behind them. */
  appTheme:
    | 'clinical'
    | 'midnight'
    | 'sand'
    | 'contrast'
    | 'ocean'
    | 'forest'
    | 'graphite'
    | 'blush'
    | 'ice';
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
  activeWallpaper: 'video',
  videoWallpaper: 'emblem-close',
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
  readAloudEnabled: true,
  readAloudRate: 1,
  readingAuraColor: '#f5b301',
  screensaverDelaySeconds: 60,
  hapticFeedback: true,
  screenReaderOptimized: false,
  autoSaveDrafts: true,
  enableNotifications: true,
  notificationSound: true,
  notificationDuration: 5000,
  showLogoCycling: true,
  showClinicalStats: true,
  dashboardLayout: 'grid',
  colorAccent: '#14b8a6',
  enableVoiceWake: false,
  hideOverlays: false,
  appTheme: 'clinical',
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
      // Storage blocked (a browser set to refuse site data throws on the mere
      // touch of localStorage) or unreadable: start from the defaults.
      console.warn("Saved settings could not be read; using the defaults", e);
      return defaultSettings;
    }
  });

  useEffect(() => {
     /*
      * SAVING MUST NEVER TAKE THE SITE DOWN. In a browser that blocks site
      * data, touching localStorage throws a SecurityError; unguarded, it threw
      * inside this effect and the error screen replaced every page for those
      * visitors. Now the settings simply last for this visit.
      *
      * Only what the visitor has actually changed is stored, and nothing at
      * all until they change something - a first-time visitor who never opens
      * Settings leaves no 'ct6-settings' entry on their device. Reading merges
      * over the defaults, so a partial entry reads back exactly the same.
      */
     try {
       const changed = Object.fromEntries(
         Object.entries(settings).filter(
           ([key, value]) => value !== (defaultSettings as unknown as Record<string, unknown>)[key]
         )
       );
       if (Object.keys(changed).length > 0) {
         localStorage.setItem('ct6-settings', JSON.stringify(changed));
       } else {
         localStorage.removeItem('ct6-settings');
       }
     } catch {
       /* Storage blocked or full: settings last for this visit only. */
     }

     // Apply some global styles based on settings if needed
     if (settings.highContrastMode) {
         document.documentElement.classList.add('high-contrast');
     } else {
         document.documentElement.classList.remove('high-contrast');
     }
     
     // The panel theme drives CSS variables from a single attribute on <html>,
     // so every surface changes together rather than each component deciding.
     document.documentElement.setAttribute('data-app-theme', settings.appTheme);

     /*
      * "Card glow" and "Grid pattern" in Settings > Visual Engine. Both are
      * decoration only - the glow round the glass cards and the fine grid
      * behind some panels - so no colour under any text changes and the
      * measured contrast cannot move. The rules that read these attributes
      * sit with the controls in SettingsPanel.
      */
     document.documentElement.dataset.cardStyle = settings.cardStyle;
     document.documentElement.dataset.uiIntensity = settings.uiIntensity;

     // Set body background to wallpaper color to avoid white flashes and support transparent themes
     document.body.style.backgroundColor = settings.activeWallpaper === 'none' ? '#f8fafc' : 'var(--app-bg)';
     document.documentElement.style.setProperty('--color-accent-dynamic', settings.colorAccent);

     /*
      * The two accessibility settings that do real work. Text size scales the
      * root em so every rem-sized thing follows; reduced motion sets a class
      * the stylesheet uses to stop animation for people who need stillness.
      * Both existed as switches before, wired to storage and nothing else.
      */
     document.documentElement.style.fontSize = `${Math.round((settings.fontSizeMultiplier || 1) * 100)}%`;
     document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);

     /* The reading aura takes its colour from here, so the stylesheet needs to
      * know only the name of the variable, never which colour anyone chose. */
     document.documentElement.style.setProperty('--reading-aura', settings.readingAuraColor || '#f5b301');
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
     setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
      setSettings(defaultSettings);
  };

  /*
   * The page and card animations are motion's JavaScript, which a CSS class
   * cannot stop. Either switch - "Page movement and film" off, or "Reduce
   * movement" on - tells every motion component beneath to drop its sliding
   * and scaling; otherwise the visitor's own device setting decides.
   */
  const stillPages = !settings.animationsEnabled || settings.reduceMotion;

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      <MotionConfig reducedMotion={stillPages ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
