import React, { useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const WallpaperCanvas: React.FC = () => {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 20, g: 184, b: 166 };
  };

  useEffect(() => {
    console.log("WallpaperCanvas: initializing for mode:", settings.activeWallpaper);
    if (!canvasRef.current) return;
    
    if (settings.activeWallpaper === 'none' || settings.activeWallpaper === 'static-image' || settings.activeWallpaper === 'video') {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;
    
    // Accessibility: Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const rgb = hexToRgb(settings.wallpaperColor);
    const speedMult = prefersReducedMotion ? 0.05 : settings.wallpaperSpeed;
    const brightMult = settings.wallpaperBrightness;
    const quality = settings.wallpaperQuality;

    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    const mouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    const touchMove = (e: TouchEvent) => {
        if (e.touches[0]) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchstart', touchMove, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: true });
    resize();

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const state: any = {
        particles: [],
        lines: [],
        initialized: false,
        activeMode: '',
        activeQuality: ''
    };

    const reinit = (mode: string) => {
        if (!state.initialized || state.activeMode !== mode || state.activeQuality !== quality) {
            state.particles = [];
            state.lines = [];
            state.activeMode = mode;
            state.activeQuality = quality;
            state.initialized = true;
            return true;
        }
        return false;
    };

    const getParticleCount = (baseCount: number) => {
        if (quality === 'low') return Math.floor(baseCount * 0.5);
        if (quality === 'ultra') return Math.floor(baseCount * 2.5);
        return baseCount;
    };

    const drawLogo = (x: number, y: number, scale: number, alpha: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        // Translate to center the 100x100 SVG around 0,0
        ctx.translate(-50, -50);
        
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * brightMult})`;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer circle
        ctx.beginPath();
        ctx.arc(50, 50, 45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * brightMult})`;
        ctx.font = 'bold 32px sans-serif'; // Reduced font size somewhat for the background
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CT6', 50, 52); 

        ctx.restore();
    };

    const clearBg = (alpha = 1) => {
        ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
        ctx.fillRect(0, 0, width, height);

        // Subtly draw a giant center logo on top of base bg
        drawLogo(width / 2, height / 2, Math.max(width, height) / 80, 0.015);
    };

    const renderHyperspace = () => {
        clearBg(0.2);
        if (reinit('hyperspace')) {
            state.particles = Array.from({ length: 500 }, () => ({
                x: random(-width, width), y: random(-height, height), z: random(0, width),
                color: Math.random() > 0.5 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '#ffffff',
            }));
        }
        const cx = width / 2; const cy = height / 2;
        state.particles.forEach((p: any) => {
            p.z -= 15 * speedMult;
            if (p.z <= 0) {
                p.z = width; p.x = random(-width, width); p.y = random(-height, height);
            }
            const sx = (p.x / p.z) * width + cx;
            const sy = (p.y / p.z) * height + cy;
            const s = Math.max(0, (1 - p.z / width) * 5);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, Math.max(0.1, (s / 5) * brightMult));
            ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.2, s), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };

    const renderFluid = () => {
        if (reinit('fluid')) {
            state.particles = Array.from({ length: 8 }, () => ({
                x: random(0, width), y: random(0, height),
                vx: random(-0.5, 0.5) * speedMult, vy: random(-0.5, 0.5) * speedMult,
                radius: random(300, 600),
                color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * brightMult})`
            }));
        }
        clearBg();
        state.particles.forEach((p: any) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -p.radius) p.vx *= -1; if (p.x > width + p.radius) p.vx *= -1;
            if (p.y < -p.radius) p.vy *= -1; if (p.y > height + p.radius) p.vy *= -1;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        });
    };

    const renderNetwork = () => {
        clearBg();
        if (reinit('network')) {
            state.particles = Array.from({ length: getParticleCount(80) }, () => ({
                x: random(0, width), y: random(0, height),
                vx: random(-1, 1) * speedMult, vy: random(-1, 1) * speedMult
            }));
        }
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 * brightMult})`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 * brightMult})`;
        
        const interactionRadius = 200;
        
        state.particles.forEach((p: any, i: number) => {
            p.x += p.vx; p.y += p.vy;
            
            // Mouse Interaction: Subtle attraction/repulsion
            const mDist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
            if (mDist < interactionRadius) {
                const force = (interactionRadius - mDist) / interactionRadius;
                p.x += (mouse.x - p.x) * force * 0.02;
                p.y += (mouse.y - p.y) * force * 0.02;
            }

            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
            
            ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
            for (let j = i + 1; j < state.particles.length; j++) {
                const p2 = state.particles[j];
                const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                const limit = quality === 'ultra' ? 200 : 150;
                if (d < limit) {
                    ctx.globalAlpha = (1 - d / limit) * (mDist < interactionRadius ? 0.8 : 1.0);
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        ctx.globalAlpha = 1.0;
    };

    const renderWaves = () => {
        clearBg(0.1);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * brightMult})`;
        ctx.lineWidth = 2;
        const count = 5;
        for (let j = 0; j < count; j++) {
            ctx.beginPath();
            for (let i = 0; i < width; i += 10) {
                const y = height / 2 + Math.sin(i * 0.01 + time * 0.02 * speedMult + j) * 50 * (j+1);
                i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
            }
            ctx.stroke();
        }
    };

    const renderGrid = () => {
        clearBg();
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * brightMult})`;
        ctx.lineWidth = 1;
        const size = 50;
        const offX = (time * speedMult) % size;
        const offY = (time * speedMult) % size;
        ctx.beginPath();
        for (let x = offX; x < width; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (let y = offY; y < height; y += size) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();
    };

    const renderMatrix = () => {
        clearBg(0.1);
        if (reinit('matrix')) {
            const cols = Math.floor(width / 20);
            state.particles = Array.from({ length: cols }, () => random(0, height));
        }
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightMult})`;
        ctx.font = '15px monospace';
        state.particles.forEach((y: number, i: number) => {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            const x = i * 20;
            ctx.fillText(text, x, y);
            state.particles[i] = y > height && Math.random() > 0.975 ? 0 : y + 20 * speedMult;
        });
    };

    const renderRain = () => {
        clearBg(0.2);
        if (reinit('rain')) {
            state.particles = Array.from({ length: 150 }, () => ({
                x: random(0, width), y: random(-height, 0),
                l: random(10, 30), v: random(5, 15) * speedMult
            }));
        }
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.6 * brightMult})`;
        ctx.lineWidth = 1.5;
        state.particles.forEach((p: any) => {
            p.y += p.v;
            if (p.y > height) { p.y = random(-50, 0); p.x = random(0, width); }
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.l); ctx.stroke();
        });
    };

    const renderCircuit = () => {
        clearBg(0.05);
        if (reinit('circuit')) {
            state.particles = Array.from({ length: 20 }, () => ({
                x: Math.floor(random(0, width)/20)*20, y: Math.floor(random(0, height)/20)*20,
                dx: Math.random() > 0.5 ? 20 : 0, dy: Math.random() > 0.5 ? 20 : 0,
                life: random(50, 150)
            }));
        }
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 * brightMult})`;
        ctx.lineWidth = 2;
        state.particles.forEach((p: any) => {
            if (time % Math.max(1, Math.floor(5/speedMult)) === 0) {
                ctx.beginPath(); ctx.moveTo(p.x, p.y);
                p.x += p.dx; p.y += p.dy;
                ctx.lineTo(p.x, p.y); ctx.stroke();
                p.life--;
                if (Math.random() > 0.8) {
                    const temp = p.dx; p.dx = p.dy; p.dy = temp;
                    if (Math.random() > 0.5) p.dx *= -1;
                    if (Math.random() > 0.5) p.dy *= -1;
                }
            }
            if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                p.x = Math.floor(random(0, width)/20)*20; p.y = Math.floor(random(0, height)/20)*20;
                p.life = random(50, 150);
            }
        });
    };

    const renderAurora = () => {
        clearBg();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 20) {
                const y = height * 0.5 + Math.sin(x * 0.005 + time * 0.01 * speedMult + i) * 100 
                         + Math.cos(x * 0.01 + time * 0.015 * speedMult) * 50;
                x === 0 ? ctx.moveTo(x, height) : ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height); ctx.lineTo(0, height);
            const grad = ctx.createLinearGradient(0, height/2, 0, height);
            grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * brightMult})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    };

    const renderParticles = () => {
        clearBg();
        if (reinit('particles')) {
            state.particles = Array.from({ length: 150 }, () => ({
                x: random(0, width), y: random(0, height),
                r: random(1, 3), vx: random(-0.5, 0.5)*speedMult, vy: random(-0.5, 0.5)*speedMult
            }));
        }
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 * brightMult})`;
        state.particles.forEach((p: any) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
    };

    const renderConstellation = () => {
        renderNetwork(); // reusing network logic but tweaking styling conceptually
    };

    const renderOrbs = () => {
        clearBg(0.3);
        if (reinit('orbs')) {
            state.particles = Array.from({ length: 30 }, () => ({
                x: random(0, width), y: random(0, height),
                r: random(20, 100), vx: random(-1, 1)*speedMult, vy: random(-1, 1)*speedMult,
                hue: random(0, 360)
            }));
        }
        state.particles.forEach((p: any) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -p.r) p.x = width + p.r; if (p.x > width + p.r) p.x = -p.r;
            if (p.y < -p.r) p.y = height + p.r; if (p.y > height + p.r) p.y = -p.r;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 50%, ${0.1 * brightMult})`;
            ctx.fill();
        });
    };

    const renderRipple = () => {
        clearBg(0.1);
        if (reinit('ripple')) {
            state.particles = [];
        }
        if (Math.random() < 0.05 * speedMult) {
            state.particles.push({ x: random(0, width), y: random(0, height), r: 0, maxR: random(100, 300) });
        }
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * brightMult})`;
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.r += 2 * speedMult;
            ctx.globalAlpha = Math.max(0, 1 - p.r / p.maxR);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
            if (p.r > p.maxR) state.particles.splice(i, 1);
        }
        ctx.globalAlpha = 1.0;
    };

    const renderPolyrhythm = () => {
        clearBg();
        const cx = width / 2; const cy = height / 2;
        for (let i = 1; i <= 10; i++) {
            const r = i * 30;
            ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            const angle = time * 0.01 * speedMult * (11 - i) * 0.2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightMult})`;
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        }
    };

    const renderDna = () => {
        clearBg(0.3);
        const segments = 40;
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightMult})`;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 * brightMult})`;
        for (let i = 0; i < segments; i++) {
            const y = (height / segments) * i;
            const wave = Math.sin(i * 0.2 + time * 0.02 * speedMult) * 100;
            const x1 = width / 2 + wave;
            const x2 = width / 2 - wave;
            ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
            ctx.beginPath(); ctx.arc(x1, y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y, 4, 0, Math.PI * 2); ctx.fill();
        }
    };

    const renderPolymetric = () => {
        clearBg();
        if (reinit('polymetric')) {
            state.particles = Array.from({ length: getParticleCount(50) }, () => ({
                x: random(0, width), y: random(0, height), z: random(-500, 500),
                vx: random(-0.5, 0.5) * speedMult, vy: random(-0.5, 0.5) * speedMult, vz: random(-0.5, 0.5) * speedMult,
                size: random(1, 3)
            }));
        }
        
        const cx = width / 2; const cy = height / 2;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.15 * brightMult})`;
        ctx.lineWidth = 1;

        state.particles.forEach((p: any, i: number) => {
            p.x += p.vx; p.y += p.vy; p.z += p.vz;
            
            // Mouse Influence on 3D particles
            const mDist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
            const influence = quality === 'ultra' ? 300 : 200;
            if (mDist < influence) {
                p.z += (influence - mDist) * 0.05; // Push particles forward on mouse over
            }

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            if (p.z < -500) p.z = 500;
            if (p.z > 500) p.z = -500;

            const perspective = 800 / (800 + p.z);
            const sx = cx + (p.x - cx) * perspective;
            const sy = cy + (p.y - cy) * perspective;
            const size = p.size * perspective;

            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.5 + perspective / 2) * brightMult})`;
            ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();

            const connectionDist = quality === 'ultra' ? 350 : 250;
            for (let j = i + 1; j < state.particles.length; j++) {
                const p2 = state.particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y, p.z - p2.z);
                if (dist < connectionDist) {
                    const p2persp = 800 / (800 + p2.z);
                    const s2x = cx + (p2.x - cx) * p2persp;
                    const s2y = cy + (p2.y - cy) * p2persp;
                    ctx.globalAlpha = (1 - dist / connectionDist) * 0.3 * brightMult;
                    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(s2x, s2y); ctx.stroke();
                }
            }
        });
        ctx.globalAlpha = 1.0;
    };

    const animate = () => {
        time += 1;
        const m = settings.activeWallpaper;
        switch (m) {
            case 'polyrhythm': renderPolyrhythm(); break;
            case 'polymetric': renderPolymetric(); break;
            case 'hyperspace': renderHyperspace(); break;
            case 'fluid': renderFluid(); break;
            case 'network': renderNetwork(); break;
            case 'waves': renderWaves(); break;
            case 'grid': renderGrid(); break;
            case 'matrix': renderMatrix(); break;
            case 'rain': renderRain(); break;
            case 'circuit': renderCircuit(); break;
            case 'aurora': renderAurora(); break;
            case 'particles': renderParticles(); break;
            case 'constellation': renderConstellation(); break;
            case 'orbs': renderOrbs(); break;
            case 'ripple': renderRipple(); break;
            case 'dna': renderDna(); break;
            default: renderPolymetric(); break;
        }
        animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('touchstart', touchMove);
        window.removeEventListener('touchmove', touchMove);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [settings.activeWallpaper, settings.wallpaperColor, settings.wallpaperSpeed, settings.wallpaperBrightness, settings.wallpaperQuality]);

  return (
    settings.activeWallpaper === 'static-image' || settings.activeWallpaper === 'video' ? null : (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 'var(--z-canvas)' }}
    />
    )
  );
};

export default WallpaperCanvas;
