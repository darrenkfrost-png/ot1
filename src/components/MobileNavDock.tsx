import { Link, useLocation } from 'react-router-dom';
import { Home, HeartPulse, Users, Mic, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { BOOKING_URL } from '../constants';
import { motion } from 'motion/react';

export default function MobileNavDock() {
  const location = useLocation();
  const { trackClick } = useAnalytics();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Treatments', path: '/treatments', icon: HeartPulse },
    { label: 'Team', path: '/practitioners', icon: Users },
  ];

  const handleVoiceTrigger = () => {
    trackClick("Mobile Dock Voice Trigger");
    const event = new CustomEvent('open-voice-consultation');
    window.dispatchEvent(event);
  };

  const handleBookTrigger = () => {
    trackClick("Mobile Dock Book Now");
    window.open(BOOKING_URL, '_blank');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[51] lg:hidden">
      <div className="bg-slate-950/80 backdrop-blur-3xl crystal-glass border border-white/10 rounded-[2rem] py-2.5 px-4 shadow-premium-lg flex items-center justify-between gap-2 max-w-lg mx-auto relative overflow-hidden holographic-border">
        {/* Fine gold/teal holographic line sweep */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-500/55 to-transparent"></div>
        
        {/* Bottom Dock Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative",
                  isActive ? "text-teal-400 font-bold" : "text-slate-400 hover:text-white"
                )}
                onClick={() => trackClick(`Mobile Dock Nav: ${item.label}`)}
              >
                <item.icon size={19} className={cn("transition-transform duration-300", isActive ? "scale-110 text-teal-400" : "")} />
                <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center scale-90">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="dock-active-indicator"
                    className="absolute -bottom-0.5 w-1 h-1 bg-teal-400 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sleek separator line */}
        <div className="w-[1px] h-8 bg-white/10 shrink-0 mx-1"></div>

        {/* Action button collection */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Voice Command Button */}
          <button
            onClick={handleVoiceTrigger}
            aria-label="Talk to the symptom guide"
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-teal-400 hover:text-teal-300 transition-all hover:bg-white/5 cursor-pointer relative group shrink-0"
          >
            <div className="relative">
              <Mic size={19} className="group-hover:scale-110 transition-all text-teal-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-center scale-90 text-teal-400">Voice AI</span>
          </button>

          {/* Book Now persistent Call To Action */}
          <button
            onClick={handleBookTrigger}
            aria-label="Book appointment now"
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer border border-teal-400/20 flex-1 max-w-[130px] whitespace-nowrap"
          >
            <Calendar size={13} className="animate-pulse" />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
