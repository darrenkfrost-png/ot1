import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'gradient';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 40,
  variant = 'gradient'
}) => {
  return (
    <div 
      className={cn("relative flex items-center justify-center cursor-pointer group", className)}
      style={{ width: size, height: size, perspective: '1000px' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full h-full flex items-center justify-center relative"
      >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl scale-150 animate-pulse" />
          
          <div className={cn(
            "w-full h-full rounded-[28%] flex items-center justify-center shadow-xl border-2 transition-all duration-500",
            variant === 'light' ? "bg-white border-white/20 text-teal-600" : 
            variant === 'dark' ? "bg-slate-900 border-slate-800 text-teal-400" :
            "bg-slate-950 border-teal-500/30 text-teal-400 shadow-teal-500/10"
          )}>
            <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] drop-shadow-lg font-display">
                {/* Outer Circle Ring */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="opacity-20" />
                
                {/* Text CT6 */}
                <text 
                  x="50" 
                  y="53" 
                  fill="currentColor" 
                  fontSize="38" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  alignmentBaseline="middle"
                  style={{ userSelect: 'none' }}
                >
                  CT6
                </text>
            </svg>
          </div>
      </motion.div>
      
      {/* Interaction Ripple */}
      <div className="absolute inset-0 rounded-full border border-teal-500/0 group-hover:border-teal-500/20 group-hover:scale-125 transition-all duration-700 pointer-events-none" />
    </div>
  );
};

export default Logo;
