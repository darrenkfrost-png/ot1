import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { BOOKING_URL, SOCIAL_LINKS, GOVERNANCE_DOCS, CLINIC } from './constants';
import { BrowserRouter, Routes, Route, Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Facebook,
  Youtube,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  Maximize,
  Minimize,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from './lib/utils';
/*
 * Every page is loaded on demand, which means every page is a separate file
 * whose name changes on each deploy. lazyWithRetry is what stops a tab that
 * was open across a deploy from crashing on the next link click - see
 * src/utils/chunkGuard.ts for the full story.
 */
import { lazyWithRetry } from './utils/lazyWithRetry';

const TreatmentsPage = lazyWithRetry(() => import('./pages/TreatmentsPage'));
const TreatmentDetailPage = lazyWithRetry(() => import('./pages/TreatmentDetailPage'));
const PractitionerDetailPage = lazyWithRetry(() => import('./pages/PractitionerDetailPage'));
const PractitionersPage = lazyWithRetry(() => import('./pages/PractitionersPage'));
const GalleryPage = lazyWithRetry(() => import('./pages/GalleryPage'));
const ResourcesPage = lazyWithRetry(() => import('./pages/ResourcesPage'));
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const LocationsPage = lazyWithRetry(() => import('./pages/LocationsPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const FaqPage = lazyWithRetry(() => import('./pages/FaqPage'));

import Screensaver from './components/Screensaver';
import ScrollToTop from './components/ScrollToTop';
import WallpaperCanvas from './components/WallpaperCanvas';
import StaticBackground from './components/StaticBackground';
import VideoBackground from './components/VideoBackground';
import SettingsPanel from './components/SettingsPanel';
import IntroPage from './components/IntroPage';
import IntroVideo from './components/IntroVideo';
import PageMeta from './components/PageMeta';
import ThemePicker from './components/ThemePicker';
import MobileNavDock from './components/MobileNavDock';
import ReadingHighlight from './components/ReadingHighlight';
import ListenButton from './components/ListenButton';
import Breadcrumbs from './components/Breadcrumbs';
import { Logo, REPLAY_INTRO_EVENT } from './components/Logo';
import { EmblemWatermark, SpineMotif } from './components/AnatomyMotif';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ToastProvider, useToast } from './components/ToastSystem';
/*
 * FirebaseInitializer is deliberately NOT imported or mounted (2026-09-27).
 * The site reads nothing from Firebase, and the config it carried was a
 * template placeholder ("remixed-project-id"). Mounted, it downloaded about
 * 600KB of Google code on every visit, kept a connection open to
 * firestore.googleapis.com, tried to upload the treatments and practitioners,
 * and left two IndexedDB databases on the visitor's device without asking.
 * Nothing a visitor could see depended on it. The file is kept in case the
 * clinic ever wants a real database - read the warning at its top first.
 */
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { CommandProvider, useCommand } from './context/CommandContext';
import { PageContextBridgeProvider } from './context/PageContextContext';
import { TREATMENTS, PRACTITIONERS } from './data';

// --- Components ---
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'health-dashboard', label: 'Recovery Tools', icon: Activity, path: '/dashboard' },
  { id: 'treatments', label: 'Treatments', icon: HeartPulse, path: '/treatments' },
  { id: 'practitioners', label: 'Practitioners', icon: Users, path: '/practitioners' },
  // Named as its page is headed ("Patient guides"), as the footer and the
  // breadcrumb now name it too.
  { id: 'gallery', label: 'Patient Guides', icon: ImageIcon, path: '/gallery' },
  { id: 'resources', label: 'Resources', icon: BookOpen, path: '/resources' },
  { id: 'locations', label: 'Locations', icon: MapPin, path: '/locations' },
  { id: 'faq', label: 'Questions', icon: HelpCircle, path: '/faq' },
  { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
];

/*
 * The page routes are keyed by address, so the whole frame - menu, header,
 * footer - is rebuilt on every change of page. These two remember what the
 * visitor has already been through, so that:
 *  - the menu's staggered fade-in plays once per visit, not on every click;
 *  - keyboard focus moves to the new page after a real change of page, and
 *    never on the very first load (or on React's development double-run).
 */
let shellHasAppeared = false;
let lastFocusedPath: string | null = null;

/*
 * Less movement is asked for three ways: the visitor's device setting, the
 * site's own "Reduce movement" switch, and "Page movement and film" turned
 * off. useReducedMotion() alone heard only the first, so the two switches in
 * Settings left this frame's ribbon tracing and its pages sliding. Everything
 * in this file that moves on its own asks here. (The same three signals the
 * door, the idle screen, the home page and the backgrounds obey.)
 */
function useStillMotion(): boolean {
  const deviceCalm = useReducedMotion();
  const { settings } = useSettings();
  return !!deviceCalm || !!settings.reduceMotion || settings.animationsEnabled === false;
}

/**
 * Ornament for the foot of the navigation.
 *
 * Deliberately carries no figures. The estate already displays statistics that
 * nobody can substantiate; decoration that looks like a readout would be one
 * more. This is a rhythm, not a reading.
 */
const PulseRibbon = () => {
  const reduceMotion = useStillMotion();
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

const Sidebar = ({ isCollapsed, onToggle, isMobile, isOpenMobile, onCloseMobile }: { isCollapsed: boolean; onToggle: () => void; isMobile: boolean; isOpenMobile: boolean; onCloseMobile: () => void }) => {
  /* Less movement, by any of the three routes (see useStillMotion): the
     emblem no longer spins on hover, and the current page's icon and dot
     stop pulsing. With only "Page movement and film" off, all three kept
     moving, because the CSS stillness rule hears the other two routes only. */
  const still = useStillMotion();
  return (
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
    {/* On phones and tablets the closed drawer is only slid off-screen, so
        its ten controls used to sit in the Tab order straight after the skip
        link - ten presses with nothing visible happening. inert takes the
        closed drawer out of the keyboard's path and out of screen readers'. */}
    <aside
      id="main-sidebar"
      inert={isMobile && !isOpenMobile}
      className="fixed left-0 top-0 h-full bg-[var(--panel-bg)] backdrop-blur-3xl border-r border-[var(--panel-border)] text-[var(--panel-text)] flex flex-col overflow-hidden origin-left will-change-transform shadow-premium group/sidebar"
      style={{
        zIndex: 'var(--z-sidebar)',
        width: isMobile ? 'var(--layout-mobile-sidebar-width)' : (isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-width)'),
        transitionProperty: 'width, transform',
        transitionDuration: 'var(--layout-transition-duration)',
        transitionTimingFunction: 'var(--layout-transition-ease)',
        transform: isMobile ? (isOpenMobile ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
      }}
    >
      {/* aria-expanded belongs on the buttons that control this panel (the
          menu button and the collapse button both carry it) — on the
          landmark itself it describes nothing a reader can use. */}
      <div className="h-[var(--layout-header-height)] flex items-center px-6 border-b border-[var(--panel-border)] flex-none justify-between relative group/header overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent -translate-x-full group-hover/header:translate-x-0 transition-transform duration-700"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
             <Logo size={42} replayIntroOnClick className={cn("shrink-0 shadow-lg shadow-teal-500/10", !still && "group-hover/sidebar:rotate-[360deg] transition-transform duration-1000")} variant="gradient" />
             {/* pointer-events-none: this glow sits on top of the emblem, and
                 it used to swallow every click, so pressing the emblem in the
                 menu never replayed the film (only the footer's worked). */}
             <div className="absolute -inset-2 bg-teal-400/20 blur-xl rounded-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity pointer-events-none" aria-hidden="true"></div>
          </div>
          {/* The practice trademark, not just the postcode mark. */}
          {(!isCollapsed || isMobile) && (
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-display font-bold text-[var(--panel-text)] tracking-tight text-[15px] whitespace-nowrap">Osteopathy &amp; Wellbeing</span>
              {/* Theme colour, not a fixed teal-800: on the four dark panels
                  (Midnight, Ocean, Forest, Graphite) teal-800 all but vanished.
                  Allowed to wrap: it grows with Settings > Text size, and on
                  one line at 150% the fixed-width menu cut off "Herne Bay". */}
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--panel-text-muted)]">@CT6 · Herne Bay</span>
            </span>
          )}
        </div>
      </div>
      <nav id="main-navigation" className="flex-1 py-6 px-5 space-y-2 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
        {/* initial: the fade-in plays on the first frame of the visit only,
            not again every time a page change rebuilds the menu. */}
        <AnimatePresence mode="popLayout" initial={!shellHasAppeared}>
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
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative focus-visible:outline-teal-500 overflow-hidden border",
                  isActive
                    ? "bg-slate-900 border-slate-800 shadow-xl text-white scale-[1.02]"
                    : "text-[var(--panel-text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--panel-text)] border-transparent"
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
                      isActive ? "calm-active bg-teal-500/10 text-teal-400" : "text-[var(--panel-text-muted)] group-hover:text-teal-500 group-hover:bg-teal-500/5"
                    )}>
                      <item.icon size={22} className={isActive && !still ? "animate-pulse" : ""} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    {/* Still fades in when the menu is expanded again. */}
                    <AnimatePresence mode="wait" initial={!shellHasAppeared}>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "font-black uppercase tracking-[0.3em] text-[9.5px] flex-1",
                            // The panel's own text colour for every theme. A
                            // fixed slate-700 measured about 1.9:1 on the dark
                            // panels (Midnight, Ocean, Forest, Graphite) - only
                            // the active item could be read. On the default
                            // light panel this is darker than before, not lighter.
                            isActive ? "text-white" : "text-[var(--panel-text)]"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                       <div className={cn("ml-auto w-1 h-1 bg-teal-400 rounded-full mr-2", !still && "animate-ping")}></div>
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
        <div className="p-4 border-t border-[var(--panel-border)] shrink-0">
          <button
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            aria-controls="main-sidebar"
            className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-[var(--panel-hover)] text-[var(--panel-text-muted)] hover:text-[var(--panel-text)] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500/20 outline-none"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span className="text-sm font-bold uppercase tracking-widest px-1">Collapse</span></>}
          </button>
        </div>
      )}
    </aside>
  </>
  );
};

