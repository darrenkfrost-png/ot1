import { PRACTITIONERS } from '../data';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronDown,
  Home,
  Search,
  Users,
  Award,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { BOOKING_URL } from '../constants';

export default function PractitionersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const FAQS = [
    {
      question: "What qualifications do your practitioners hold?",
      answer: "Our osteopaths have each completed a four-year degree in osteopathy and are registered with the General Osteopathic Council, the profession's regulator. Our acupuncturist, massage therapists, foot care specialist and hypnotherapist hold their own qualifications and registrations in their fields — each practitioner's page sets out their training."
    },
    {
      question: "How do I secure and book an appointment?",
      answer: "Booking a session takes less than 60 seconds. Click the 'Book Appointment' button at the top of any page or select any specialist's profile card to access the secure booking engine, select your required treatment, and choose a time that fits your schedule."
    },
    {
      question: "What should I expect during my first osteopathic session?",
      answer: "Your initial session is 45-60 minutes. It includes an in-depth clinical case history, an orthopedic and neurological diagnostic assessment, and a hands-on treatment where appropriate. You will also receive a personalized digital rehabilitation plan."
    },
    {
      question: "Is osteopathy covered by private health insurance?",
      answer: "Yes, our clinical sessions are recognized and covered by major health insurance providers, including AXA, Bupa, and Vitality. We recommend contacting your provider before booking to obtain a pre-authorization code."
    }
  ];


  const specialties = ['All', 'Osteopathy', 'Physiotherapy', 'Sports Therapy', 'Massage Therapy'];

  const filteredPractitioners = useMemo(() => {
    return PRACTITIONERS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeSpecialty === 'All') return matchesSearch;
      return matchesSearch && (p.role.includes(activeSpecialty) || p.specialisations?.some(s => s.includes(activeSpecialty)));
    });
  }, [searchQuery, activeSpecialty]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24">

      <header className="relative bg-slate-950 rounded-[4rem] p-12 md:p-24 text-white shadow-3xl overflow-hidden group holographic-border">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
           <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=2000" fetchPriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s]" alt="Clinical Team" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <span className="inline-flex items-center gap-3 px-5 py-2 bg-teal-500/10 backdrop-blur-md rounded-full border border-teal-400/20 text-teal-400 font-bold text-xs uppercase tracking-[0.4em] mb-4">
            <Users size={18} className="animate-pulse" /> Clinical Governance
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-medium text-white mb-6 tracking-tighter leading-[0.85]">Registered <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Clinical Domain</span></h1>
          <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl border-l-4 border-teal-500 pl-8">Meet the practitioners at the Herne Bay clinic — their training, their registrations, and what each of them treats.</p>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <ShieldCheck size={20} className="text-white" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-200">GOsC Regulated</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <Award size={20} className="text-white" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-200">{PRACTITIONERS.length} Practitioners</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] -mr-48 -mt-48"></div>
      </header>

      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/50 backdrop-blur-xl p-6 rounded-[3rem] border border-slate-100 shadow-inner">
          <div className="flex items-center flex-wrap gap-3">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setActiveSpecialty(spec)}
                className={cn(
                  "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                  activeSpecialty === spec 
                    ? "bg-teal-700 text-white shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/10" 
                    : "bg-white text-slate-400 border border-slate-100 hover:border-teal-200 hover:text-teal-600 shadow-sm"
                )}
              >
                {spec}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-[400px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
            <input
              type="text"
              aria-label="Filter practitioners by name or specialty"
              placeholder="Filter by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-8 py-4 rounded-2xl bg-white focus:bg-white border-2 border-transparent focus:border-teal-100 outline-none transition-all shadow-sm text-sm focus:ring-8 focus:ring-teal-500/5"
            />
          </div>
        </div>

        <motion.div 
          layout
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredPractitioners.map((p) => (
            <motion.div
              layout
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Link to={`/practitioners/${p.id}`} className="block group h-full">
                <div className="bg-white/60 backdrop-blur-3xl crystal-glass rounded-[2.5rem] p-7 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-premium hover:-translate-y-2 hover:border-teal-300 transition-all duration-500 h-full flex flex-col overflow-hidden holographic-border relative z-0">
                   <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-[-1]"></div>
                   <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 relative">
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-8">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Available Today</span>
                       </div>
                       <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{p.role}</span>
                       <h3 className="text-3xl font-display font-medium text-white tracking-tight">{p.name}</h3>
                    </div>
                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                       Principal Clinical Lead
                    </div>
                  </div>
                  <div className="flex-1 space-y-6 px-2">
                    <p className="text-slate-500 leading-relaxed font-light text-base line-clamp-3">{p.bio}</p>
                    <div className="space-y-3">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Focus Areas:</span>
                       <div className="flex flex-wrap gap-2">
                         {p.specialisations?.map((spec, i) => (
                           <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-100 transition-colors">{spec}</span>
                         ))}
                       </div>
                    </div>
                  </div>
                  <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between text-teal-700 px-2 group-hover:px-4 transition-all duration-500">
                    <div className="flex flex-col">
                       {/* "From £65.00" was invented. Fees come from the clinic. */}
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Appointments</span>
                       <span className="text-sm font-bold text-slate-900 group-hover:text-teal-600">Book or ask about fees</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filteredPractitioners.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-slate-100 text-slate-500 text-lg shadow-sm"
            >
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                  <Users size={32} />
                </div>
                <p>No specialists match your search criteria.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <section className="py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
           <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative group">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" alt="Clinical research and continuing professional development" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                   <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white"><BookOpen size={20} /></div>
                   <span className="text-white font-bold text-xs uppercase tracking-widest">Active Research Lab</span>
                </div>
              </div>
           </div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="order-1 lg:order-2 space-y-8">
           <div className="space-y-4">
             <span className="text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">Continuous Development</span>
             <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-50 tracking-tighter leading-tight">Beyond the Clinic:<br/><span className="text-teal-600 underline decoration-teal-100 underline-offset-8">Academic Rigor</span>.</h2>
             <p className="text-xl text-slate-300 font-light leading-relaxed">Our practitioners don't just treat; they contribute to the global clinical discourse. From publishing peer-reviewed papers to leading university seminars, we stay at the cutting edge of anatomical science.</p>
           </div>
           
           <div className="space-y-6 pt-4">
              {[
                { title: "Monthly Clinical Salons", desc: "Our team meets monthly to peer-review complex cases and share latest research findings." },
                { title: "University Partnerships", desc: "Direct links with Canterbury Christ Church University for sports science research." },
                { title: "Bespoke Training Hub", desc: "Internal education program ensuring every junior therapist meets our master-level standards." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-all shadow-sm">
                      <Sparkles size={22} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden text-center space-y-12">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight">Committed to Clinical Excellence</h2>
          <p className="text-xl text-slate-400 font-light leading-relaxed">
            Every member of our team is fully registered with their respective clinical bodies and maintains ongoing professional development.
          </p>
          {/* 15+ specialists, 10k+ patients and a 4.9 average were all stated
              without a source. These three can each be checked. */}
          <div className="flex flex-wrap justify-center gap-12 pt-8">
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">{PRACTITIONERS.length}</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Practitioners</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">2012</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Practising Since</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">5.0</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500">From 56 Google Reviews</div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </section>

      {/* Interactive FAQ & AI Voice Assistant Hub */}
      <section className="bg-slate-5/50 backdrop-blur-xl border border-slate-100 rounded-[3rem] p-8 md:p-16 space-y-12 shadow-inner">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-black uppercase text-teal-600 tracking-wider">
               <HelpCircle size={12} /> Patient Support Center
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-900 tracking-tight">
               Frequently Asked <span className="text-teal-600">Questions</span>
            </h2>
            <p className="text-slate-500 font-light text-base max-w-lg">
               Learn about the qualifications and expertise of our clinical team, and find answers to frequently asked questions about treatment.
            </p>
          </div>
        </div>

        <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = expandedFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "bg-white rounded-3xl border transition-all duration-300 shadow-sm",
                    isOpen ? "border-teal-200/60 shadow-lg shadow-teal-500/5 ring-4 ring-teal-500/5" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <button
                    id={`faq-btn-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${index}`}
                    onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setExpandedFaqIndex(isOpen ? null : index);
                      }
                    }}
                    className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-6 hover:text-teal-600 transition-colors focus-visible:outline-teal-500/20 rounded-t-3xl cursor-pointer"
                  >
                    <span className="font-display font-medium text-lg md:text-xl text-slate-900 tracking-tight text-left">
                      {faq.question}
                    </span>
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-all duration-300",
                      isOpen ? "bg-teal-500 border-teal-500 text-white rotate-180" : "text-slate-500"
                    )}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-content-${index}`}
                        role="region"
                        aria-labelledby={`faq-btn-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 pt-0 md:pt-0 border-t border-slate-50 text-slate-500 leading-relaxed font-light text-base space-y-4">
                           <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: ShieldCheck, title: "Regulated Care", desc: "Our osteopaths are registered with the General Osteopathic Council." },
          { icon: Zap, title: "Modern Science", desc: "We use evidence-based methods and state-of-the-art tech." },
          { icon: Heart, title: "Patient First", desc: "We prioritize your comfort and long-term joint health." },
          { icon: Sparkles, title: "One clinic", desc: "180 High Street, Herne Bay — the same team every visit." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <item.icon size={24} />
            </div>
            <h4 className="font-bold text-slate-900 text-lg tracking-tight">{item.title}</h4>
            <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
