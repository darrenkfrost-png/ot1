import { useParams, Link } from 'react-router-dom';
import { TREATMENTS, practitionersFor } from '../data';
import { BOOKING_URL, CLINIC } from '../constants';
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Star,
  Zap,
  Waves,
  RefreshCcw,
  Activity
} from 'lucide-react';
import { REVIEWS } from '../data/reviews';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useId } from 'react';
import { cn } from '../lib/utils';
import { useAnalytics } from '../context/AnalyticsContext';
import { TreatmentMotif } from '../components/AnatomyMotif';
import { useToast } from '../components/ToastSystem';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      {/* aria-expanded tells a screen reader whether the answer is showing;
          before, only the colour and the chevron said so. */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? answerId : undefined}
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
            id={answerId}
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-20 relative bg-white/95 backdrop-blur-3xl crystal-glass rounded-[3rem] border border-white/60 shadow-premium overflow-hidden">
        <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none mix-blend-screen" />
        {/* "404" is a large watermark, not a heading: the page's one h1 is the
            "Treatment not found" line below, so a screen reader hears what happened rather than
            a number. The card was white at 60%, which over the dark wallpaper
            turned mid-grey and left the grey text under 2:1; it is now solid
            enough for the text to read, and the numeral is teal-700 (about
            5:1) rather than a faint slate-200, as on the practitioner page. */}
        <div className="relative" aria-hidden="true">
          <p className="text-[8rem] sm:text-[10rem] font-display font-black text-teal-700 leading-none select-none drop-shadow-sm px-4">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 relative z-10 px-6">
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Treatment not found</h1>
          <p className="text-slate-600 max-w-md mx-auto font-light text-lg">
            We couldn't find that treatment. It may have been renamed or moved.
          </p>
        </div>
        {/* Says where it goes. It used to read "Back to Treatments" beside a
            house icon, though it never went home, and someone arriving from an
            old search link has no treatments page to go "back" to. */}
        <Link
          to="/treatments"
          className="group flex items-center gap-3 px-8 py-4 bg-teal-700 text-white rounded-2xl font-bold shadow-xl shadow-teal-900/20 hover:bg-teal-800 hover:-translate-y-1 transition-all active:scale-[0.98] z-10 relative"
        >
          See all our treatments
          <ArrowRight size={20} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  // Both come from this treatment's own data, so the Hypnotherapy page no
  // longer says it is for sports injuries, or names two osteopaths as the
  // people who give it. (Plain values, not hooks: safe below the early return.)
  const clinicList = t.conditions ?? t.whoFor;
  const providers = practitionersFor(t.id);
  const isOsteopathy = t.id === 'osteopathy';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-10 px-4 md:px-6"
    >

      <div className="relative rounded-[3rem] overflow-hidden aspect-[21/9] shadow-3xl holographic-border group">
        <div className="absolute inset-0 neural-grid opacity-30 mix-blend-screen pointer-events-none z-10"></div>
        <img src={t.image} alt={t.title} fetchPriority="high" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[30s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-12 md:p-16 z-20">
          <h1 className="text-5xl md:text-6xl font-display font-medium text-white tracking-tight">{t.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
           <section className="bg-white/95 backdrop-blur-3xl crystal-glass p-10 rounded-[3rem] border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden relative">
            {/* The part of the body this treatment is about, sitting quietly
                behind the text: a spine for osteopathy, a leg for sports
                massage, a foot for footcare. */}
            <TreatmentMotif
              treatmentId={t.id}
              className="absolute -right-6 -top-6 w-56 h-72 text-teal-900"
              opacity={7}
            />
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
              {/* Sits straight on the dark wallpaper (no card), so it takes
                  light text like "Who provides this treatment" below; it was
                  slate-900, dark on dark, on every massage page. */}
              <h2 className="text-2xl font-display font-semibold text-slate-50 tracking-tight flex items-center gap-3">
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
                <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-teal-400">
                   <ShieldCheck size={14} /> Agreed with you at each visit
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] -mr-48 -mb-48"></div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/95 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
              <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-teal-600" />
                Who is this for?
              </h3>
              {/* This used to be one fixed list on every treatment ("Chronic
                  back & neck pain, Sports related injuries…"), so Hypnotherapy
                  and Footcare claimed to be for sports injuries. It now shows
                  the clinic's own list for this treatment, word for word, and
                  where the clinic gives none it says to ring rather than guess. */}
              {clinicList && clinicList.length > 0 ? (
                <>
                  <p className="text-slate-600 font-light leading-relaxed">
                    What the clinic lists for {t.title}:
                  </p>
                  <ul className="space-y-3">
                    {clinicList.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Not on the list, or not sure? Ring the clinic on{' '}
                    <a href={`tel:${CLINIC.telephoneLink}`} className="text-teal-700 font-semibold hover:underline">
                      {CLINIC.telephone}
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p className="text-slate-600 font-light leading-relaxed">
                  Not sure whether {t.title} suits you? Ring the clinic on{' '}
                  <a href={`tel:${CLINIC.telephoneLink}`} className="text-teal-700 font-semibold hover:underline">
                    {CLINIC.telephone}
                  </a>
                  {' '}and talk it through before you book.
                </p>
              )}
            </div>
            <div className="bg-teal-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-900/10 space-y-6">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <ShieldCheck size={20} className="text-teal-200" />
                Clinical Approach
              </h3>
              <p className="text-white font-light leading-relaxed">
                Each session is shaped around what you need, and your practitioner explains what they are doing and why.
              </p>
              {/* "Regulated Practice" used to sit on every treatment, massage,
                  foot care and hypnotherapy included. Only osteopathy is
                  regulated by law (the practitioner pages apply the same rule),
                  so only the osteopathy page names the regulator. */}
              <div className="pt-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Stethoscope size={24} />
                </div>
                {isOsteopathy ? (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-teal-50">Regulated by</div>
                    <div className="text-lg font-semibold">{CLINIC.regulator.name}</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-teal-50">Training</div>
                    <div className="text-lg font-semibold">Set out on each practitioner's page</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              Common questions
            </h2>
            <div className="space-y-2">
              {/* Durations vary by treatment and are the clinic's to quote, not
                  this page's to guess — the fee box beside this says the same. */}
              <FAQItem
                question="How long does a session take?"
                answer="It depends on the treatment. The length of your appointment is confirmed when you book, so you will know exactly how long to set aside before you arrive."
              />
              {/* These answers render on every treatment, hypnotherapy and foot
                  care included, and agree with the FAQ page (src/data/faq.ts).
                  "Does it hurt?" used to talk about "manipulation" on the
                  Hypnotherapy page and left out the soreness afterwards that
                  the FAQ page mentions. */}
              <FAQItem
                question="What should I wear for treatment?"
                answer="Comfortable clothing you can move in is ideal. For some treatments you may be asked to remove some outer clothing. You are entitled to ask for a chaperone, to bring someone with you, or to wear shorts and a vest top instead — just say so when you book or when you arrive."
              />
              <FAQItem
                question="Do I need a GP referral?"
                answer="No. You can book with us directly, without a GP referral. If your care is being paid for through private medical insurance, your insurer may still need a referral before they will agree to cover it, so it is worth checking your policy first."
              />
              <FAQItem
                question="Does the treatment hurt?"
                answer="It depends on the treatment. Hands-on work on tight or sore areas can be briefly uncomfortable, and mild soreness for a day or so afterwards is common. Tell your practitioner at any point if something is too much, and the treatment will be adapted."
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-semibold text-slate-50 tracking-tight">Who provides this treatment</h2>
              <Link to="/practitioners" className="text-teal-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            {/* This used to show the first two practitioners — the two
                osteopaths — on every treatment, so Footcare and Hypnotherapy
                named the wrong people. practitionersFor (src/data) matches the
                team's own roles and specialisations. Where neither the clinic's
                site nor this one says who gives a treatment, say so plainly. */}
            {providers.length === 0 ? (
              <p className="p-6 bg-white rounded-[2rem] border border-slate-100 text-slate-700 leading-relaxed">
                Ring the clinic on{' '}
                <a href={`tel:${CLINIC.telephoneLink}`} className="text-teal-700 font-semibold hover:underline">
                  {CLINIC.telephone}
                </a>{' '}
                to ask who offers this treatment.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {providers.map((p) => (
                <Link key={p.id} to={`/practitioners/${p.id}`} className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 hover:shadow-premium transition-all group">
                   <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                      <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{p.role}</p>
                      <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-widest text-teal-700">View profile</span>
                   </div>
                </Link>
              ))}
            </div>
            )}
          </section>

          <section className="bg-slate-900 p-12 rounded-[3.5rem] relative overflow-hidden group">
            {/* Real reviews only. The "Robert Davidson" whose success story
                lived here was never a patient — he was written. These two are
                from the practice's Google listing, in the reviewers' own words,
                and name no individual practitioner, so this block — which
                renders on every treatment — misattributes nothing. */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                 <h2 className="text-3xl font-display font-medium text-white tracking-tight leading-tight">What patients said</h2>
                 {[REVIEWS[6], REVIEWS[8]].map((review, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, j) => <Star key={j} size={12} className="fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-slate-300 font-light italic leading-relaxed">"{review.quote}"</p>
                      <div className="text-xs text-slate-300 uppercase font-bold tracking-widest">— {review.author}, Google review</div>
                   </div>
                 ))}
              </div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-teal-500/30 transition-colors">
                {/* The clinic's own emblem. This was a stock photo of a crowd
                    at an outdoor party, described to screen readers as "Patient
                    training during an active rehabilitation session", sitting
                    beside real reviewers' names. Decorative, so alt is empty. */}
                <img src="/video/emblem-close.jpg" width={1280} height={720} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/20 sticky top-32">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6 tracking-tight">Your first appointment</h3>
                {/* The Â£55.00 shown here was invented, as was the 60-minute
                    duration. Both vary by treatment and are confirmed by the
                    clinic when you book. */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-light">Fee</span>
                  <a
                    href={`tel:${CLINIC.telephoneLink}`}
                    className="text-base font-bold text-teal-700 hover:underline focus-visible:outline-teal-500"
                  >
                    Ask when you book
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-light">Length</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-2">
                    <Clock size={16} className="text-teal-600" /> Varies by treatment
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-50" />

              <div className="space-y-4">
                {/* Only what every first appointment truly involves. This block
                    renders for every treatment, so anything listed here must
                    hold for footcare and hypnotherapy as much as for osteopathy
                    — the old "Biomechanical Analysis" and "Exercise Guidance
                    Pack" did not, and nor did "Hands-on treatment": hypnotherapy
                    is a talking therapy. Treatment follows only where it is
                    appropriate, as the FAQ page says. */}
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">What's Included</h3>
                <ul className="space-y-3">
                  {[
                    'Time to talk through what you need',
                    'Treatment in the same visit, where it is appropriate',
                    'Advice to take home'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* A real link, like every other booking control (see App.tsx):
                  a scripted window.open was announced as a plain button, could
                  be stopped by pop-up blockers, and handed the booking site a
                  handle on this tab. */}
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("Book Assessment Clicked")}
                aria-label="Book Assessment — opens our booking system in a new tab"
                className="w-full flex items-center justify-center gap-3 py-5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-600/20 active:scale-[0.98] group"
              >
                Book Assessment
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              {/* A cancellation policy is a contract term. Until the clinic
                  states one, this page must not invent one for it. */}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
