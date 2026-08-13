import React from 'react';
import { useSettings } from '../context/SettingsContext';

const StaticBackground: React.FC = () => {
    const { settings } = useSettings();
    if (settings.activeWallpaper !== 'static-image' || !settings.staticWallpaper) return null;

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 'var(--z-background)' }}>
            <img 
                src={settings.staticWallpaper}
                alt=""
                decoding="async"
                fetchPriority="low"
                className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/30" />
        </div>
    );
};

export default StaticBackground;
