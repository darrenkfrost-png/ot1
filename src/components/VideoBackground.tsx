import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getVideoWallpaper } from '../data/videoWallpapers';

const VideoBackground: React.FC = () => {
    const { settings } = useSettings();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    // Swapping the <source> does not reliably restart playback on its own, which
    // leaves a frozen frame after the visitor picks a different clip. Reload and
    // start it explicitly whenever the selection changes.
    const activeId = settings.videoWallpaper;
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.load();
        video.play().catch(() => { /* autoplay refused; the poster remains */ });
    }, [activeId, settings.activeWallpaper]);

    // Don't burn battery decoding frames nobody is looking at.
    useEffect(() => {
        const onVisibility = () => {
            const video = videoRef.current;
            if (!video) return;
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(() => { /* autoplay may be refused; poster stays */ });
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    if (settings.activeWallpaper !== 'video') return null;

    const wallpaper = getVideoWallpaper(settings.videoWallpaper);
    const stillOnly = prefersReducedMotion || settings.reduceMotion || !settings.animationsEnabled;

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 'var(--z-background)' }}>
            {stillOnly ? (
                <img
                    src={wallpaper.poster}
                    alt=""
                    decoding="async"
                    className="w-full h-full object-cover opacity-50"
                    style={{ filter: `brightness(${settings.wallpaperBrightness})` }}
                />
            ) : (
                <video
                    ref={videoRef}
                    key={wallpaper.id}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster={wallpaper.poster}
                    aria-hidden="true"
                    onLoadedData={(e) => { e.currentTarget.play().catch(() => { /* poster remains */ }); }}
                    className="w-full h-full object-cover opacity-50"
                    style={{ filter: `brightness(${settings.wallpaperBrightness})` }}
                >
                    {/* MP4 first: the host serves .webm as text/plain, which
                        makes the browser discard that source. */}
                    <source src={wallpaper.mp4} type="video/mp4" />
                    <source src={wallpaper.webm} type="video/webm" />
                </video>
            )}
            <div className="absolute inset-0 bg-black/30" />
        </div>
    );
};

export default VideoBackground;
