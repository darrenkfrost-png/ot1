import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { BOOKING_URL } from './constants';
import { BrowserRouter, Routes, Route, Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Activity,
  HeartPulse,
  Search,
  Bell,
  MapPin,
  Clock,
  Image as ImageIcon,
  BookOpen,
  Menu,
  ShieldCheck,
  Zap,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  Maximize,
  Minimize,
  ExternalLink
} from 'lucide-react';
import { cn } from './lib/utils';
const TreatmentsPage = lazy(() => import('./pages/TreatmentsPage'));
const TreatmentDetailPage = lazy(() => import('./pages/TreatmentDetailPage'));
const PractitionerDetailPage = lazy(() => import('./pages/PractitionerDetailPage'));
const PractitionersPage = lazy(() => import('./pages/PractitionersPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AIConsultantPage = lazy(() => import('./pages/AIConsultantPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LocationsPage = lazy(() => import('./pages/LocationsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

import Screensaver from './components/Screensaver';
import ScrollToTop from './components/ScrollToTop';
import WallpaperCanvas from './components/WallpaperCanvas';
import StaticBackground from './components/StaticBackground';
import VideoBackground from './components/VideoBackground';
import SettingsPanel from './components/SettingsPanel';
import IntroPage from './components/IntroPage';
import IntroVideo from './components/IntroVideo';
import FloatingAI from './components/FloatingAI';
import MobileNavDock from './components/MobileNavDock';
import Breadcrumbs from './components/Breadcrumbs';
import VoiceController from './components/VoiceController';
import { Logo } from './components/Logo';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ToastProvider, useToast } from './components/ToastSystem';
import { FirebaseInitializer } from './components/FirebaseInitializer';
import { SettingsProvider } from './context/SettingsContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { CommandProvider, useCommand } from './context/CommandContext';
import { PageContextBridgeProvider } from './context/PageContextContext';
import { TREATMENTS, PRACTITIONERS } from './data';

// --- Components ---
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'health-dashboard', label: 'Progress Board', icon: Activity, path: '/dashboard' },
  { id: 'treatments', label: 'Treatments', icon: HeartPulse, path: '/treatments' },
  { id: 'practitioners', label: 'Practitioners', icon: Users, path: '/practitioners' },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, path: '/gallery' },
  { id: 'resources', label: 'Resources', icon: BookOpen, path: '/resources' },
  { id: 'locations', label: 'Locations', icon: MapPin, path: '/locations' },
  { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
  { id: 'ai-clinic', label: 'AI Voice Clinic', icon: Sparkles, path: '/ai-consultant' },
];

/**
 * Ornament for the foot of the navigation.
 *
 * Deliberately carries no figures. The estate already displays statistics that
 * nobody can substantiate; decoration that looks like a readout would be one
 * more. This is a rhythm, not a reading.
 */
const PulseRibbon = () => {
  const reduceMotion = useReducedMotion();
  return (
    <div className="px-5 pb-4 shrink-0" aria-hidden="true">
      <div className="relative h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_50%,rgba(45,212,191,0.22),transparent_70%)]" />
        <div className="absolute inset-0 neural-grid opacity-40" />
        <svg viewBox="0 0 240 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <polyline
            points="0,34 44,34 56,14 68,52 80,34 116,34 128,24 140,44 152,34 240,34"
            fill="none"
            stroke="rgb(45,212,191)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={reduceMotion ? 'opacity-70' : 'pulse-trace'}
            style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.7))' }}
          />
        </svg>
      </div>
    </div>
  );
};

