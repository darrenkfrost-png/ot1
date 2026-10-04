import { PRACTITIONERS } from '../data';
import { CLINIC } from '../data/clinic';
import { REVIEWS_SOURCE } from '../data/reviews';
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

// The practitioner cards' fade-in. Kept outside the component so the same
// objects are passed on every render.
const CARD_HIDDEN = { opacity: 0, y: 30 };
const CARD_SHOWN = { opacity: 1, y: 0 };
const CARD_VIEWPORT = { once: true };
const CARD_TRANSITIONS = [0, 0.1, 0.2].map((delay) => ({ delay, layout: { duration: 0.3 } }));

export default function PractitionersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const FAQS = [
    {
      question: "What qualifications do your practitioners hold?",
      // The four-year degree and GOsC registration are the clinic's own words
      // (osteopathyandwellbeing.co.uk home page). Registration is only
      // claimed where the clinic states it; for everyone else, their
      // qualifications — its phrase is "fully qualified and experienced staff".
      answer: "Our osteopaths have each completed a four-year degree in osteopathy and are registered with the General Osteopathic Council, the profession's regulator. Our acupuncturist, massage therapist, foot care practitioner and hypnotherapist each hold qualifications in their own field. Each practitioner's page sets out their training and any memberships they hold."
    },
    {
      // The header's Book Online button is hidden on a phone, where booking
      // is the Book button in the bar at the bottom of the screen.
      question: "How do I book an appointment?",
      answer: `On a computer, use the Book Online button at the top of the page. On a phone, tap Book at the bottom of the screen. Either one lets you choose a treatment, a practitioner and a time. Or call the clinic on ${CLINIC.telephone} and we will book you in.`
    },
    {
      question: "What should I expect during my first osteopathic session?",
      answer: "Your first appointment starts with a full case history and a hands-on examination, then treatment where it is appropriate, and you leave with advice on what to do between visits. How long it takes depends on the treatment — we confirm the length when you book."
    },
    {
      // We haven't verified any insurer's current terms, so none are named —
      // whether a policy covers osteopathy is between the patient and their
      // insurer. This used to promise receipts for claims; the clinic's site
      // says nothing about receipts or insurance, so the patient is told to
      // ask, in line with the FAQ page (data/faq.ts).
      question: "Is osteopathy covered by private health insurance?",
      answer: "Many UK insurers cover osteopathy, though the level of cover, whether a referral is needed, and which practitioners are recognised all vary by policy. Check with your insurer before your first appointment, and ask the clinic what paperwork they can give you for a claim."
    }
  ];


  /*
   * These tabs used to be a wish-list: 'Physiotherapy' and 'Sports Therapy'
   * matched nobody on the roster, so those tabs always said "no specialists
   * match"; 'Massage Therapy' missed Keri because her role reads "Massage
   * Therapist" and Therapist is not Therapy; and 'Osteopathy' hid Leon, an
   * osteopath, because only his colleague listed the word as a specialisation.
   *
   * Two changes make that class of fault impossible rather than fixed: match on
   * a STEM, case-insensitively, across role and specialisations; and build the
   * tab list from the practitioners who actually exist, so a tab can only be
   * offered when somebody is behind it.
   */
  const SPECIALTY_STEMS: { label: string; stem: RegExp }[] = [
    { label: 'Osteopathy', stem: /osteopath/i },
    { label: 'Sports', stem: /sports/i },
    { label: 'Massage', stem: /massage/i },
    { label: 'Acupuncture', stem: /acupunctur/i },
    { label: 'Foot Care', stem: /foot/i },
    { label: 'Hypnotherapy', stem: /hypnother/i },
  ];

  const describes = (p: typeof PRACTITIONERS[number], stem: RegExp) =>
    stem.test(p.role) || (p.specialisations ?? []).some(s => stem.test(s));

  const specialties = useMemo(
    () => ['All', ...SPECIALTY_STEMS.filter(s => PRACTITIONERS.some(p => describes(p, s.stem))).map(s => s.label)],
    []
  );

  // The search box says "name or speciality", but it used to read only the
  // name and role, so typing "dry needling" or "deep tissue" found nobody.
  // It now reads each person's specialisations and services too (the lists
  // shown on their own page), and ignores stray spaces.
  const query = searchQuery.trim().toLowerCase();

  const filteredPractitioners = useMemo(() => {
    const stem = SPECIALTY_STEMS.find(s => s.label === activeSpecialty)?.stem;
    return PRACTITIONERS.filter(p => {
      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        [...(p.specialisations ?? []), ...(p.services ?? [])].some(s => s.toLowerCase().includes(query));

      if (activeSpecialty === 'All' || !stem) return matchesSearch;
      return matchesSearch && describes(p, stem);
    });
  }, [query, activeSpecialty]);

  // Said aloud (politely) after a tab or the search changes the list. It
  // names the tab and the search, so switching between two tabs that happen
  // to show the same number of people is still announced.
  const shownCount = filteredPractitioners.length;
  const resultSummary = [
    shownCount === 1 ? '1 practitioner shown' : `${shownCount} practitioners shown`,
    activeSpecialty !== 'All' ? `for ${activeSpecialty}` : '',
    query ? `matching "${searchQuery.trim()}"` : '',
  ].filter(Boolean).join(' ');

  const clearFilters = () => {
    setSearchQuery('');
    setActiveSpecialty('All');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24">

      <header className="relative bg-slate-950 rounded-[4rem] p-12 md:p-24 text-white shadow-3xl overflow-hidden group holographic-border">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none"></div>
           {/* This was a stock photo, announced as "Clinical Team": a woman in
               another clinic's scrubs with someone else's name embroidered on
               them. The six real practitioners are on the cards below; the
               header carries the clinic's own emblem art, as decoration. */}
           <img src="/video/emblem-field.jpg" fetchPriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[20s]" alt="" aria-hidden="true" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <span className="inline-flex items-center gap-3 px-5 py-2 bg-teal-500/10 backdrop-blur-md rounded-full border border-teal-400/20 text-teal-400 font-bold text-xs uppercase tracking-[0.4em] mb-4">
            <Users size={18} className="animate-pulse" /> Our team
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-medium text-white mb-6 tracking-tighter leading-[0.9] break-words">Meet the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">practitioners</span></h1>
          <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl border-l-4 border-teal-500 pl-8">Meet the practitioners at the Herne Bay clinic — their training, and what each of them treats.</p>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <ShieldCheck size={20} className="text-white" />
              {/* Only the osteopaths are on the GOsC register; this badge sits
                  above all six practitioners, so it says so. */}
              <span className="text-sm font-bold uppercase tracking-widest text-slate-200">GOsC-registered osteopaths</span>
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
          {/* Toggle buttons, as on the Treatments page: aria-pressed tells a
              screen reader which one is on, and the group names what they do. */}
          <div role="group" aria-label="Show practitioners by treatment" className="flex items-center flex-wrap gap-3">
            {specialties.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setActiveSpecialty(spec)}
                aria-pressed={activeSpecialty === spec}
                className={cn(
                  "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all",
                  activeSpecialty === spec 
                    ? "bg-teal-700 text-white shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/10" 
                    : "bg-white text-slate-600 border border-slate-100 hover:border-teal-200 hover:text-teal-700 shadow-sm"
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
              aria-label="Filter practitioners by name or speciality"
              placeholder="Filter by name or speciality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-8 py-4 rounded-2xl bg-white focus:bg-white border-2 border-transparent focus:border-teal-100 outline-none transition-all shadow-sm text-sm focus:ring-8 focus:ring-teal-500/5"
            />
          </div>
        </div>

        {/* Each card fades in on its own when it comes into view. The fade
            used to be run by the grid, once; a card that came back after a
            filter (pick "Osteopathy", then "All") mounted hidden and never
            faded in, so four of the six people stayed invisible while the
            count said six. */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredPractitioners.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              initial={CARD_HIDDEN}
              whileInView={CARD_SHOWN}
              viewport={CARD_VIEWPORT}
              transition={CARD_TRANSITIONS[i % 3]}
            >
              <Link to={`/practitioners/${p.id}`} className="block group h-full">
                <div className="bg-white/95 backdrop-blur-3xl crystal-glass rounded-[2.5rem] p-7 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-premium hover:-translate-y-2 hover:border-teal-300 transition-all duration-500 h-full flex flex-col overflow-hidden holographic-border relative z-0">
                   <div className="absolute inset-0 neural-grid opacity-[0.03] pointer-events-none mix-blend-screen mix-blend-lighten z-[-1]"></div>
                   <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 relative">
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-8">
                       <span className="text-slate-100 text-xs font-bold uppercase tracking-widest mb-1">{p.role}</span>
                       <h3 className="text-3xl font-display font-medium text-white tracking-tight">{p.name}</h3>
                    </div>
                    {/* This chip said "Principal Clinical Lead" on all six
                        cards — a job title none of the five others holds, and,
                        faded out rather than hidden, read aloud on every card.
                        It now shows the person's own published letters, and
                        nothing when none are on record. Always visible, on a
                        dark chip, so it reads on any photo and on a phone.
                        Not uppercased: letters such as "BSc" and "M.Ost" are
                        shown exactly as the clinic publishes them. */}
                    {p.qualifications && (
                      <div className="absolute top-4 right-4 max-w-[calc(100%-2rem)] px-3 py-2 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/20 text-xs leading-snug font-bold text-white tracking-wide text-right">
                        <span className="sr-only">Qualifications: </span>{p.qualifications}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-6 px-2">
                    <p className="text-slate-600 leading-relaxed font-light text-base line-clamp-3">{p.bio}</p>
                    <div className="space-y-3">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Clinical Focus Areas:</span>
                       <div className="flex flex-wrap gap-2">
                         {p.specialisations?.map((spec, i) => (
                           <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-lg group-hover:bg-teal-50 group-hover:text-teal-800 group-hover:border-teal-100 transition-colors">{spec}</span>
                         ))}
                       </div>
                    </div>
                  </div>
                  <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between text-teal-700 px-2 group-hover:px-4 transition-all duration-500">
                    <div className="flex flex-col">
                       {/* "From £65.00" was invented. Fees come from the clinic. */}
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Appointments</span>
                       <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700">Book or ask about fees</span>
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
                <p className="text-slate-700">No practitioners match that search.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition-colors"
                >
                  Show all practitioners
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
        {/* Tells a screen-reader user what a filter or search just did. */}
        <p role="status" className="sr-only">
          {resultSummary}
        </p>
      </div>

      <section className="py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative">
           <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative group">
              {/* This was a stock photo of a stranger's hands at a laptop with
                  a stethoscope, described as the clinic's "research". It is
                  now the clinic's own emblem art (a still from its films in
                  /public/video), shown as decoration, so alt is empty. */}
              <img src="/video/emblem-rows.jpg" width={1280} height={720} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
                   <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white"><BookOpen size={20} /></div>
                   <span className="text-white font-bold text-xs uppercase tracking-widest">Ongoing Professional Development</span>
                </div>
              </div>
           </div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="order-1 lg:order-2 space-y-8">
           <div className="space-y-4">
             <span className="text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">Continuous Development</span>
             <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-50 tracking-tighter leading-tight">Beyond the Clinic:<br/><span className="text-teal-600 underline decoration-teal-100 underline-offset-8">Professional Standards</span>.</h2>
             <p className="text-xl text-slate-300 font-light leading-relaxed">Between them, our practitioners bring decades of experience to one clinic, and each is qualified in their own field. Our osteopaths also keep up the professional development their regulator requires.</p>
           </div>
           
           <div className="space-y-6 pt-4">
              {/* The salons, training hub and research lab never existed.
                  Each line below can be checked: the practising-since date
                  (read from CLINIC), Leon's membership and rugby club work
                  (his page on the clinic's site), and the GOsC's own CPD
                  requirement. A "University Partnerships" line claimed sports
                  science research with Canterbury Christ Church University;
                  the clinic's site mentions that university only as a place
                  where Leon supports film and music students, so it went. */}
              {[
                { title: "Decades of Combined Experience", desc: `Practising in Herne Bay since ${CLINIC.establishedYear}, across osteopathy, acupuncture, massage, foot care and hypnotherapy.` },
                { title: "Sport and exercise medicine", desc: "Leon is a member of the British Association of Sports and Exercise Medicine and provides pitchside support for Canterbury Rugby Club." },
                { title: "GOsC Registration & Development", desc: "Our osteopaths are registered with the General Osteopathic Council and keep up the continuing professional development it requires." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-all shadow-sm">
                      <Sparkles size={22} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-50 text-lg mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-300 font-light leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden text-center space-y-12">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* This said every member of the team was "fully registered with
              their respective clinical bodies". The clinic's site states
              registration for the osteopaths (GOsC) and Alexandra (NCH, CNHC)
              only; for the team it says "fully qualified". */}
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight">Qualified in their own fields</h2>
          <p className="text-xl text-slate-400 font-light leading-relaxed">
            Our osteopaths are registered with the General Osteopathic Council. Each practitioner's page sets out their own training and memberships.
          </p>
          {/* 15+ specialists, 10k+ patients and a 4.9 average were all stated
              without a source. These three can each be checked. */}
          <div className="flex flex-wrap justify-center gap-12 pt-8">
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">{PRACTITIONERS.length}</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Practitioners</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">{CLINIC.establishedYear}</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Practising Since</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-display font-bold text-teal-400">{REVIEWS_SOURCE.rating}</div>
               <div className="text-xs font-bold uppercase tracking-widest text-slate-400">From {REVIEWS_SOURCE.count} {REVIEWS_SOURCE.label}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </section>

      {/* Questions about the team. The background was "bg-slate-5/50", a
          colour step Tailwind does not have, so the panel had none and its
          light heading and intro sat straight on the wallpaper. A dark tint
          suits that light text (a pale one would have hidden it). */}
      <section className="bg-slate-950/40 backdrop-blur-xl border border-slate-100 rounded-[3rem] p-8 md:p-16 space-y-12 shadow-inner">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-black uppercase text-teal-800 tracking-wider">
               <HelpCircle size={12} /> Your questions
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-slate-50 tracking-tight">
               Frequently Asked <span className="text-teal-600">Questions</span>
            </h2>
            <p className="text-slate-300 font-light text-base max-w-lg">
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
                        <div className="p-6 md:p-8 pt-0 md:pt-0 border-t border-slate-50 text-slate-600 leading-relaxed font-light text-base space-y-4">
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
          { icon: Zap, title: "Plain Explanations", desc: "We tell you what we find and what we suggest, in plain words." },
          { icon: Heart, title: "Your Comfort First", desc: "Treatment goes at your pace, and you can stop or ask at any time." },
          { icon: Sparkles, title: "One clinic", desc: `${CLINIC.address.line1}, ${CLINIC.address.town} — the same team every visit.` }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <item.icon size={24} />
            </div>
            <h4 className="font-bold text-slate-900 text-lg tracking-tight">{item.title}</h4>
            <p className="text-sm text-slate-600 font-light leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