/*
 * iPhone Safari has no element full screen (only iPad does): calling it threw
 * before anything happened, so the button did nothing and said nothing. The
 * control is shown only where the browser can actually do it.
 */
const canGoFullscreen = () =>
  typeof document !== 'undefined' &&
  !!document.fullscreenEnabled &&
  typeof document.documentElement.requestFullscreen === 'function';

/* "08:00" -> "8am", "12:00" -> "12 noon", the way the footer writes hours. */
function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 12 && m === 0) return '12 noon';
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}.${String(m).padStart(2, '0')}${suffix}` : `${h12}${suffix}`;
}

/*
 * The bell used to answer "No new notifications at this time." on every
 * press - the site has no notifications, so it could never say anything
 * else. It now gives today's opening hours, read from the clinic's own
 * published hours in clinic.ts. "Usual", because bank holidays and closures
 * are not recorded anywhere on this site.
 */
function todaysHoursNotice(): string {
  let day: string;
  try {
    day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
  } catch {
    day = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
  }
  const slot = CLINIC.openingHoursSpec.find((s) => (s.days as readonly string[]).includes(day));
  return slot
    ? `Today (${day}) the clinic's usual hours are ${formatClock(slot.opens)} to ${formatClock(slot.closes)}. Call ${CLINIC.telephone} or book online.`
    : `The clinic is usually closed on ${day}s. You can still book online.`;
}

