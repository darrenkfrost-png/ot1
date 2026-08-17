import { useState, useMemo } from 'react';
import { TREATMENTS, PRACTITIONERS } from '../data';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/ToastSystem';
import { 
  ChevronRight, 
  Home, 
  Search, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Calendar,
  Zap,
  ShieldCheck,
  Heart,
  Clock,
  Activity,
  Users,
  Star,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from '../components/Logo';
import { BOOKING_URL, CLINIC } from '../constants';
import { REVIEWS, REVIEWS_SOURCE } from '../data/reviews';
import { TreatmentMotif } from '../components/AnatomyMotif';

export default function TreatmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { showToast } = useToast();

  const categories = ['All', 'Osteopathy', 'Physiotherapy', 'Massage', 'Wellness', 'Footcare'];

  const filteredTreatments = useMemo(() => {
    return TREATMENTS.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeCategory === 'All') return matchesSearch;
      if (activeCategory === 'Osteopathy') return matchesSearch && t.id === 'osteopathy';
      if (activeCategory === 'Physiotherapy') return matchesSearch && t.id === 'physiotherapy';
      if (activeCategory === 'Massage') return matchesSearch && (t.title.includes('Massage') || t.id.includes('massage'));
      if (activeCategory === 'Wellness') return matchesSearch && (t.id === 'hypnotherapy' || t.id === 'acupuncture');
      if (activeCategory === 'Footcare') return matchesSearch && t.id === 'footcare';
      return matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24">
      <nav aria-label="Breadcrumb" className="mt-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400 font-medium whitespace-nowrap overflow-x-auto">
          <li>
            <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1.5 focus-visible:outline-teal-500 rounded px-1 py-0.5">
              <Home size={14} className="mb-0.5" /> Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            <ChevronRight size={12} strokeWidth={3} />
          </li>
          <li aria-current="page">
            <span className="text-teal-600 font-bold px-1 py-0.5 truncate block">
              Treatments
            </span>
          </li>
        </ol>
      </nav>

      <header className="relative bg-slate-950 rounded-[4rem] p-12 md:p-24 text-white shadow-3xl overflow-hidden group holographic-border">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
           <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" fetchPriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s]" alt={`The ${CLINIC.name} clinic interior`} />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <span className="inline-flex items-center gap-3 px-5 py-2 bg-teal-500/10 backdrop-blur-md rounded-full border border-teal-400/20 text-teal-400 font-bold text-xs uppercase tracking-[0.4em] mb-4">
            <Sparkles size={16} className="animate-pulse" /> Clinical Services
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-medium text-white mb-6 tracking-tighter leading-[0.85]">Science-Led <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Total Body Care</span></h1>
          <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl border-l-4 border-teal-500 pl-8">Our multidisciplinary approach combines the best of clinical expertise and patient-centered research to help you achieve lasting anatomical results.</p>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <ShieldCheck size={20} className="text-teal-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-200">GOsC Registered</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <Zap size={20} className="text-amber-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-200">Express Rehab Paths</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] -mr-48 -mt-48"></div>
      </header>

      {/* Expanded Quick Stats for Treatments */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/*
          Every figure here can be checked. It previously read 99% patient
          retention, a 94.2% success rate and 12+ specialists — none of which
          came from anywhere, and the last of which contradicted the practice's
          own team page.
        */}
        {[
          { label: "Google rating", val: "5.0", sub: "from 56 reviews", icon: Heart },
          { label: "Practising since", val: "2012", sub: "in Herne Bay", icon: Clock },
          { label: "Treatments", val: "15", sub: "across 8 disciplines", icon: Activity },
          { label: "Practitioners", val: `${PRACTITIONERS.length}`, sub: "at one clinic", icon: Users }
        ].map((stat, i) => (
          <div key={i} className="relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] crystal-glass holographic-border flex flex-col items-center text-center group hover:-translate-y-2 transition-all overflow-hidden">
             <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-0"></div>
             <div className="relative z-10 w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-700 group-hover:text-white transition-all duration-500 shadow-sm border border-teal-100/50">
               <stat.icon size={24} />
             </div>
             <div className="relative z-10 text-3xl font-display font-bold text-slate-900 mb-1">{stat.val}</div>
             <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-1">{stat.label}</div>
             <div className="relative z-10 text-xs text-slate-400 font-light">{stat.sub}</div>
          </div>
        ))}
      </section>

      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/50 backdrop-blur-xl p-6 rounded-[3rem] border border-slate-100 shadow-inner">
          <div className="flex items-center flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                  activeCategory === cat 
                    ? "bg-teal-700 text-white shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/10" 
                    : "bg-white text-slate-400 border border-slate-100 hover:border-teal-200 hover:text-teal-600 shadow-sm"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-[400px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
            <input
              type="text"
              aria-label="Search treatments"
              placeholder="Search detailed treatments..."
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
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTreatments.map((t) => (
            <motion.div
              layout
              key={t.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Link to={`/treatments/${t.id}`} className="block group h-full">
                <div className="relative bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-2 hover:border-teal-100 transition-all duration-500 h-full flex flex-col overflow-hidden">
                  {/* The region this treatment concerns, faint behind the card
                      and a little clearer when you hover it. */}
                  <TreatmentMotif
                    treatmentId={t.id}
                    className="absolute -right-4 bottom-2 w-40 h-52 text-teal-900 opacity-100 group-hover:scale-105 transition-transform duration-700"
                    opacity={6}
                  />
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-8 relative">
                    <img src={t.image} alt={t.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                       <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">Learn More</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 px-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight">{t.title}</h3>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight size={16} />
                      </div>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-light text-base line-clamp-3">{t.desc}</p>
                  </div>
                  <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between text-teal-700 px-2 transition-transform group-hover:translate-x-1 duration-500">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Comprehensive Assessment Included</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        {filteredTreatments.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-slate-100 text-slate-500 text-lg shadow-sm"
          >
            <div className="max-w-xs mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                <Search size={32} />
              </div>
              <p>No treatments match your search criteria. Try a different keyword.</p>
            </div>
          </motion.div>
        )}
      </div>

      <section className="py-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">Patient Voices</span>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-900 tracking-tight">What patients <span className="text-teal-600">actually said.</span></h2>
          <p className="text-lg text-slate-500 font-light leading-relaxed">
            Unedited, from our{' '}
            <a
              href={REVIEWS_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 font-medium hover:underline focus-visible:outline-teal-500"
            >
              {REVIEWS_SOURCE.label}
            </a>
            .
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Real reviews from the practice's Google listing, in the reviewers'
              own words. The invented ones that were here read like marketing
              because they were written as marketing. */}
          {REVIEWS.slice(0, 3).map((item, i) => (
            <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all space-y-6 relative overflow-hidden group">
               <div className="flex items-center gap-2 mb-2">
                 {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
               </div>
               <p className="text-slate-600 italic font-light leading-relaxed">"{item.quote}"</p>
               <div className="flex items-center gap-4 pt-4">
                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm">
                   {item.author[0]}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 text-sm">{item.author}</h4>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Google review</p>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Somewhere for a patient to add their own, rather than only ever
            reading other people's. */}
        <div className="text-center">
          <a
            href={REVIEWS_SOURCE.writeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-teal-300 hover:text-teal-700 hover:shadow-premium transition-all focus-visible:outline-teal-500"
          >
            <Star size={16} className="fill-amber-400 text-amber-400" />
            Been treated here? Leave a review
            <ExternalLink size={13} className="opacity-50" aria-hidden="true" />
          </a>
          <p className="mt-3 text-xs text-slate-400">Opens Google in a new tab</p>
        </div>
      </section>

      <section className="bg-slate-950 p-12 md:p-24 rounded-[5rem] text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
           <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000" loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Consulting room at the clinic" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-display font-medium tracking-tight leading-tight">Need assistance <span className="text-teal-400">choosing?</span></h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed">Our clinical triage team provides a free 15-minute consultation to help you find the right path for your specific condition.</p>
            </div>
            
            <div className="space-y-8">
              {[
                { title: "Direct Clinical Triage", desc: "Speak with a senior practitioner before booking to ensure correct alignment with our specialists." },
                { title: "Integrated Assessment", desc: "A combined session of physical diagnosis and initial treatment for all new patients." },
                { title: "Long-term Recovery Strategy", desc: "Structured plans designed around your lifestyle, workspace, and physical goals." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-all">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-6">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-12 py-6 bg-teal-700 text-white rounded-2xl font-bold text-lg hover:bg-teal-800 transition-all shadow-2xl shadow-teal-900/40 active:scale-95 flex items-center justify-center gap-3 group"
                aria-label="Book an appointment — opens our booking system in a new tab"
              >
                Book an assessment <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </a>
              {/* There is no clinic guide PDF. This used to claim, in a success
                  message, that one was downloading. The patient guides do exist,
                  so it points at those instead. */}
              <Link
                to="/gallery"
                className="px-12 py-6 bg-white/5 text-white rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Read the Patient Guides
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(20,184,166,0.15)] group">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]" alt="Wellness care" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem]">
              <div className="flex items-center gap-3 mb-4">
                 <Heart className="text-teal-400 fill-teal-400" size={24} />
                 <span className="text-white font-bold text-xs uppercase tracking-[0.3em]">Patient Spotlight</span>
              </div>
              <p className="text-white text-lg font-medium italic leading-relaxed">"{REVIEWS[5].quote}"</p>
              <div className="mt-4 text-teal-400 font-bold text-xs uppercase tracking-widest">— {REVIEWS[5].author}, Google review</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Clinical Pathway Finder - New Interactive Module */}
      <section className="bg-teal-600 rounded-[5rem] p-12 md:p-24 text-slate-950 relative overflow-hidden group">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
         <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
            {/* This was a "Clinical Pathway Finder" promising that "our algorithm will
                suggest the most efficient treatment protocol". There was no algorithm —
                the button pointed at the AI page, which no longer exists. Replaced with
                the thing that actually happens: you ask, a practitioner answers. */}
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
               <Activity size={18} /> Not sure where to start?
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter leading-tight">Not sure which one <br/><span className="text-white">you need? Just ask.</span></h2>
            <p className="text-xl md:text-2xl font-light text-teal-950 leading-relaxed">
               Tell us what hurts and how long it has been going on. A practitioner will tell you
               whether we can help — and say so plainly if we cannot.
            </p>
            <div className="pt-8">
               <Link to="/contact" className="inline-flex items-center justify-center h-20 px-16 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs hover:-translate-y-2 transition-all shadow-3xl hover:bg-slate-900 group">
                  Ask a practitioner <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
         </div>
         <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-[5s]"></div>
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400 rounded-full blur-[120px] group-hover:scale-120 transition-transform duration-[7s]"></div>
      </section>

      {/*
        The pricing here was invented: a £65 assessment, £55 follow-up and £85
        intensive, plus "Recovery" and "Longevity" bundles at £310 and £600 with
        savings against prices that never existed. A patient could have budgeted
        on those, or arrived expecting to pay £55. The practice does not publish
        fees on its own site, so this now says where to get them.
      */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 shadow-premium p-12 md:p-16">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">Fees</span>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-900 tracking-tight">
            What it costs
          </h2>
          <p className="text-lg text-slate-500 font-light leading-relaxed">
            Fees depend on the treatment and the length of the appointment. Ring the clinic
            on{' '}
            <a href={`tel:${CLINIC.telephoneLink}`} className="text-teal-600 font-medium hover:underline focus-visible:outline-teal-500">
              {CLINIC.telephone}
            </a>{' '}
            and we will tell you exactly what your appointment will cost before you book —
            no obligation, and no surprises when you arrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-teal-700 text-white font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-500/25 focus-visible:outline-teal-400"
              aria-label="Book an appointment — opens our booking system in a new tab"
            >
              <Calendar size={18} /> Book an appointment
            </a>
            <a
              href={`tel:${CLINIC.telephoneLink}`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-50 text-slate-700 font-bold border border-slate-200 hover:border-teal-300 hover:text-teal-700 transition-all focus-visible:outline-teal-500"
            >
              Ask about fees
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
