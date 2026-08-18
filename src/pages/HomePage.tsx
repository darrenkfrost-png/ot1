import React, { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';
import { 
  Calendar, Users, Phone, BookOpen, Clock, MapPin, Activity, Sparkles,
  ChevronRight, ShieldCheck, Zap, ArrowRight, TrendingUp, Brain, Award,
  Video, FileText, Smartphone, CheckCircle2, ScanFace, MousePointerClick, ExternalLink,
  Stethoscope, MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TREATMENTS, PRACTITIONERS } from '../data';
import { BOOKING_URL, CLINIC } from '../constants';
import { REVIEWS, REVIEWS_SOURCE } from '../data/reviews';
import { VIDEOS } from '../data/resources';
import { GALLERY_IMAGES } from '../data/images';

export default function HomePage() {
  const { showToast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Reveal animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  return (
    <div className="space-y-32 max-w-7xl mx-auto pb-48">

      {/* Hero Section - Elevated Cinematic */}
      <section ref={heroRef} className="relative rounded-[4rem] overflow-hidden min-h-[850px] flex flex-col justify-center p-8 sm:p-16 lg:p-32 text-white shadow-glow-teal group holographic-border">
        <motion.div 
           style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
           className="absolute inset-0 z-0 bg-slate-900 overflow-hidden"
        >
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.92 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1706353399656-210cca727a33?auto=format&fit=crop&q=85&w=2400"
            alt={`Osteopath treating a patient at ${CLINIC.name}`}
            fetchPriority="high"
            decoding="async"
            width={2400}
            height={1350}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[40s] ease-linear"
          />
          <div className="absolute inset-0 neural-grid opacity-[0.15] mix-blend-screen mix-blend-lighten pointer-events-none"></div>
          {/* The left-to-right wash is what keeps the headline legible, so it stays
              strong. The full-width top/bottom washes were stacked on top of it and
              between them the photograph was crushed to near-black — softened so the
              treatment room is actually visible. */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 to-transparent"></div>
          
          {/* Animated Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </motion.div>
        
        <div className="relative z-10 max-w-5xl space-y-12">
          <motion.div
             variants={staggerContainer}
             initial="hidden"
             animate="show"
          >
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
               <span className="px-6 py-2.5 rounded-full bg-teal-500/15 backdrop-blur-xl border border-teal-400/25 text-teal-100 text-[11px] font-black tracking-[0.4em] inline-flex items-center gap-3 shadow-[0_0_20px_rgba(20,184,166,0.2)] uppercase">
                 <Sparkles size={14} className="text-teal-300 animate-pulse" /> The Gold Standard
               </span>
            </motion.div>
            
            {/* "Transformative." is the longest word here and at text-6xl it ran off
                the right edge of a 375px phone. Scaled from the viewport so the word
                always fits, capped at the old desktop size. */}
            <motion.h1 variants={fadeInUp} className="text-[clamp(2.5rem,11vw,8rem)] font-display font-medium tracking-tighter leading-[0.85] text-white mb-10 drop-shadow-2xl">
              Precise. Clinical. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500 bg-300% animate-gradient-x drop-shadow-sm">Transformative.</span>
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="relative inline-block">
               <p className="text-xl md:text-3xl text-slate-300/90 max-w-2xl leading-relaxed font-light border-l-[6px] border-teal-500 pl-8 drop-shadow-sm opacity-90">
                 Osteopathy, acupuncture, massage and foot care in Herne Bay, from practitioners registered with their professional bodies.
               </p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-8"
          >
            <div className="w-full sm:w-auto flex flex-col items-center gap-2">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xl transition-all shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] hover:-translate-y-1.5 active:scale-[0.98] flex items-center justify-center gap-4 group cinematic-glow"
                aria-label="Book an assessment — opens our booking system in a new tab"
              >
                <Calendar size={22} className="group-hover:rotate-12 transition-transform" />
                Book Assessment
                <ExternalLink size={16} className="opacity-70" aria-hidden="true" />
              </a>
              <span className="text-[11px] text-white/50 font-medium tracking-wide">
                Opens our secure booking system in a new tab
              </span>
            </div>
            <Link to="/treatments" className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 text-white font-semibold text-lg transition-all hover:border-white/30 flex items-center justify-center gap-4 group/btn shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]">
              Our Specialties <ChevronRight size={18} className="opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Light Trails Effect */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden hidden lg:block mix-blend-screen">
           <div className="absolute top-1/4 right-0 w-px h-64 bg-gradient-to-b from-transparent via-teal-500/80 to-transparent blur-[2px] animate-pulse shadow-[0_0_20px_rgba(20,184,166,1)]"></div>
           <div className="absolute top-1/2 right-24 w-[2px] h-96 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent blur-[4px] animate-pulse shadow-[0_0_40px_rgba(16,185,129,1)]" style={{ animationDelay: '1s' }}></div>
           <div className="absolute bottom-1/4 right-12 w-px h-48 bg-gradient-to-b from-transparent via-teal-400/60 to-transparent blur-[2px] animate-pulse shadow-[0_0_20px_rgba(45,212,191,1)]" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 hidden sm:flex pointer-events-none"
        >
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Scroll to Explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
             <motion.div 
                animate={{ y: [0, 48] }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                className="w-full h-1/2 bg-teal-400 blur-[2px]"
             />
           </div>
        </motion.div>
      </section>

      {/* Quick Access Grid - Supreme Glassmorphism */}
      <motion.section 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {[
          { label: "Clinical Booking", icon: Calendar, path: "/treatments", color: "bg-teal-700 border-teal-500 text-white shadow-[0_0_40px_rgba(20,184,166,0.2)]", sub: "Priority Scheduling", desc: "Instant confirmation for all clinics.", hoverColor: "group-hover:bg-teal-800" },
          { label: "Our Treatments", icon: Stethoscope, path: "/treatments", color: "bg-slate-900 border-slate-700 text-white shadow-xl", sub: "What We Offer", desc: "Osteopathy, acupuncture, massage, foot care.", hoverColor: "group-hover:bg-slate-800" },
          { label: "Meet the Team", icon: Users, path: "/practitioners", color: "bg-white/95 backdrop-blur-3xl border-white/40 text-slate-900 shadow-premium", sub: "Expert Practitioners", desc: "View clinical backgrounds.", hoverColor: "group-hover:bg-white" },
          { label: "Patient Dashboard", icon: Activity, path: "/dashboard", color: "bg-white/95 backdrop-blur-3xl border-white/40 text-slate-900 shadow-premium", sub: "Recovery Hub", desc: "Track your health progress.", hoverColor: "group-hover:bg-white" }
        ].map((action, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Link 
              to={action.path} 
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all duration-700 group flex flex-col justify-between h-64 relative overflow-hidden block", 
                action.color,
                action.hoverColor
              )}
            >
               <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-0"></div>
               {/* Animated sweep overlay */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
               
               <div className="relative z-10 flex flex-col h-full justify-between transform group-hover:translate-y-[-4px] transition-transform duration-500">
                 <div>
                   <div className={cn(
                     "w-14 h-14 rounded-[1.2rem] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg",
                     action.color.includes('white') ? "bg-teal-50 text-teal-600 border border-teal-100/50" : "bg-white/10 text-white border border-white/20 backdrop-blur-md"
                   )}>
                     <action.icon size={28} />
                   </div>
                   <h4 className="font-display font-bold text-2xl tracking-tight leading-tight mb-2 drop-shadow-sm">{action.label}</h4>
                   <p className={cn("text-[10px] font-black uppercase tracking-[0.25em]", action.color.includes('bg-teal') || action.color.includes('bg-slate') ? "text-white/90" : "text-teal-700")}>{action.sub}</p>
                 </div>
                 {/*
                   * These cards are translucent, so the colour behind the text
                   * is the card blended with the dark page - rgb(159,162,170)
                   * for the pale ones - not the page and not white. Measured
                   * against that real backdrop, grey-500 came out at 1.86:1
                   * and the 60% white at 3.01:1, both well under the 4.5:1
                   * floor. Grey-800 gives 5.73:1 and 90% white 4.76:1.
                   */}
                 <p className={cn("text-sm font-medium relative z-10 line-clamp-2", action.color.includes('white') ? "text-slate-800" : "text-white/90")}>{action.desc}</p>
               </div>
               
               {/* Background Decoration */}
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:scale-[2] transition-transform duration-[1.5s] ease-out"></div>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* The CT6 Method - Advanced Parallax Typography */}
      <section className="py-20 border-y border-slate-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[600px] bg-slate-50/50 -z-10 skew-y-3"></div>
        <div className="absolute -left-64 top-0 w-128 h-128 bg-teal-500/5 rounded-full blur-[160px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative z-10">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="lg:border-r border-slate-100 pr-8 space-y-8"
           >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full border border-teal-100/50">
                 <MousePointerClick size={14} />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">The CT6 Standard</span>
              </div>
              <h2 className="text-5xl font-display font-medium tracking-tight text-slate-950 leading-[1.1]">A Multi-Tiered Approach to <span className="underline decoration-teal-300 underline-offset-8">Longevity</span>.</h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                We do not mask symptoms. We mathematically isolate the mechanical root cause and engineer recovery pathways that prioritize long-term physiological resilience.
              </p>
              <div className="pt-6">
                 <Link to="/resources" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest group shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all">
                    View Methodology Whitepaper <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </motion.div>

           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { 
                  step: "01", 
                  title: "Biological Mapping", 
                  desc: "We utilize advanced anatomical diagnostics to map your current physiological baseline, identifying the mechanical root cause.",
                  icon: ScanFace
                },
                { 
                  step: "02", 
                  title: "Precision Rehab", 
                  desc: "Implementation of data-backed protocols, combining clinical manual therapy with specific, reactive loading strategies.",
                  icon: Zap
                },
                { 
                  step: "03", 
                  title: "Structural Mastery", 
                  desc: "Final stage integration where we optimize your daily biomechanics to ensure the issue never returns.",
                  icon: ShieldCheck
                }
              ].map((m, i) => (
                <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.2, duration: 0.8 }}
                   className="space-y-6 relative group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-teal-100 transition-all duration-500 overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full mr-[-4rem] mt-[-4rem] group-hover:scale-150 transition-transform duration-700"></div>
                   
                   <div className="text-8xl font-display font-black text-slate-50 absolute -top-4 -right-4 -z-0 group-hover:text-teal-50 transition-colors pointer-events-none select-none tracking-tighter">{m.step}</div>
                   
                   <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 relative z-10 border-2 border-slate-800">
                      <m.icon size={24} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-12 relative z-10 group-hover:text-teal-700 transition-colors">{m.title}</h3>
                   <div className="w-6 h-1 bg-teal-500 rounded-full relative z-10"></div>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">{m.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Real-Time Health Insights - Holographic Frame */}
      <section className="bg-white/95 backdrop-blur-3xl crystal-glass rounded-[4rem] p-6 sm:p-12 lg:p-20 shadow-[0_20px_60px_-15px_rgba(31,38,135,0.1)] border border-white/80 relative overflow-hidden holographic-border">
        <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-0"></div>
        <div className="absolute -top-[50%] -left-[10%] w-[120%] h-[200%] bg-gradient-to-br from-teal-500/5 via-transparent to-blue-500/5 pointer-events-none z-0 transform -rotate-12 blur-3xl"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 space-y-10 order-2 lg:order-1"
            >
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-teal-50 text-teal-600 font-bold text-[10px] uppercase tracking-[0.3em] border border-teal-100 shadow-sm">
                    <TrendingUp size={16} /> Live Telemetry
                  </span>
                  <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-[1.1]">
                    Real-time Data for <br/> <span className="relative inline-block"><span className="relative z-10 text-slate-950">Peak Performance</span><div className="absolute bottom-2 left-0 right-0 h-4 bg-teal-300/40 -z-0 -rotate-2"></div></span>.
                  </h2>
                  <p className="text-xl text-slate-400 font-light leading-relaxed max-w-md drop-shadow-sm">
                    Our interconnected ecosystem monitors local clinic activity, success rates, and availability to give you the most accurate triage and recovery pathway.
                  </p>
                </div>

                <div className="space-y-8 bg-white/50 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm">
                    {/* Checkable figures only. A 98.4% recovery rate and a
                        4.9/5 satisfaction score were stated here with nothing
                        behind them; the real Google rating is better anyway. */}
                    {[
                      { label: "Google rating", value: "5.0", color: "teal", delay: 0.2 },
                      { label: "Reviews", value: "56", color: "emerald", delay: 0.4 },
                      { label: "Practising since", value: "2012", color: "blue", delay: 0.6 }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                            <span>{stat.label}</span>
                            <span className={`text-${stat.color}-600 font-black`}>{stat.value}</span>
                         </div>
                         <div className="h-2.5 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: '90%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: stat.delay, ease: "easeOut" }}
                              className={cn("h-full rounded-full relative overflow-hidden", stat.color === 'teal' ? "bg-teal-500" : stat.color === 'emerald' ? "bg-emerald-500" : "bg-blue-500")}
                            >
                               <div className="absolute inset-0 bg-white/30 w-1/4 -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </motion.div>
                         </div>
                      </div>
                    ))}
                </div>

                <Link to="/practitioners" className="inline-flex items-center gap-4 bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(15,23,42,0.2)] group">
                    Meet the Practitioners <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="lg:col-span-7 order-1 lg:order-2 grid grid-cols-2 gap-6 pb-8 lg:pb-0 relative"
            >
               {/* Decorative grid lines */}
               <div className="absolute inset-0 grid grid-cols-2 gap-6 pointer-events-none">
                  <div className="border-r-2 border-b-2 border-slate-100 rounded-br-[3rem] w-full h-full opacity-50"></div>
                  <div className="border-b-2 border-slate-100 w-full h-full opacity-50"></div>
               </div>

               {[
                 { icon: Award, label: "Regulated", val: "GOsC Registered", desc: "General Osteopathic Council." },
                 { icon: ShieldCheck, label: "Insurance", val: "Check your policy", desc: "Many insurers cover osteopathy." },
                 { icon: Clock, label: "Open", val: "Mon–Sat", desc: "Weekdays 8am–8pm." },
                 { icon: MapPin, label: "Location", val: "Herne Bay", desc: "180 High Street, CT6 5AJ." }
               ].map((item, i) => (
                 <div key={i} className="bg-white/80 backdrop-blur-sm border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-teal-100 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 group-hover:bg-teal-50/50 transition-all duration-700 -z-10"></div>
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[1.2rem] shadow-sm flex items-center justify-center text-slate-800 mb-6 group-hover:scale-110 group-hover:bg-teal-700 group-hover:text-white transition-all duration-500 group-hover:border-transparent">
                      <item.icon size={26} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 mb-2">{item.label}</p>
                    <h3 className="font-display font-medium text-2xl text-slate-900 mb-2">{item.val}</h3>
                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                 </div>
               ))}
            </motion.div>
        </div>
        
        {/* Background Aura */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      </section>

      {/* Specialists Spotlight - Elevated */}
      <section className="space-y-16 relative">
        <div className="absolute -left-32 top-1/2 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-slate-900/20">
                <Users size={16} className="text-teal-400" /> Clinical Faculty
              </div>
              <h2 className="text-6xl font-display font-medium text-slate-50 tracking-tight leading-[1.05]">The Elite Roster.</h2>
              <p className="text-2xl text-slate-400 font-light max-w-2xl leading-relaxed">Our practitioners are relentlessly vetted for their deep anatomical mastery and commitment to evidence-based protocol.</p>
            </motion.div>
            <Link to="/practitioners" className="shrink-0 px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-950 hover:border-slate-950 hover:text-white transition-all shadow-premium flex items-center gap-3 group">
              View All Experts <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {PRACTITIONERS.slice(0, 4).map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
              className="group relative"
            >
               <Link to={`/practitioners/${p.id}`} className="block">
                  <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden mb-6 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] group-hover:shadow-[0_25px_50px_-12px_rgba(20,184,166,0.3)] transition-all duration-700">
                      <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>
                      
                      <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                         <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-xl inline-block mb-3 shadow-lg">
                            <span className="text-teal-300">{p.role.split(' ')[0]}</span> Specialist
                         </div>
                         <h3 className="text-3xl font-display font-medium text-white mb-2">{p.name}</h3>
                         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-none">{p.role}</p>
                      </div>
                  </div>
                  <div className="px-4 flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                     <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Available Today</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 -rotate-45 group-hover:rotate-0">
                        <ArrowRight size={16} />
                     </div>
                  </div>
               </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Treatment Modules - Dark Cinematic */}
      <section className="bg-slate-950 rounded-[4rem] p-8 sm:p-16 lg:p-24 text-white relative overflow-hidden holographic-border shadow-2xl">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0 opacity-30">
           <div className="absolute inset-0 neural-grid opacity-40 mix-blend-screen pointer-events-none"></div>
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 left-1/4 w-[1000px] h-[1000px] bg-teal-500/20 rounded-full blur-[200px]"
           />
           <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px]"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="max-w-4xl mb-24 space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-teal-500/10 backdrop-blur-md rounded-full border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <Activity size={16} className="animate-pulse" /> Clinical Specializations
            </div>
            <h2 className="text-6xl md:text-8xl font-display font-medium leading-[0.9] tracking-tighter drop-shadow-lg">
              Engineered for Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Total Structural Resilience</span>.
            </h2>
            <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl border-l-4 border-teal-500/30 pl-6">
              From acute spinal trauma to sports performance optimization, our specialized modules deliver highly specific reactive loaded protocols that get documented, permanent results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TREATMENTS.slice(0, 4).map((t, i) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative flex flex-col lg:flex-row bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-[3rem] overflow-hidden hover:bg-slate-800/80 hover:border-teal-500/30 transition-all duration-700 cursor-pointer shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                  <div className="lg:w-56 overflow-hidden shrink-0 relative">
                      <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay z-10"></div>
                      <img src={t.image} alt={t.title} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                  </div>
                  <div className="p-10 space-y-6 flex-1 flex flex-col justify-between relative z-20">
                      <div>
                          <div className="flex justify-between items-start mb-4">
                             <h3 className="text-3xl font-display font-medium text-white group-hover:text-teal-400 transition-colors tracking-tight">{t.title}</h3>
                             <span className="shrink-0 px-3 py-1 bg-slate-950/50 rounded-lg text-teal-400 text-[9px] font-black uppercase tracking-[0.3em] border border-slate-800 shadow-inner">Module {i + 1}</span>
                          </div>
                          <p className="text-slate-400 text-sm font-light leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">{t.desc}</p>
                          <ul className="grid grid-cols-2 gap-4 pb-2">
                             {["Clinical Assessment", "Targeted Rehab", "Digital Plan", "Support Hub"].map((item, idx) => (
                               <li key={idx} className="flex items-center gap-2 text-[10px] font-black text-slate-300 group-hover:text-slate-200 uppercase tracking-widest transition-colors">
                                  <CheckCircle2 size={12} className="text-teal-500" /> {item}
                               </li>
                             ))}
                          </ul>
                      </div>
                      <Link to={`/treatments/${t.id}`} className="mt-6 inline-flex items-center justify-between w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-widest text-white group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-400 transition-all duration-500">
                        <span>Read about this treatment</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-teal-400 transition-colors">
                            <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                      </Link>
                  </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-24 pt-12 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-10">
             <div className="flex items-center gap-10 p-6 bg-slate-900/50 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md">
                <div className="flex -space-x-4">
                   {PRACTITIONERS.slice(0, 5).map((p, idx) => (
                     <img key={idx} src={p.image} alt={p.name} loading="lazy" decoding="async" width={56} height={56} className="w-14 h-14 rounded-full border-2 border-slate-900 object-cover shadow-xl hover:scale-110 hover:z-10 transition-transform relative cursor-pointer" />
                   ))}
                </div>
                <div className="pr-6">
                   <p className="text-sm font-bold text-white uppercase tracking-widest mb-1">One team</p>
                   <p className="text-xs text-slate-400 font-light tracking-wide">{PRACTITIONERS.length} practitioners, all at the Herne Bay clinic.</p>
                </div>
             </div>
             <Link to="/treatments" className="px-14 py-6 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 text-white font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] hover:bg-white hover:text-slate-950 transition-all shadow-xl shadow-slate-950/50 active:scale-95 leading-none flex items-center gap-4 group">
                Browse Full Clinical Menu <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* Patient Education & Resources */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 relative">
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-multiply"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
            <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em] shadow-sm">
                  <BookOpen size={16} className="text-teal-600" /> Knowledge Center
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-medium text-slate-900 leading-[1.05] tracking-tight">
                  Your Health, <br/>
                  <span className="relative">
                    <span className="relative z-10 text-teal-600">Fully Mastered</span>
                    <svg className="absolute w-full h-4 -bottom-1 left-0 text-teal-200/50 -z-0" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q50 20 100 10" fill="none" stroke="currentColor" strokeWidth="8"/></svg>
                  </span>.
                </h2>
                <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-xl">
                  We believe a well-informed patient recovers exponentially faster. Access our technical hub to maintain your physical resilience at home.
                </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-2xl">
               {[
                 { icon: Video, title: "Video Masterclasses", count: `${VIDEOS.length} films`, desc: "Step-by-step guidance on postural correction and biomechanics." },
                 { icon: FileText, title: 'Illustrated Guides', count: `${GALLERY_IMAGES.length} illustrated guides`, desc: "Detailed breakdowns of spinal health and joint longevity." },
                 { icon: Stethoscope, title: "Exercise Plans", count: "Per Patient", desc: "The home exercises your practitioner sets for you." },
                 { icon: Smartphone, title: "Mobile Ready", count: "Always On", desc: "Access your clinical data and advice from any device." }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="flex gap-5 group cursor-pointer p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                 >
                    <div className="shrink-0 w-16 h-16 rounded-[1.2rem] bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50 group-hover:bg-teal-700 group-hover:text-white transition-all duration-500">
                      <item.icon size={26} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1 mt-1">
                      <h4 className="font-bold text-[17px] text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight">{item.title}</h4>
                      <div className="flex items-center gap-2 mb-1.5">
                         <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                         <p className="text-[9px] font-black text-teal-600 uppercase tracking-[0.2em]">{item.count}</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>

            <Link to="/resources" className="mt-8 inline-flex items-center gap-4 px-10 py-5 bg-slate-900 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 group">
              Explore Resource Hub <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative group h-full min-h-[600px] flex items-center"
        >
           <div className="w-full aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl shadow-slate-900/10 border-8 border-white relative z-10">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" alt="Specialist Consulting" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s] ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              
              {/* Floating Review Card - Glassmorphism */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 left-10 right-10 p-10 bg-white/10 backdrop-blur-3xl border border-white/30 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
              >
                  <div className="flex items-center gap-2 mb-6">
                     {[...Array(5)].map((_, i) => <Sparkles key={i} size={16} className="text-teal-300 drop-shadow-md fill-teal-400/50" />)}
                  </div>
                  {/* A real Google review. This card used to carry a quote from
                      "Richard James, Post-Operative Rehab" — a patient who does
                      not exist, praising the software rather than the treatment.
                      Inventing a testimonial for a healthcare practice is not a
                      placeholder, it is a false claim, so it is sourced now and
                      links out to the listing it came from. */}
                  <p className="text-white text-2xl font-display font-medium leading-relaxed drop-shadow-sm">
                    “{REVIEWS[6].quote}”
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 border-2 border-white/50 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg">
                        {REVIEWS[6].author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                     </div>
                     <div>
                        <p className="text-white text-base font-bold drop-shadow-md">{REVIEWS[6].author}</p>
                        <a
                          href={REVIEWS_SOURCE.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-300 hover:text-teal-200 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 inline-flex items-center gap-1.5 transition-colors"
                        >
                          {REVIEWS_SOURCE.label} <ExternalLink size={9} />
                        </a>
                     </div>
                  </div>
              </motion.div>
           </div>
           
           <div className="absolute top-10 -right-10 w-64 h-64 bg-teal-500/15 rounded-full blur-[80px] animate-pulse"></div>
           <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
           <div className="absolute -top-10 -left-10 w-32 h-32 bg-slate-900 rounded-[2rem] -rotate-12 -z-10 group-hover:rotate-12 transition-transform duration-1000 opacity-10"></div>
        </motion.div>
      </section>

      {/* Clinic Locations & Contact - Premium Layout */}
      <section id="contact" className="space-y-16 py-20 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,1)_20%,rgba(248,250,252,1)_80%,transparent)] -z-10"></div>
        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-500 font-bold text-xs uppercase tracking-[0.4em] shadow-sm">
              <MapPin size={16} className="text-teal-600" /> Clinical Reach
            </span>
            <h2 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-tight">Where to <br/>find us.</h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
              One clinic, on the High Street in Herne Bay.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {[
              {
                id: "herne-bay",
                location: `${CLINIC.address.town} (${CLINIC.address.postcode.split(' ')[0]})`,
                address: `${CLINIC.address.line1}, ${CLINIC.address.postcode}`,
                hours: CLINIC.openingHours.map((s) => `${s.days}: ${s.hours}`).join(' · '),
                phone: CLINIC.telephone,
                features: ["Osteopathy", "Acupuncture", "Sports Massage", "Foot Care"]
              }
            ].map((clinic, i) => (
              <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.2 }}
                 className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[3.5rem] p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(20,184,166,0.15)] hover:border-teal-200 transition-all duration-500 group relative overflow-hidden"
              >
                  <div className="absolute -right-24 -top-24 w-64 h-64 bg-slate-50 rounded-full group-hover:scale-[2] group-hover:bg-teal-50/40 transition-transform duration-[1.5s] -z-10 ease-out"></div>
                  
                  <div className="flex justify-between items-start mb-10">
                      <div className="w-20 h-20 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center group-hover:bg-teal-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border-4 border-white">
                          <MapPin size={32} />
                      </div>
                      <span className="px-5 py-2.5 bg-white border border-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">Ready for Admittance</span>
                  </div>
                  <h3 className="text-3xl font-display font-medium text-slate-900 mb-3 tracking-tight">{clinic.location}</h3>
                  <p className="text-slate-500 font-medium text-lg mb-8">{clinic.address}</p>
                  
                  <div className="space-y-5 mb-12 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:border-teal-50 transition-colors">
                      <div className="flex items-center gap-4 text-base text-slate-600 font-medium">
                          <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={18} className="text-teal-600" /></div>
                          <span>{clinic.hours}</span>
                      </div>
                      <div className="flex items-center gap-4 text-base text-slate-900 font-bold">
                          <div className="p-2 bg-white rounded-xl shadow-sm"><Phone size={18} className="text-teal-600" /></div>
                          <span>{clinic.phone}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-12 px-2">
                      {clinic.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-black text-slate-400 group-hover:text-slate-500 uppercase tracking-widest transition-colors">
                            <CheckCircle2 size={14} className="text-teal-500" /> {f}
                        </div>
                      ))}
                  </div>

                  <div className="flex flex-col xl:flex-row gap-4 mt-auto">
                    {/* Said "Dialing … clinical intake" and dialled nothing. */}
                    <Link
                      to="/contact"
                      className="flex-1 py-5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[#10px] transition-all shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:-translate-y-1 flex items-center justify-center gap-3 group/btn"
                    >
                      Contact Intake <Phone size={16} className="group-hover/btn:rotate-12 transition-transform" />
                    </Link>
                    <Link 
                      to="/locations"
                      className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[#10px] transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      Full Details <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
              </motion.div>
            ))}
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-slate-950 rounded-[4rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden border border-slate-800 shadow-2xl holographic-border mt-16"
        >
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 neural-grid opacity-20 mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3"></div>
            </div>
            
            <div className="relative z-10 space-y-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                   <Video size={14} /> Telehealth Access
                </div>
                <h3 className="text-5xl md:text-6xl font-display font-medium text-white leading-[1.05] tracking-tight">Cannot visit in person?</h3>
                <p className="text-xl text-slate-400 font-light leading-relaxed">
                  We deploy secure digital clinical consultations for initial triage and rehabilitation monitoring. Speak with a structural engineer from your own environment.
                </p>
                <div className="flex flex-wrap gap-6 pt-4">
                    <Link to="/contact" className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-transparent hover:bg-teal-50 transition-all flex items-center gap-3 shadow-xl hover:-translate-y-1">
                       Ask us a question <MessageSquare size={18} className="text-teal-600" />
                    </Link>
                    <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-slate-950 hover:border-white transition-all shadow-lg flex items-center gap-3 hover:-translate-y-1"
                      aria-label="Book a video consultation — opens our booking system in a new tab"
                    >
                       Book Secure Video <Video size={18} />
                    </a>
                </div>
            </div>
            <div className="relative lg:w-1/3 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group cursor-pointer z-10">
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" alt="Video Consult" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-teal-900/40 to-transparent mix-blend-overlay group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white group-hover:bg-teal-500 group-hover:border-teal-400 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                   </div>
                </div>
            </div>
        </motion.div>
      </section>

      {/* Supreme CTA Banner - Final Masterpiece */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative rounded-[5rem] overflow-hidden p-12 sm:p-24 lg:p-32 text-center bg-slate-950 border border-slate-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] group holographic-border"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
           <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
           <div className="absolute inset-0 neural-grid opacity-[0.15] mix-blend-screen pointer-events-none"></div>
           
           {/* Animated glowing orbs */}
           <motion.div 
             animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} 
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-48 -right-48 w-[800px] h-[800px] bg-teal-600/20 rounded-full blur-[180px]"
           />
           <motion.div 
             animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }} 
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px]"
           />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-16">
          <div className="space-y-10">
              <span className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 text-teal-400 text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                 <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div> Secure Your Assessment Today
              </span>
              <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-display font-medium text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
                Unlock Your Body's <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500 bg-300% animate-gradient-x drop-shadow-sm">True Infinite Potential.</span>
              </h2>
              <p className="text-2xl lg:text-3xl text-slate-400 mx-auto font-light leading-relaxed max-w-3xl opacity-90 drop-shadow-md">
                Book an assessment at the clinic on Herne Bay High Street, and find out what is actually going on.
              </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto h-24 px-16 bg-teal-500 text-slate-950 rounded-[3rem] font-black text-xl uppercase tracking-widest shadow-[0_0_60px_rgba(20,184,166,0.3)] hover:shadow-[0_0_80px_rgba(20,184,166,0.5)] hover:bg-teal-400 hover:-translate-y-2 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-5 border border-teal-300/50"
              aria-label="Book an appointment — opens our booking system in a new tab"
            >
              Book an appointment <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </a>
            <Link to="/contact" className="w-full sm:w-auto h-24 px-14 bg-white/5 backdrop-blur-3xl text-white border border-white/15 hover:border-white/30 rounded-[3rem] font-bold text-xl hover:bg-white/10 transition-all flex items-center justify-center gap-5 group shadow-2xl hover:-translate-y-1">
              Talk to us first <MessageSquare size={26} className="text-teal-400 group-hover:rotate-12 transition-transform opacity-80 group-hover:opacity-100" />
            </Link>
          </div>

          <div className="pt-16 flex flex-col sm:flex-row items-center justify-center gap-12 lg:gap-20 border-t border-white/10">
             <div className="flex flex-col items-center gap-3">
                <span className="text-white font-display font-medium text-3xl tracking-tight">08:00 <span className="opacity-40">-</span> 20:00</span>
                <span className="text-teal-500/80 text-[10px] uppercase tracking-[0.3em] font-black">Mon - Fri • Clinical Hours</span>
             </div>
             <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
             <div className="flex flex-col items-center gap-3">
                <span className="text-white font-display font-medium text-3xl tracking-tight">CT6 5AJ</span>
                <span className="text-teal-500/80 text-[10px] uppercase tracking-[0.3em] font-black">Herne Bay High Street</span>
             </div>
             <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
             <div className="flex flex-col items-center gap-3">
                <span className="text-white font-display font-medium text-3xl tracking-tight">GOsC</span>
                <span className="text-teal-500/80 text-[10px] uppercase tracking-[0.3em] font-black">Registered Osteopaths</span>
             </div>
          </div>
        </div>
      </motion.section>

      {/* Style support for animated background and premium effects */}
      <style dangerouslySetInnerHTML={{__html: `
        /* gradient-x now lives in index.css so every page has it, not just
           this one while it happens to be mounted. */
        @keyframes shimmer {
          100% { transform: translateX(400%); }
        }
        .bg-300\\% { background-size: 300% 100%; }
        .holographic-border {
          position: relative;
        }
        .holographic-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(120deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 30%, rgba(20,184,166,0.2) 70%, rgba(20,184,166,0.6));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}} />
    </div>
  );
}