const Header = ({ isCollapsed, isMobile, onOpenMobile, isOpenMobile, onEnterImmersive }: { isCollapsed: boolean; isMobile: boolean; onOpenMobile: () => void; isOpenMobile: boolean; onEnterImmersive: () => void }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { showToast } = useToast();
  const { commands, executeCommand } = useCommand();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  // The two ends of the thread the keyboard follows: the box you type in,
  // and the list the arrow keys walk through.
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  /*
   * Results travel through the router, the same road the nav pills take.
   * A full page load here would replay the intro film and the entry door
   * between a patient and the page they just chose.
   */
  const openResult = useCallback((path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  }, [navigate]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (!canGoFullscreen()) return;
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

  /*
   * REAL SEARCH, not an announcement of one.
   *
   * Pressing Enter used to say "Matching across our diagnostic database" and,
   * a second and a half later, "Search complete... Displaying closest relative
   * content" - while displaying nothing at all. There was no database and no
   * search, and the dropdown openly invited it: "Press Enter to perform a
   * clinical search". This searches what the site actually holds: the
   * treatments, the lists each one carries from the clinic's own service page
   * (conditions, and "who is this for"), and the practitioners.
   *
   * The "who is this for" lists are searched too, as the Treatments page
   * already does: only Osteopathy carries a conditions list, so "insomnia"
   * found nothing here although Hypnotherapy lists "Sleep Issues and
   * Insomnia", and "corns" missed Footcare's "Removal of corns and hard skin".
   */
  const contentMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [] as { label: string; hint: string; path: string }[];
    const hits: { label: string; hint: string; path: string }[] = [];
    for (const t of TREATMENTS) {
      const byCondition = t.conditions?.some((c) => c.toLowerCase().includes(q)) ?? false;
      const byWhoFor = t.whoFor?.some((c) => c.toLowerCase().includes(q)) ?? false;
      const byName = t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
      if (byName || byCondition || byWhoFor) {
        hits.push({
          label: t.title,
          // Say why it matched when the word is not in the title, or a result
          // for "sciatica" sitting under "Osteopathy" reads as a mistake. A
          // "who is this for" match says so in the words its page uses, not
          // as a claim that the treatment treats it.
          hint: byName ? 'Treatment' : byCondition ? 'Treats this' : 'Who it is for',
          path: '/treatments/' + t.id,
        });
      }
    }
    for (const person of PRACTITIONERS) {
      if (person.name.toLowerCase().includes(q) || (person.role || '').toLowerCase().includes(q)) {
        hits.push({ label: person.name, hint: person.role || 'Practitioner', path: '/practitioners/' + person.id });
      }
    }
    return hits.slice(0, 6);
  }, [searchQuery]);

  /*
   * Commands match on their LABEL only, and only from two characters up.
   * Matching descriptions too meant a patient typing "back" - as in back pain -
   * hit "Changes the background engine" and had the wallpaper change under
   * them; matching an empty string meant every command matched, so pressing
   * Enter in an empty box ran the first one (fullscreen) with nothing on
   * screen to explain it.
   */
  const filteredCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return commands.filter(cmd => cmd.label.toLowerCase().includes(q));
  }, [commands, searchQuery]);

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 flex items-center border-b",
        "h-[var(--layout-header-height)] backdrop-blur-3xl shadow-sm",
        "bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--panel-text)]"
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
              className="p-3 -ml-3 rounded-xl text-[var(--panel-text-muted)] hover:bg-[var(--panel-hover)] hover:text-[var(--panel-text)] focus-visible:outline-teal-500 cursor-pointer transition-colors"
              aria-label="Open menu"
              aria-expanded={isOpenMobile}
              aria-controls="main-sidebar"
            >
              <Menu size={24} />
            </button>
          )}
          {/*
            Clears the screen of everything the clinic's own interface draws -
            this bar and the menu down the left - so the page itself can be
            read without a frame around it. The way back is a matching button
            that stays on screen, plus the Escape key.
          */}
          <button
            onClick={onEnterImmersive}
            className="p-2.5 -ml-1 shrink-0 rounded-xl text-[var(--panel-text-muted)] hover:text-[var(--panel-text)] hover:bg-[var(--panel-hover)] focus-visible:outline-teal-500 cursor-pointer transition-colors"
            aria-label="Hide the menus for a clear, full-screen view"
            title="Hide the menus (Esc to bring them back)"
          >
            <EyeOff size={20} />
          </button>
          {/*
            Whether the results stay open is decided by where focus lands,
            not by the input losing it — otherwise the Tab key closes the
            list the moment it tries to reach the second result.
          */}
          <div
            className="relative group w-full md:w-[320px] lg:w-[400px] flex-1 z-50"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsSearchFocused(false);
              }
            }}
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="Search treatments or type a command"
              placeholder="Search treatments or type a command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Enter takes the first row the dropdown is SHOWING, and the
                  // dropdown lists treatments and people before commands.
                  // Reversing that made the key contradict the screen.
                  if (contentMatches.length > 0) {
                    openResult(contentMatches[0].path);
                    (e.target as HTMLInputElement).blur();
                  } else if (filteredCommands.length > 0) {
                    executeCommand(filteredCommands[0].id);
                    setSearchQuery('');
                    (e.target as HTMLInputElement).blur();
                  }
                } else if (e.key === 'ArrowDown') {
                  // Down from the box steps into the list itself.
                  const first = resultsRef.current?.querySelector<HTMLElement>('a, button');
                  if (first) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
              // The field is always light, so its words are always dark. It
              // used to inherit the panel's text colour, which on the dark
              // themes meant near-white typing on a near-white box.
              className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-600 border-2 border-transparent focus:border-teal-100 rounded-2xl py-2.5 sm:py-3 pl-12 pr-6 text-sm focus:ring-8 focus:ring-teal-500/5 transition-all outline-none"
            />
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim() && (
                <motion.div
                  ref={resultsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 py-2 max-h-[300px] overflow-y-auto"
                  onKeyDown={(e) => {
                    // Arrow keys walk the list; Up from the first row hands
                    // the keyboard back to the box.
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                    e.preventDefault();
                    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a, button'));
                    const index = items.indexOf(document.activeElement as HTMLElement);
                    if (e.key === 'ArrowDown') {
                      (items[index + 1] ?? items[0])?.focus();
                    } else if (index <= 0) {
                      searchInputRef.current?.focus();
                    } else {
                      items[index - 1]?.focus();
                    }
                  }}
                >
                  {/*
                    A real link, so middle-click and long-press still offer a
                    new tab — but a plain click stays inside the app. The
                    mousedown guard keeps focus in the search so the list is
                    still mounted when the click arrives.
                  */}
                  {contentMatches.map((m) => (
                    <a
                      key={m.path}
                      href={m.path}
                      onMouseDown={(e) => { if (e.button === 0) e.preventDefault(); }}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        openResult(m.path);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 focus:bg-slate-50 focus:outline-none"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-800">{m.label}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">{m.hint}</span>
                      </div>
                    </a>
                  ))}
                  {(filteredCommands.length > 0 || contentMatches.length > 0) ? (
                    filteredCommands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onMouseDown={(e) => { if (e.button === 0) e.preventDefault(); }}
                        onClick={() => {
                          // click, not mousedown: the Enter key on a focused
                          // row fires click, and only click.
                          executeCommand(cmd.id);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-1 transition-colors focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{cmd.label}</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{cmd.category}</span>
                        </div>
                        <span className="text-xs text-slate-500">{cmd.description}</span>
                      </button>
                    ))
                  ) : (
                    // Both lists wait for two letters, so after one letter
                    // "Nothing matches" was said before a word was finished.
                    <div className="px-4 py-6 text-center text-sm text-slate-600">
                      {searchQuery.trim().length < 2
                        ? 'Keep typing: a treatment, a condition or a name.'
                        : `Nothing matches "${searchQuery.trim()}". Try a treatment, a condition we treat, or a practitioner’s name.`}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 ml-4">
          <ThemePicker />
          <button
            onClick={() => showToast(todaysHoursNotice(), "info")}
            className="p-3 rounded-full hover:bg-[var(--panel-hover)] text-[var(--panel-text-muted)] hover:text-[var(--panel-text)] relative transition-all cursor-pointer focus-visible:outline-teal-500 group"
            aria-label="Clinic notices: today's opening hours"
            title="Today's opening hours"
          >
            <Bell size={21} className="group-hover:rotate-12 transition-transform" />
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
            className="calm-cta hidden sm:flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-500/25 hover:bg-teal-700 hover:shadow-teal-500/40 transition-all active:scale-95 focus-visible:outline-teal-500 group"
            // Starts with the words on the button, so "click Book Online"
            // works for voice-control users (WCAG 2.5.3).
            aria-label="Book Online — opens our booking system in a new tab"
          >
            <Calendar size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Book Online</span>
            <ExternalLink size={12} className="opacity-60" aria-hidden="true" />
          </a>
          
          {canGoFullscreen() && (
            <>
              <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>

              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-xl hover:bg-[var(--panel-hover)] text-[var(--panel-text-muted)] hover:text-[var(--panel-text)] transition-all cursor-pointer focus-visible:outline-teal-500 group"
                aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  // Either switch in Settings, or the device, turns the slide into a short fade.
  const reduceMotion = useStillMotion();

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
  /*
   * Start from the real width. This frame is rebuilt on every change of page,
   * and starting from "not a phone" drew the full desktop menu over the page
   * (and squeezed the page to a sliver) for a few frames on every tap, before
   * the resize check below corrected it.
   */
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const location = useLocation();
  /*
   * Immersive mode: everything the app draws around the page - the top bar,
   * the left menu, the mobile dock - is taken off the screen so the content
   * has the full window to itself.
   *
   * Deliberately not remembered between visits. Someone who lands on a site
   * with all of its navigation already hidden has no way to know what is
   * missing, so each visit starts with the menus present.
   */
  const [isImmersive, setIsImmersive] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // From now on the menu has been seen: rebuilt frames skip its fade-in.
  useEffect(() => {
    shellHasAppeared = true;
  }, []);

  /*
   * After a change of page, put keyboard focus at the start of the new page.
   * Otherwise the pressed link is destroyed with the old frame, focus falls to
   * the top of the document, and a keyboard or screen-reader user has to Tab
   * through the whole menu again - and hears nothing to say the page changed.
   * Keyed on the address, not on "second render": the frame is rebuilt on
   * every page, so each one is a first render.
   */
  useEffect(() => {
    const path = location.pathname;
    if (lastFocusedPath !== null && lastFocusedPath !== path) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }
    lastFocusedPath = path;
  }, [location.pathname]);

  // Escape is the reflex for "give me the normal screen back", and it is the
  // way out for anyone who cannot see or reach the restore button.
  useEffect(() => {
    if (!isImmersive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImmersive(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isImmersive]);

  /*
   * While the drawer covers the page it owns the keyboard: Escape puts it
   * away and hands focus back to the button that opened it, and Tab is kept
   * inside the drawer so the focus ring cannot wander into content the
   * backdrop is visually hiding.
   */
  useEffect(() => {
    if (!isMobile || !isOpenMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpenMobile(false);
        document.querySelector<HTMLElement>('button[aria-label="Open menu"]')?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const drawer = document.getElementById('main-sidebar');
      if (!drawer) return;
      const focusables = Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (!drawer.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile, isOpenMobile]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative w-full overflow-x-clip">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[var(--z-toast)] focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
        Skip to main content
      </a>
      {!isImmersive && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          isMobile={isMobile}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />
      )}
      <div
        className="min-h-screen flex flex-col relative w-full"
        style={{
          // In immersive mode there is no menu down the left, so the space it
          // was being held open for is given back to the page.
          paddingLeft: (isMobile || isImmersive) ? '0px' : (isCollapsed ? 'var(--layout-sidebar-collapsed-width)' : 'var(--layout-sidebar-width)'),
          zIndex: 'var(--z-content)',
          transitionProperty: 'padding-left',
          transitionDuration: 'var(--layout-transition-duration)',
          transitionTimingFunction: 'var(--layout-transition-ease)'
        }}
      >
        {!isImmersive && (
          <Header
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            onOpenMobile={() => setIsOpenMobile(true)}
            isOpenMobile={isOpenMobile}
            onEnterImmersive={() => setIsImmersive(true)}
          />
        )}
        <main
          className="flex-1 px-[var(--layout-shell-padding)] pb-[calc(100px+var(--layout-safe-area))] max-w-[var(--layout-content-max-width)] mx-auto w-full relative z-[var(--z-content)]"
          role="main"
          id="main-content"
          // Focusable by script (after a change of page, or the skip link)
          // but never a Tab stop. The page itself is not a control, so the
          // two-band focus ring is not drawn around all of it: an inline
          // style is the one thing that outranks the unlayered :focus-visible
          // rule in index.css. Every control inside keeps its ring.
          tabIndex={-1}
          style={{
            // The top offset exists only to clear the fixed header. With the
            // header gone it would be a band of empty space at the top of the
            // page, which is the opposite of what this mode is for.
            paddingTop: isImmersive ? 'calc(var(--layout-safe-area) + 1.5rem)' : 'var(--layout-main-offset-top)',
            outline: 'none',
            boxShadow: 'none',
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </main>

        {/* Lights up the passage under a finger on touch screens; pointer
            devices are handled by :hover in index.css. Renders nothing. */}
        <ReadingHighlight />
        <ListenButton />

        {/* Mobile bottom navigation dock */}
        {!isImmersive && <MobileNavDock />}
        
        {/* Footer */}
        <footer className="px-[var(--layout-shell-padding)] pb-12 pt-32 border-t border-slate-100 bg-white/80 backdrop-blur-3xl relative z-[var(--z-content)] overflow-hidden">
          <div className="max-w-[var(--layout-content-max-width)] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-24">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Logo size={44} variant="gradient" replayIntroOnClick />
                  <span className="font-display font-medium text-slate-900 text-2xl tracking-tighter">{CLINIC.name}</span>
                </div>
                {/* The same list of services as the Treatments page: hypnotherapy
                    (Alexandra) used to be missing from this one. */}
                <p className="text-slate-600 text-lg leading-relaxed font-light">
                  Osteopathy, acupuncture, massage, foot care and hypnotherapy on the High Street in Herne Bay. Committed to your long-term health and mobility.
                </p>
                {/* Only profiles with a real address appear. An icon that
                    announces "Opening Instagram…" and then does nothing is
                    worse than no icon. */}
                {SOCIAL_LINKS.some((s) => s.url) && (
                  <div className="flex flex-wrap gap-4">
                    {/* Each network in its own mark, with its name beside it.
                        Both used to be the same lightning bolt with no words,
                        so nobody could tell Facebook from YouTube. */}
                    {SOCIAL_LINKS.filter((s) => s.url).map((social) => {
                      const Mark = social.label === 'Facebook' ? Facebook : social.label === 'YouTube' ? Youtube : ExternalLink;
                      return (
                        <a
                          key={social.label}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer me"
                          className="min-h-11 px-4 rounded-xl bg-slate-50 flex items-center justify-center gap-2 text-slate-700 hover:bg-teal-700 hover:text-white transition-all shadow-sm focus-visible:outline-teal-500"
                          aria-label={`${social.label}: visit our page — opens in a new tab`}
                        >
                          <Mark size={18} aria-hidden="true" />
                          <span className="text-sm font-bold">{social.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Level-2 headings: they sit straight under each page's h1 in
                  the outline, and a level-4 there skipped two levels for
                  anyone moving by heading. The classes set the look, so
                  nothing on screen changes. */}
              <div className="space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Navigation</h2>
                <nav className="flex flex-col gap-1 -my-2">
                  {/* Every page in the menu is here too: on a phone the footer
                      is where people look, and the dock has no room for
                      Questions. The guides go by the name their page uses. */}
                  {[
                    { label: 'Home', path: '/' },
                    { label: 'Treatments', path: '/treatments' },
                    { label: 'Our Team', path: '/practitioners' },
                    { label: 'Patient Guides', path: '/gallery' },
                    { label: 'Patient Resources', path: '/resources' },
                    { label: 'Recovery Tools', path: '/dashboard' },
                    { label: 'Locations', path: '/locations' },
                    { label: 'Questions', path: '/faq' },
                    { label: 'Contact Us', path: '/contact' }
                  ].map((link) => (
                    <Link key={link.path} to={link.path} className="text-slate-600 hover:text-teal-800 font-medium transition-colors flex items-center gap-2 group min-h-11 py-2">
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">The Clinic</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-800 shrink-0"><MapPin size={20} /></div>
                    <address className="text-slate-600 text-sm leading-relaxed font-light not-italic">
                      <span className="font-bold text-slate-900 block mb-1">{CLINIC.name}</span>
                      {CLINIC.address.line1}<br />
                      {CLINIC.address.town}, {CLINIC.address.county} {CLINIC.address.postcode}
                    </address>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-800 shrink-0"><Phone size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <a href={`tel:${CLINIC.telephoneLink}`} className="font-bold text-slate-900 hover:text-teal-800 transition-colors inline-flex items-center min-h-[44px] mb-1">
                        {CLINIC.telephone}
                      </a>
                      <a href={`mailto:${CLINIC.email}`} className="hover:text-teal-800 transition-colors break-all inline-flex items-center min-h-[44px]">
                        {CLINIC.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Opening Hours</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-800 shrink-0"><Clock size={20} /></div>
                    <dl className="text-slate-600 text-sm leading-relaxed font-light space-y-1">
                      {CLINIC.openingHours.map((slot) => (
                        <div key={slot.days} className="flex gap-3 justify-between">
                          <dt className="font-medium text-slate-700">{slot.days}</dt>
                          <dd>{slot.hours}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 text-teal-800 shrink-0"><ShieldCheck size={20} /></div>
                    <div className="text-slate-600 text-sm leading-relaxed font-light">
                      <span className="font-bold text-slate-900 block mb-1">Registered osteopaths</span>
                      Regulated by the {CLINIC.regulator.name} ({CLINIC.regulator.abbreviation}).
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
              {/* "BCA Registered" claimed the British Chiropractic Association
                  for an osteopathy practice. The regulator is the GOsC. */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span>© {new Date().getFullYear()} {CLINIC.legalName}</span>
                <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                <span>Company no. {CLINIC.companyNumber}</span>
                <span className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                <a
                  href={CLINIC.regulator.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-[40px] hover:text-teal-800 transition-colors focus-visible:outline-teal-500"
                >
                  {CLINIC.regulator.abbreviation} regulated
                </a>
              </div>
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4 md:mt-0 italic max-w-md text-center md:text-right">
                *Clinical diagnosis requires in-person assessment.
              </div>
              {/* Linked when the document exists; otherwise a plain request
                  route, rather than a button that pops a message and stops. */}
              <div className="flex gap-8">
                {GOVERNANCE_DOCS.map((doc) =>
                  doc.url ? (
                    <a
                      key={doc.title}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-800 transition-colors focus-visible:outline-teal-500"
                    >
                      {doc.title}
                    </a>
                  ) : (
                    <Link
                      key={doc.title}
                      to="/contact"
                      className="hover:text-teal-800 transition-colors focus-visible:outline-teal-500"
                      title={`${doc.title} — request a copy from the clinic`}
                    >
                      {doc.title}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] -mr-32 -mb-32" />
          {/* The mark, watermarked into the foot of the page. */}
          <EmblemWatermark className="absolute -bottom-16 right-10 w-72 h-72 text-slate-900 hidden md:block" opacity={4} />
          <SpineMotif className="absolute top-10 left-6 w-16 h-[300px] text-slate-900 hidden lg:block" opacity={4} />
        </footer>

      </div>

      {/*
        The way out of immersive mode. It has to live outside the content
        column and sit above everything, because the bar it replaces is gone.
        Kept quiet until it is wanted: faint by default, fully opaque on
        hover or keyboard focus.
      */}
      {isImmersive && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setIsImmersive(false)}
          className="fixed top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-xl border border-white/15 shadow-2xl opacity-40 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-teal-400 transition-opacity cursor-pointer"
          style={{
            zIndex: 'var(--z-toast)',
            top: 'calc(1rem + var(--layout-safe-area))',
          }}
          aria-label="Show menus"
          title="Show the menus again (Esc)"
        >
          <Eye size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Show menus</span>
        </motion.button>
      )}
    </div>
  );
};
function AppContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // The brand film opens the app, then hands over to the entry door.
  // Shown once per VISIT: a session cookie is shared by every tab and ends
  // when the browser closes, so a new tab no longer replays it (founder,
  // 2026-09-27). Change to useState(true) to play it on every load.
  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    try {
      return !seenThisVisit('ct6-intro-film-seen');
    } catch {
      return true;
    }
  });
  /*
   * The door follows the film's rule. It used to live only in memory, so
   * after the film had been remembered, EVERY full load - a refresh, or a
   * patient following a link to a treatment - put "Enter to begin" back in
   * front of the page they asked for. Measured: refresh -> door, deep link
   * in the same tab -> door. The comment above gave the reason this must not
   * happen; the door simply never obeyed it.
   */
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !seenThisVisit('ct6-entrance-seen');
    } catch {
      return true;
    }
  });
  const completeEntrance = () => {
    try {
      markSeenThisVisit('ct6-entrance-seen');
    } catch { /* private mode - just carry on */ }
    setShowIntro(false);
  };
  const location = useLocation();

  /*
   * True only while the film is showing because the visitor pressed the
   * emblem to play it again. On arrival the film yields to any request for
   * less movement (device, "Reduce movement", or "Page movement and film"
   * off) and goes straight to the door; a film the visitor has asked for by
   * name plays - otherwise the emblem's "Play the introduction film again"
   * would do nothing at all for exactly those visitors.
   */
  const [introRequested, setIntroRequested] = useState(false);

  const completeIntroVideo = () => {
    try {
      markSeenThisVisit('ct6-intro-film-seen');
    } catch { /* private mode — just carry on */ }
    setShowIntroVideo(false);
    setIntroRequested(false);
  };

  // The emblem in the header and the footer plays the opening film again.
  useEffect(() => {
    const replay = () => {
      setIntroRequested(true);
      setShowIntroVideo(true);
    };
    window.addEventListener(REPLAY_INTRO_EVENT, replay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, replay);
  }, []);

  return (
    <AnalyticsProvider>
      <ToastProvider>
        <SettingsProvider>
          <CommandProvider>
            <PageContextBridgeProvider>
            <AnimatePresence>
              {showIntroVideo && <IntroVideo key="intro-film" requested={introRequested} onComplete={completeIntroVideo} />}
            </AnimatePresence>
            <AnimatePresence>
              {!showIntroVideo && showIntro && <IntroPage onComplete={completeEntrance} />}
            </AnimatePresence>
            <PageMeta />
            <StaticBackground />
            <VideoBackground />
            <WallpaperCanvas />
            <SettingsPanel />
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
                <Route path="/faq" element={<PageWrapper><FaqPage /></PageWrapper>} />
                <Route path="*" element={
                  <PageWrapper>
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 py-20 relative bg-white/60 backdrop-blur-3xl crystal-glass rounded-[4rem] holographic-border shadow-premium mt-12 mx-4 sm:mx-0 overflow-hidden">
                      <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none mix-blend-screen" />
                      {/* The big "404" is decoration; the page's one main
                          heading says what happened in plain words. */}
                      <div className="relative" aria-hidden="true">
                        <p className="text-[12rem] font-display font-black text-slate-100 leading-none select-none drop-shadow-sm">404</p>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-4 relative z-10">
                        <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Page not found</h1>
                        <p className="text-slate-800 max-w-md mx-auto text-lg">
                          We cannot find that page. It may have moved. Use the menu, or go back to the home page.
                        </p>
                      </div>
                      <Link 
                        to="/" 
                        className="group flex items-center gap-3 px-10 py-5 bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-teal-900/20 hover:bg-teal-800 hover:-translate-y-1 transition-all active:scale-[0.98] cinematic-glow z-10 relative"
                      >
                        <Home size={20} aria-hidden="true" />
                        {/* It goes to the home page, so it says so. "Dashboard"
                            is what people call Recovery Tools. */}
                        Back to the home page
                        <ChevronRight size={20} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
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

/*
 * "Seen this visit" for the opening film and the door. A session cookie (no
 * expiry, first-party, never sent anywhere but this site) is what every tab of
 * one browser visit shares; it is strictly necessary for the page to behave
 * as asked, so it needs no consent banner - but the cookie policy should name
 * it: ct6-intro-film-seen, ct6-entrance-seen. The old per-tab flag still counts.
 */
function seenThisVisit(key: string): boolean {
  try {
    if (document.cookie.split('; ').includes(`${key}=1`)) return true;
    return sessionStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}
function markSeenThisVisit(key: string) {
  try { document.cookie = `${key}=1; path=/; SameSite=Lax`; } catch { /* blocked - carry on */ }
  try { sessionStorage.setItem(key, 'true'); } catch { /* private mode - carry on */ }
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