const Sidebar = ({ isCollapsed, onToggle, isMobile, isOpenMobile, onCloseMobile }: { isCollapsed: boolean; onToggle: () => void; isMobile: boolean; isOpenMobile: boolean; onCloseMobile: () => void }) => (
  <>
    {/* Mobile backdrop */}
    <AnimatePresence>
      {isMobile && isOpenMobile && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          style={{ zIndex: 'var(--z-sidebar-backdrop)' }}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
    <aside 
      id="main-sidebar"
      className="fixed left-0 top-0 h-full bg-white/80 backdrop-blur-3xl border-r border-slate-100/50 flex flex-col overflow-hidden origin-left will-change-transform shadow-premium group/sidebar"
      style={{
        zIndex: 'var(--z-sidebar)',
        width: isMobile ? 'var(--layout-mobile-sidebar-width)' : (isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-width)'),
        transitionProperty: 'width, transform',
        transitionDuration: 'var(--layout-transition-duration)',
        transitionTimingFunction: 'var(--layout-transition-ease)',
        transform: isMobile ? (isOpenMobile ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      }}
      aria-expanded={isMobile ? isOpenMobile : !isCollapsed}
    >
      <div className="h-[var(--layout-header-height)] flex items-center px-6 border-b border-slate-100 flex-none justify-between relative group/header overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent -translate-x-full group-hover/header:translate-x-0 transition-transform duration-700"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
             <Logo size={42} className="shrink-0 shadow-lg shadow-teal-500/10 group-hover/sidebar:rotate-[360deg] transition-transform duration-1000" variant="gradient" />
             <div className="absolute -inset-2 bg-teal-400/20 blur-xl rounded-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity"></div>
          </div>
          {(!isCollapsed || isMobile) && <span className="font-display font-bold text-slate-900 tracking-tighter whitespace-nowrap text-2xl">CT6</span>}
        </div>
      </div>
      <nav id="main-navigation" className="flex-1 py-12 px-5 space-y-3 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
        <AnimatePresence mode="popLayout">
          {NAV_ITEMS.map((item, index) => (
            <motion.div 
              layout 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink 
                to={item.path} 
                end={item.path === '/'}
                onClick={() => isMobile && onCloseMobile()}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative focus-visible:outline-teal-500 overflow-hidden border",
                  isActive 
                    ? "bg-slate-900 border-slate-800 shadow-xl text-white scale-[1.02]" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                )}
                title={isCollapsed && !isMobile ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-6 bg-teal-600 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className={cn(
                      "p-1.5 rounded-xl transition-all shrink-0",
                      isActive ? "bg-teal-500/10 text-teal-400" : "text-slate-400 group-hover:text-teal-500 group-hover:bg-teal-500/5"
                    )}>
                      <item.icon size={22} className={isActive ? "animate-pulse" : ""} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <AnimatePresence mode="wait">
                      {(!isCollapsed || isMobile) && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "font-black uppercase tracking-[0.3em] text-[9.5px] flex-1",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                       <div className="ml-auto w-1 h-1 bg-teal-400 rounded-full animate-ping mr-2"></div>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>
      {!isMobile && !isCollapsed && <PulseRibbon />}
      {!isMobile && (
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button 
            onClick={onToggle} 
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            aria-controls="main-sidebar"
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/20 outline-none"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span className="text-sm font-bold uppercase tracking-widest px-1">Collapse</span></>}
          </button>
        </div>
      )}
    </aside>
  </>
);

const Header = ({ isCollapsed, isMobile, onOpenMobile, isOpenMobile }: { isCollapsed: boolean; isMobile: boolean; onOpenMobile: () => void; isOpenMobile: boolean }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { showToast } = useToast();
  const { commands, executeCommand } = useCommand();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [commands, searchQuery]);

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 flex items-center border-b border-slate-100/50",
        "h-[var(--layout-header-height)] bg-white/70 backdrop-blur-3xl shadow-sm"
      )} 
      style={{ 
        left: isMobile ? '0px' : (isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-width)'),
        zIndex: 'var(--z-header)',
        transitionProperty: 'left',
        transitionDuration: 'var(--layout-transition-duration)',
        transitionTimingFunction: 'var(--layout-transition-ease)'
      }}
    >
      <div className="w-full max-w-[var(--layout-content-max-width)] mx-auto px-[var(--layout-shell-padding)] flex items-center justify-between">
        <div className="flex items-center flex-1 gap-6 max-w-2xl relative">
          {isMobile && (
            <button 
              onClick={onOpenMobile} 
              className="p-3 -ml-3 rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-teal-500 cursor-pointer transition-colors" 
              aria-label="Open menu"
              aria-expanded={isOpenMobile}
              aria-controls="main-sidebar"
            >
              <Menu size={24} />
            </button>
          )}
          <div className="relative group w-full md:w-[320px] lg:w-[400px] flex-1 z-50">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <input
              type="text"
              aria-label="Search treatments or type a command"
              placeholder="Search treatments or type a command..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (filteredCommands.length > 0) {
                    executeCommand(filteredCommands[0].id);
                    setSearchQuery('');
                    (e.target as HTMLInputElement).blur();
                  } else if (searchQuery.trim()) {
                    showToast(`Clinical search initialized. Matching "${searchQuery.trim()}" across our diagnostic database...`, "loading");
                    setTimeout(() => showToast(`Search complete. No exact clinical matches for "${searchQuery.trim()}". Displaying closest relative content.`, "info"), 1500);
                  }
                }
              }}
              className="w-full bg-slate-100/80 hover:bg-slate-200/80 focus:bg-white border-2 border-transparent focus:border-teal-100 rounded-2xl py-2.5 sm:py-3 pl-12 pr-6 text-sm focus:ring-8 focus:ring-teal-500/5 transition-all outline-none" 
            />
            <AnimatePresence>
              {isSearchFocused && searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 py-2 max-h-[300px] overflow-y-auto"
                >
                  {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          executeCommand(cmd.id);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-1 transition-colors focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{cmd.label}</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cmd.category}</span>
                        </div>
                        <span className="text-xs text-slate-500">{cmd.description}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No commands found for "{searchQuery}". Press Enter to perform a clinical search.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 ml-4">
          <button 
            onClick={() => showToast("No new notifications at this time.", "info")}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 relative transition-all cursor-pointer focus-visible:outline-teal-500 group"
            aria-label="Notifications"
          >
            <Bell size={21} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-px bg-slate-100 hidden sm:block mx-1"></div>
          {/*
            A real link, not a scripted window.open: it survives pop-up
            blockers, opens with a middle-click or ctrl-click, and tells a
            screen reader where it is going.
          */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-500/25 hover:bg-teal-700 hover:shadow-teal-500/40 transition-all active:scale-95 focus-visible:outline-teal-500 group"
            aria-label="Book an appointment online — opens our booking system in a new tab"
          >
            <Calendar size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Book Online</span>
            <ExternalLink size={12} className="opacity-60" aria-hidden="true" />
          </a>
          
          <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>
          
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer focus-visible:outline-teal-500 group"
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const reduceMotion = useReducedMotion();

  // Routes animate with mode="wait": the outgoing page must finish exiting
  // before the incoming one mounts, so both durations are paid in sequence on
  // every navigation. Half a second each way made that a visible dead pause;
  // this is deliberately shorter. Timing lives in a single `transition` prop
  // rather than inside the animate/exit objects - the plainer form of the API,
  // and one less thing to go wrong in a transition that gates navigation.
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const Layout = ({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative w-full overflow-x-clip">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[var(--z-toast)] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
        Skip to main content
      </a>
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={onToggle} 
        isMobile={isMobile}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />
      <div 
        className="min-h-screen flex flex-col relative w-full"
        style={{ 
          paddingLeft: isMobile ? '0px' : (isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-width)'),
          zIndex: 'var(--z-content)',
          transitionProperty: 'padding-left',
          transitionDuration: 'var(--layout-transition-duration)',
          transitionTimingFunction: 'var(--layout-transition-ease)'
        }}
      >
        <Header 
          isCollapsed={isCollapsed} 
          isMobile={isMobile}
          onOpenMobile={() => setIsOpenMobile(true)}
          isOpenMobile={isOpenMobile}
        />
        <main 
          className="flex-1 px-[var(--layout-shell-padding)] pb-[calc(100px+var(--layout-safe-area))] pt-[var(--layout-main-offset-top)] max-w-[var(--layout-content-max-width)] mx-auto w-full relative z-[var(--z-content)]"
          role="main"
          id="main-content"
        >
          <Breadcrumbs />
          <Outlet />
        </main>
        
        {/* Mobile bottom navigation dock */}
        <MobileNavDock />
        
        {/* Footer */}
        <footer className="px-[var(--layout-shell-padding)] pb-12 pt-32 border-t border-slate-100 bg-white/80 backdrop-blur-3xl relative z-[var(--z-content)] overflow-hidden">
          <div className="max-w-[var(--layout-content-max-width)] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-24">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Logo size={44} variant="gradient" />
                  <span className="font-display font-medium text-slate-900 text-2xl tracking-tighter">CT6 Wellbeing</span>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed font-light">
                  Expert clinical care and anatomical rehabilitation in the heart of Canterbury. Committed to your long-term health and mobility.
                </p>
                <div className="flex gap-4">
                  {['Instagram', 'Twitter', 'LinkedIn'].map((platform) => (
                    <button 
                      key={platform} 
                      onClick={() => showToast(`Opening ${platform}...`, 'info')}
                      className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:text-white hover:scale-110 transition-all shadow-sm focus-visible:outline-teal-500"
                      aria-label={`Visit our ${platform} page`}
                    >
                      <Zap size={18} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Navigation</h4>
                <nav className="flex flex-col gap-1 -my-2">
                  {[
                    { label: 'Home', path: '/' },
                    { label: 'Treatments', path: '/treatments' },
                    { label: 'Our Team', path: '/practitioners' },
                    { label: 'Clinic Gallery', path: '/gallery' },
                    { label: 'Patient Resources', path: '/resources' },
                    { label: 'Locations', path: '/locations' },
                    { label: 'Contact Us', path: '/contact' }
                  ].map((link) => (
                    <Link key={link.path} to={link.path} className="text-slate-600 hover:text-teal-600 font-medium transition-colors flex items-center gap-2 group min-h-11 py-2">
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Our Clinics</h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-600 shrink-0"><MapPin size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <span className="font-bold text-slate-900 block mb-1">Canterbury Central</span>
                      6 St George's Place<br />Canterbury, Kent CT1 1UT
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-600 shrink-0"><MapPin size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <span className="font-bold text-slate-900 block mb-1">Herne Bay Annex</span>
                      12 William Street<br />Herne Bay, Kent CT6 5NR
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Hours & Help</h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-600 shrink-0"><Clock size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <span className="font-bold text-slate-900 block mb-1">Clinic Hours</span>
                      Mon - Fri: 08:00 - 20:00<br />Sat: 09:00 - 16:00
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-600 shrink-0"><ShieldCheck size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <span className="font-bold text-slate-900 block mb-1">Emergency Service</span>
                      Out-of-hours coverage available for existing patients.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              <div className="flex items-center gap-6">
                <span>© 2026 CT6 Osteopathy & Wellbeing Clinic</span>
                <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                <span>BCA Registered • clinical.ct6.uk</span>
              </div>
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4 md:mt-0 italic max-w-md text-center md:text-right">
                *Clinical diagnosis requires in-person assessment.
              </div>
              <div className="flex gap-8">
                <button onClick={() => showToast('Compliance documentation is maintained by our clinical governance board.', 'info')} className="hover:text-teal-600 transition-colors focus-visible:outline-teal-500">Compliance</button>
                <button onClick={() => showToast('Privacy Policy (GDPR v2.0) available on request at the clinic desk.', 'info')} className="hover:text-teal-600 transition-colors focus-visible:outline-teal-500">Privacy</button>
                <button onClick={() => showToast('Our Patient Charter outlines our absolute commitment to your care.', 'info')} className="hover:text-teal-600 transition-colors focus-visible:outline-teal-500">Charter</button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -mr-32 -mb-32" />
        </footer>

      </div>
    </div>
  );
};
function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // The brand film opens the app, then hands over to the entry door.
  // Shown once per browser session so returning visitors aren't made to sit
  // through it again — change to useState(true) to play it on every load.
  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    try {
      return sessionStorage.getItem('ct6-intro-film-seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  const completeIntroVideo = () => {
    try {
      sessionStorage.setItem('ct6-intro-film-seen', 'true');
    } catch { /* private mode — just carry on */ }
    setShowIntroVideo(false);
  };

  return (
    <AnalyticsProvider>
      <ToastProvider>
        <FirebaseInitializer />
        <SettingsProvider>
          <CommandProvider>
            <PageContextBridgeProvider>
            <AnimatePresence>
              {showIntroVideo && <IntroVideo key="intro-film" onComplete={completeIntroVideo} />}
            </AnimatePresence>
            <AnimatePresence>
              {!showIntroVideo && showIntro && <IntroPage onComplete={() => setShowIntro(false)} />}
            </AnimatePresence>
            <StaticBackground />
            <VideoBackground />
            <WallpaperCanvas />
            <SettingsPanel />
            <FloatingAI />
            <VoiceController />
            <Suspense fallback={
              /*
               * A page's code arrives in well under a second on any normal
               * connection. A full-screen blocking overlay for that is heavier
               * than the wait it covers - and it whited out a dark estate. A
               * thread of light along the top edge says "working" without
               * taking the site away from the visitor.
               */
              <div
                className="fixed top-0 inset-x-0 z-[9999] h-[3px] overflow-hidden pointer-events-none"
                role="status"
                aria-label="Loading page"
              >
                <div className="route-progress h-full w-1/3 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_rgba(45,212,191,0.9)]" />
              </div>
            }>
            <AnimatePresence mode="wait">
              <Routes key={location.pathname} location={location}>
              <Route element={<Layout isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />}>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/treatments" element={<PageWrapper><TreatmentsPage /></PageWrapper>} />
                <Route path="/treatments/:id" element={<PageWrapper><TreatmentDetailPage /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
                <Route path="/practitioners" element={<PageWrapper><PractitionersPage /></PageWrapper>} />
                <Route path="/practitioners/:id" element={<PageWrapper><PractitionerDetailPage /></PageWrapper>} />
                <Route path="/gallery" element={<PageWrapper><GalleryPage /></PageWrapper>} />
                <Route path="/resources" element={<PageWrapper><ResourcesPage /></PageWrapper>} />
                <Route path="/locations" element={<PageWrapper><LocationsPage /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
                <Route path="/ai-consultant" element={<PageWrapper><AIConsultantPage /></PageWrapper>} />
                <Route path="*" element={
                  <PageWrapper>
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 py-20 relative bg-white/60 backdrop-blur-3xl crystal-glass rounded-[4rem] holographic-border shadow-premium mt-12 mx-4 sm:mx-0 overflow-hidden">
                      <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none mix-blend-screen" />
                      <div className="relative">
                        <h2 className="text-[12rem] font-display font-black text-slate-100 leading-none select-none drop-shadow-sm">404</h2>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-4 relative z-10">
                        <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Lost in the Wellbeing Journey?</h3>
                        <p className="text-slate-500 max-w-md mx-auto font-light text-lg">
                          This page seems to have taken a quiet retreat. Let's get you back to the center of your health journey.
                        </p>
                      </div>
                      <Link 
                        to="/" 
                        className="group flex items-center gap-3 px-10 py-5 bg-teal-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-teal-900/20 hover:bg-teal-500 hover:-translate-y-1 transition-all active:scale-[0.98] cinematic-glow z-10 relative"
                      >
                        <Home size={20} />
                        Return to Dashboard
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </PageWrapper>
                } />
              </Route>
            </Routes>
          </AnimatePresence>
          </Suspense>
          <Screensaver onDismiss={() => {}} />
          </PageContextBridgeProvider>
          </CommandProvider>
        </SettingsProvider>
      </ToastProvider>
    </AnalyticsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
