import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { useToast } from '../components/ToastSystem';
import { useNavigate } from 'react-router-dom';

export interface Command {
  id: string;
  label: string;
  description: string;
  category: 'navigation' | 'settings' | 'wallpaper' | 'system' | 'reader' | 'ai';
  handler: () => void;
  availability?: 'always' | 'authenticated' | 'local';
  disabledReason?: string;
  voicePhrases?: string[];
  keyboardShortcut?: string[];
  shortcut?: string[];
}

interface CommandContextType {
  commands: Command[];
  executeCommand: (id: string) => void;
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  executeVoicePhrase: (phrase: string) => boolean;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const CommandProvider = ({ children }: { children: ReactNode }) => {
  const [commands, setCommands] = useState<Command[]>([]);
  const { updateSetting, settings } = useSettings();
  const { showToast } = useToast();
  // To avoid circular deps we might need to handle navigation via events or passing navigate

  const executeCommand = useCallback((id: string) => {
    const command = commands.find(c => c.id === id);
    if (!command) {
      console.warn(`Command ${id} not found.`);
      return;
    }
    if (command.disabledReason) {
      showToast(command.disabledReason, 'warning');
      return;
    }
    try {
      command.handler();
    } catch (e) {
      showToast(`Command failed: ${command.label}`, 'error');
    }
  }, [commands, showToast]);

  const executeVoicePhrase = useCallback((phrase: string) => {
      const lowerPhrase = phrase.toLowerCase().trim();
      
      const matchedCommand = commands.find(c => 
          c.voicePhrases?.some(vp => lowerPhrase.includes(vp.toLowerCase()))
      );

      if (matchedCommand) {
          showToast(`Voice Command Recognized: ${matchedCommand.label}`, 'info');
          executeCommand(matchedCommand.id);
          return true;
      }
      return false;
  }, [commands, executeCommand, showToast]);

  const registerCommand = useCallback((command: Command) => {
    setCommands(prev => {
      if (prev.find(c => c.id === command.id)) return prev;
      return [...prev, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands(prev => prev.filter(c => c.id !== id));
  }, []);

  const navigate = useNavigate();

  // Register Built-in Global Commands
  useEffect(() => {
    const builtInCommands: Command[] = [
      {
        id: 'sys.fullscreen',
        label: 'Toggle Fullscreen',
        description: 'Enters or exits fullscreen mode for the application.',
        category: 'system',
        handler: () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        },
        voicePhrases: ['fullscreen', 'enter full screen', 'full screen mode']
      },
      {
        id: 'sys.diagnostics',
        label: 'Run System Diagnostics',
        description: 'Initiates a deeper health check on the core system.',
        category: 'system',
        handler: () => {
            // Can sync with settings panel open or modal
            showToast('Initializing Diagnostics mode across subsystems...', 'loading');
        },
        voicePhrases: ['run diagnostics', 'system check', 'check system health']
      },
      {
         id: 'wallpaper.fluid',
         label: 'Set Wallpaper: Fluid Dynamics',
         description: 'Changes the background engine to fluid particle simulation.',
         category: 'wallpaper',
         handler: () => updateSetting('activeWallpaper', 'fluid'),
         voicePhrases: ['set wallpaper to fluid', 'activate fluid wallpaper']
      },
      {
         id: 'wallpaper.polymetric',
         label: 'Set Wallpaper: Polymetric Network',
         description: 'Changes the background engine to polymetric neural nodes.',
         category: 'wallpaper',
         handler: () => updateSetting('activeWallpaper', 'polymetric'),
         voicePhrases: ['polymetric wallpaper', 'network background']
      },
      {
         id: 'sys.settings',
         label: 'Open System Settings',
         description: 'Opens the visual and behavioral settings panel.',
         category: 'settings',
         handler: () => window.dispatchEvent(new CustomEvent('open-settings')),
         voicePhrases: ['open settings', 'show settings', 'preferences'],
         shortcut: ['ctrl', ',']
      },
      {
         id: 'theme.dark',
         label: 'Activate Dark Theme',
         description: 'Force dark theme UI colors.',
         category: 'settings',
         handler: () => updateSetting('themeMode', 'dark'),
         voicePhrases: ['dark mode', 'enable dark mode', 'turn on dark mode']
      },
      {
         id: 'theme.light',
         label: 'Activate Light Theme',
         description: 'Force light theme UI colors.',
         category: 'settings',
         handler: () => updateSetting('themeMode', 'light'),
         voicePhrases: ['light mode', 'enable light mode', 'turn on light mode']
      },
      {
         id: 'nav.home',
         label: 'Go Home',
         description: 'Navigates to the home dashboard.',
         category: 'navigation',
         handler: () => navigate('/'),
         voicePhrases: ['go home', 'home page', 'open dashboard', 'main screen']
      },
      {
         id: 'nav.treatments',
         label: 'Go To Treatments',
         description: 'Navigates to the clinical treatments page.',
         category: 'navigation',
         handler: () => navigate('/treatments'),
         voicePhrases: ['open treatments', 'view treatments', 'show treatments']
      },
      {
         id: 'nav.contact',
         label: 'Contact the clinic',
         description: 'Navigates to the contact page.',
         category: 'navigation',
         handler: () => navigate('/contact'),
         shortcut: ['ctrl', 'Enter'],
         voicePhrases: ['contact', 'contact us', 'get in touch', 'ask a question']
      }
    ];

    builtInCommands.forEach(registerCommand);
    
    return () => {
      builtInCommands.forEach(c => unregisterCommand(c.id));
    };
  }, [registerCommand, unregisterCommand, updateSetting, showToast, navigate]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
     const down = (e: KeyboardEvent) => {
        // Prevent matching if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
           return;
        }

        const match = Array.from(commands.values()).find(cmd => {
           if (!cmd.shortcut) return false;
           // Parse shortcut array (e.g. ['ctrl', 'k'])
           const keys = cmd.shortcut.map(k => k.toLowerCase());
           const requiresCtrl = keys.includes('ctrl') || keys.includes('meta');
           const requiresShift = keys.includes('shift');
           const requiresAlt = keys.includes('alt');
           const mainKey = keys.find(k => !['ctrl', 'meta', 'shift', 'alt'].includes(k));

           return (
              (e.ctrlKey || e.metaKey) === requiresCtrl &&
              e.shiftKey === requiresShift &&
              e.altKey === requiresAlt &&
              e.key.toLowerCase() === mainKey
           );
        });

        if (match) {
           e.preventDefault();
           match.handler();
        }
     };
     document.addEventListener('keydown', down);
     return () => document.removeEventListener('keydown', down);
  }, [commands]);

  return (
    <CommandContext.Provider value={{ commands, executeCommand, registerCommand, unregisterCommand, executeVoicePhrase }}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = () => {
  const context = useContext(CommandContext);
  if (!context) throw new Error('useCommand must be used within CommandProvider');
  return context;
};
