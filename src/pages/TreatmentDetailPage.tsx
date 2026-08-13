import { useParams, Link } from 'react-router-dom';
import { TREATMENTS, PRACTITIONERS } from '../data';
import { BOOKING_URL } from '../constants';
import { 
  ChevronRight, 
  CheckCircle2, 
  Home, 
  Clock, 
  Users, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Heart,
  Zap,
  Waves,
  RefreshCcw,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../components/ToastSystem';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group transition-all"
      >
        <span className={cn("font-semibold transition-colors", isOpen ? "text-teal-600" : "text-slate-800")}>{question}</span>
        <div className={cn("transition-transform duration-300", isOpen ? "rotate-180 text-teal-600" : "text-slate-400 group-hover:text-slate-600")}>
          <ChevronRight size={18} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="py-4 text-slate-500 font-light leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function TreatmentDetailPage() {
  const { id } = useParams();
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();
  const t = TREATMENTS.find(item => item.id === id);

  if (!t) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-20 relative bg-white/60 backdrop-blur-3xl crystal-glass rounded-[3rem] border border-white/60 shadow-premium overflow-hidden">
        <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none mix-blend-screen" />
        <div className="relative">
          <h2 className="text-[8rem] sm:text-[10rem] font-display font-black text-slate-100 leading-none select-none drop-shadow-sm px-4">404</h2>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 relative z-10 px-6">
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Treatment Not Found</h3>
          <p className="text-slate-500 max-w-md mx-auto font-light text-lg">
            We couldn't locate the clinical details you were searching for. It may have been updated or moved.
          </p>
        </div>
        <Link 
          to="/treatments" 
          className="group flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-900/20 hover:bg-teal-500 hover:-translate-y-1 transition-all active:scale-[0.98] z-10 relative"
        >
          <Home size={20} />
          Back to Treatments
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-10 px-4 md:px-6"
    >
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-slate-400 font-medium whitespace-nowrap overflow-x-auto">
          <li>
            <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1.5 focus-visible:outline-teal-500 rounded px-1 py-0.5">
              <Home size={14} className="mb-0.5" /> Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight size={12} strokeWidth={3} />
          </li>
          <li>
            <Link to="/treatments" className="hover:text-teal-600 transition-colors focus-visible:outline-teal-500 rounded px-1 py-0.5">
              Treatments
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight size={12} strokeWidth={3} />
          </li>
          <li aria-current="page">
            <span className="text-teal-600 font-bold px-1 py-0.5 truncate block" title={t.title}>
              {t.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="relative rounded-[3rem] overflow-hidden aspect-[21/9] shadow-3xl holographic-border group">
        <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none z-10"></div>
        <img src={t.image} alt={t.title} fetchPriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[30s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-12 md:p-16 z-20">
          <h1 className="text-5xl md:text-6xl font-display font-medium text-white tracking-tight">{t.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
           <section className="bg-white/60 backdrop-blur-3xl crystal-glass p-10 rounded-[3rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-display font-semibold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                About the Treatment
              </h2>
              {t.sessionFocus && (
                <div className="mb-8 p-6 bg-slate-900 rounded-3xl border border-white/10 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity size={18} className="text-teal-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Session Focus</span>
                  </div>
                  <p className="text-lg font-display font-medium leading-tight">{t.sessionFocus}</p>
                </div>
              )}
              <div className="text-slate-600 leading-relaxed space-y-6 text-lg font-light whitespace-pre-line">
                {t.content}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </section>

          {t.techniques && (
            <section className="space-y-6">
              <h2 className="text-2xl font-display font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                   <Zap size={16} />
                </div>
                Key Techniques
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.techniques.map((tech, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:shadow-premium transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Waves size={18} />
                    </div>
                    <span className="text-slate-700 font-medium">{tech}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {t.aftercare && (
            <section className="bg-slate-950 p-10 rounded-[3rem] text-white overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-3xl font-display font-semibold mb-8 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-teal-400 flex items-center justify-center">
                    <RefreshCcw size={20} />
                  </div>
                  Aftercare & Recovery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {t.aftercare.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-6 h-6 rounded-full border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                        <CheckCircle2 size={14} />
                      </div>
                      <p className="text-slate-400 text-sm font-light leading-relaxed group-hover:text-white transition-colors">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-teal-500/60">
                   <ShieldCheck size={14} /> Clinical Recovery Protocol
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] -mr-48 -mb-48"></div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-teal-600" />
                Who is this for?
              </h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Ideal for individuals experiencing musculoskeletal discomfort, postural issues, or those looking to maintain peak physical health through structured clinical care.
              </p>
              <ul className="space-y-3">
                {['Chronic back & neck pain', 'Sports related injuries', 'Postural tension', 'Mobility restrictions'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-900/10 space-y-6">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-teal-200" />
                Clinical Approach
              </h3>
              <p className="text-teal-50/80 font-light leading-relaxed">
                Our evidence-based methods ensure that every session is tailored to your specific biomechanics, focusing on long-term resolution rather than just short-term relief.
              </p>
              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-teal-200">Standard Care</div>
                  <div className="text-lg font-semibold">Regulated Practice</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              FAQ
            </h2>
            <div className="space-y-2">
              <FAQItem 
                question="How long does a session take?" 
                answer="Standard initial consultations are 45-60 minutes, while follow-up sessions are typically 30-45 minutes depending on the treatment plan." 
              />
              <FAQItem 
                question="What should I wear for treatment?" 
                answer="Comfortable, loose-fitting clothing is recommended. Some treatments may require physical examination so lightweight sports gear is usually best." 
              />
              <FAQItem 
                question="Do I need a GP referral?" 
                answer="No, you can book directly with us as private patients. However, if you are using private medical insurance, you may need a GP referral depending on your provider." 
              />
              <FAQItem 
                question="Does the treatment hurt?" 
                answer="Our treatments are designed to be therapeutic. While some deep tissue work or manipulation may feel intense, our goal is to maintain comfort throughout the session." 
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-semibold text-slate-900 tracking-tight">Meet the Specialists</h2>
              <Link to="/practitioners" className="text-teal-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PRACTITIONERS.slice(0, 2).map((p, i) => (
                <Link key={i} to={`/practitioners/${p.id}`} className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 hover:shadow-premium transition-all group">
                   <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                      <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{p.role}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-emerald-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Available This Week</span>
                      </div>
                   </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 p-12 rounded-[3.5rem] relative overflow-hidden group">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h2 className="text-3xl font-display font-medium text-white tracking-tight leading-tight">Patient Success Story</h2>
                 <p className="text-slate-400 font-light italic leading-relaxed">
                   "After months of struggling with recurring issues, the structured program here changed everything. Not just the treatment, but the education provided."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 p-1">
                       <div className="w-full h-full rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                          <Heart size={20} fill="currentColor" />
                       </div>
                    </div>
                    <div>
                       <div className="text-white font-bold">Robert Davidson</div>
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Active Lifestyle Management</div>
                    </div>
                 </div>
              </div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-teal-500/30 transition-colors">
                <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800" alt="Patient training during an active rehabilitation session" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                      <ArrowRight className="text-white" />
                   </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/20 sticky top-32">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6 tracking-tight">Initial Consultation</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-light">Price</span>
                  <span className="text-2xl font-bold text-teal-600">£55.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-light">Duration</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-2">
                    <Clock size={16} className="text-teal-600" /> 60 Mins
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-50" />

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Everything Included</h3>
                <ul className="space-y-3">
                  {[
                    'Full Physical Assessment',
                    'Biomechanical Analysis',
                    'Personalised Treatment Plan',
                    'Initial Treatment Session',
                    'Exercise Guidance Pack'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => {
                  trackClick("Book Assessment Clicked");
                  window.open(BOOKING_URL, '_blank');
                }}
                className="w-full flex items-center justify-center gap-3 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-600/20 active:scale-[0.98] group"
              >
                Book Assessment
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                Cancellations require 24h notice
              </p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
