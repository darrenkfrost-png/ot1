import { PDFs, VIDEOS } from '../data/resources';
import { GOVERNANCE_DOCS } from '../constants';
import { 
  Download, 
  PlayCircle, 
  FileText, 
  X, 
  ChevronDown, 
  Home, 
  ChevronRight,
  PhoneCall,
  ShieldAlert,
  Info,
  ExternalLink,
  LifeBuoy,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, type RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from '../components/ToastSystem';
import { FAQS as CLINIC_FAQS, type FaqItem } from '../data/faq';
import { GALLERY_IMAGES } from '../data/images';

/*
 * ONE ANSWER PER QUESTION, FROM ONE PLACE.
 *
 * This page kept its own copy of five answers, and they had drifted from the
 * site's Questions page: "What should I wear?" told patients they might have
 * to undress to their underwear but "will always be offered a gown or towel"
 * — a promise the clinic never makes — while the Questions page says outer
 * clothing, with a chaperone or shorts and a vest top if preferred; and the
 * referral answer had lost the note about insurers. The five are now picked,
 * by their question, from src/data/faq.ts, so both pages say the same thing.
 * A question renamed there simply drops out here rather than going stale.
 */
const RESOURCE_QUESTIONS = [
  'What is osteopathy?',
  'Do I need a referral from my GP to see an osteopath?',
  'What should I wear?',
  'Will treatment hurt?',
  'How many sessions will I need?',
];
const FAQS = RESOURCE_QUESTIONS
  .map((q) => CLINIC_FAQS.find((item) => item.q === q))
  .filter((item): item is FaqItem => Boolean(item))
  .map((item) => ({ question: item.q, answer: item.a }));

/*
 * Keyboard focus for the film window: move focus in when it opens, keep Tab
 * inside it, and hand focus back to the film that opened it. Before, focus
 * stayed on the card behind the overlay and Tab wandered the hidden page.
 * (The same small hook sits in GalleryPage.tsx.)
 */
function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!ref.current?.contains(active)) {
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
    const onFocusIn = (e: FocusEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) focusables()[0]?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, ref]);
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-100 rounded-[1.5rem] bg-white shadow-sm overflow-hidden mb-4 transition-all duration-300 hover:border-teal-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="focus-inset w-full text-left px-6 py-5 flex items-center justify-between focus-visible:outline-teal-500 rounded-[1.5rem]"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-900 pr-8">{question}</span>
        <ChevronDown 
          size={20} 
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 pt-1 text-slate-600 leading-relaxed font-light">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResourcesPage() {
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string; youtubeId?: string; blurb?: string } | null>(null);
  const { showToast } = useToast();
  const videoDialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(activeVideo !== null, videoDialogRef);

  /* Clicking the backdrop only helps a pointer user; a keyboard user needs
     Escape to leave the video. */
  useEffect(() => {
    if (!activeVideo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeVideo]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">

      <header className="mb-16 relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-12 md:p-16 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">
            <LifeBuoy size={16} /> Patient Support
          </span>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-white mb-6 tracking-tight leading-tight">Patient Resources</h1>
          <p className="text-xl text-slate-300 font-light leading-relaxed">Guides to read, short films to watch, and useful contacts, for between your appointments.</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          <section>
            <h2 className="text-3xl font-display font-semibold text-slate-50 mb-10 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              Patient guides
            </h2>
            <motion.div 
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {PDFs.map((pdf, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 }
                  }}
                >
                  <a 
                    href={pdf.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium hover:border-teal-50 transition-all duration-300 group h-full"
                  >
                    <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 leading-snug mb-1 group-hover:text-teal-700 transition-colors">{pdf.title}</h3>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Open the guide</span>
                    </div>
                    <Download className="text-slate-200 group-hover:text-teal-400 transition-colors" size={20} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
            {/* The illustrated guides live on /gallery. The home page counts
                them and sends people here, so this names the same count, read
                from the same list the gallery shows, and goes straight there. */}
            <Link
              to="/gallery"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-50 underline underline-offset-4 hover:text-teal-300 transition-colors"
            >
              See all {GALLERY_IMAGES.length} illustrated guides <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </section>

          <section>
            <h2 className="text-3xl font-display font-semibold text-slate-50 mb-10 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <PlayCircle size={20} />
              </div>
              Educational Videos
            </h2>
            <motion.div 
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {VIDEOS.map((video, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 }
                  }}
                >
                  <button
                    onClick={() => setActiveVideo(video)}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium hover:border-teal-100 transition-all duration-300 text-left group w-full h-full overflow-hidden flex flex-col"
                    aria-label={`Play: ${video.title}`}
                  >
                    {/* The film's own thumbnail rather than a generic icon —
                        people choose what to watch by looking at it. */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-slate-950/60 border border-white/20 flex items-center justify-center text-white group-hover:bg-teal-700 group-hover:scale-110 transition-all">
                          <PlayCircle size={30} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-2 flex-1">
                      <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">{video.title}</h3>
                      <p className="text-sm text-slate-500 font-light leading-relaxed">{video.blurb}</p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section>
            <h2 className="text-3xl font-display font-semibold text-slate-50 mb-10 tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
            <Link
              to="/faq"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-slate-50 underline underline-offset-4 hover:text-teal-300 transition-colors"
            >
              More questions answered <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <aside className="space-y-8">
            <section className="bg-red-50 p-8 rounded-[2rem] border border-red-100 shadow-sm">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <ShieldAlert size={24} />
                <h3 className="text-lg font-bold text-red-800">Emergency Info</h3>
              </div>
              <p className="text-red-900 text-sm leading-relaxed mb-6 font-medium">
                This clinic does not handle emergencies. If you are having a medical emergency, call 999 or go to your nearest A&amp;E department now.
              </p>
              <div className="space-y-4">
                <a href="tel:999" className="flex items-center justify-between p-4 bg-white rounded-2xl text-red-600 font-bold border border-red-200 transition-all hover:bg-red-600 hover:text-white">
                  <span>Emergency Services</span>
                  <PhoneCall size={18} />
                </a>
                <a href="tel:111" className="flex items-center justify-between p-4 bg-white rounded-2xl text-slate-900 font-bold border border-slate-200 transition-all hover:bg-slate-900 hover:text-white">
                  <span>NHS 111 (Non-Emergency)</span>
                  <PhoneCall size={18} />
                </a>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-slate-900">
                <Info size={24} className="text-teal-600" />
                <h3 className="text-lg font-bold">Governance & Rights</h3>
              </div>
              <div className="space-y-3">
                {/*
                  These were four buttons that popped "Opening …" and did
                  nothing. One of them offered CQC registration information —
                  a regulatory claim that should only appear if it is true.
                  The list now comes from a single place, links where there is
                  a document, and otherwise routes to the clinic to ask.
                */}
                {GOVERNANCE_DOCS.map((item) =>
                  item.url ? (
                    <a
                      key={item.title}
                      href={item.url}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-medium transition-all group focus-visible:outline-teal-500"
                    >
                      {item.title}
                      <ExternalLink size={16} className="text-slate-300 group-hover:text-teal-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </a>
                  ) : (
                    <Link
                      key={item.title}
                      to="/contact"
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-medium transition-all group focus-visible:outline-teal-500"
                    >
                      <span>
                        {item.title}
                        <span className="block text-[11px] font-normal text-slate-600">Request a copy</span>
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-all" />
                    </Link>
                  )
                )}
              </div>
            </section>

            <section className="bg-gradient-to-br from-teal-700 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Need further help?</h3>
                <p className="text-teal-50 text-sm leading-relaxed font-light">
                  If you cannot find what you are looking for, please contact the clinic.
                </p>
                <Link
                  to="/contact"
                  className="w-full py-4 bg-white text-teal-700 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] focus-visible:outline-teal-500 flex items-center justify-center"
                >
                  Contact the clinic
                </Link>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            </section>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={videoDialogRef}
            className="fixed inset-0 z-[var(--z-modal)] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setActiveVideo(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-display font-semibold text-slate-900 mb-6">{activeVideo.title}</h3>
              
              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden mb-6 flex items-center justify-center relative">
                {activeVideo.url.includes('youtube') || activeVideo.url.includes('vimeo') || activeVideo.url.includes('drive.google.com') ? (
                  <iframe 
                    src={
                      activeVideo.youtubeId
                        /* nocookie: the clinic's visitors should not be tracked
                           by a video host just for watching an explainer. */
                        ? `https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0`
                        : activeVideo.url.includes('drive.google.com')
                          ? activeVideo.url.replace('/view', '/preview')
                          : activeVideo.url.replace('watch?v=', 'embed/')
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    title={activeVideo.title}
                  />
                ) : (
                  <div className="text-slate-400 p-8 text-center text-sm flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                       <MessageSquare size={32} />
                    </div>
                    Video content is hosted on an external secure platform.
                  </div>
                )}
              </div>

              <a 
                href={activeVideo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-700 hover:bg-teal-700 text-white rounded-2xl font-semibold transition-all"
              >
                {activeVideo.youtubeId ? 'Watch on YouTube' : 'Watch on external site'}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
