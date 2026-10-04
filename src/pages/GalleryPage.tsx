import { GALLERY_IMAGES } from '../data/images';
import { VIDEOS } from '../data/resources';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useEffect, useRef, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Home, Play, Sparkles, Maximize2, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';
import { useAnalytics } from '../context/AnalyticsContext';
import { CLINIC } from '../data/clinic';

/*
 * WHAT EACH GUIDE IS ABOUT, IN WORDS.
 *
 * The guides are pictures of text. A screen reader used to announce them as
 * "Open patient guide 1 of 42, Open patient guide 2 of 42…", so a blind or
 * partially sighted patient had no way to tell the sciatica guides from the
 * headache ones. Each subject below was read off the guide itself by looking
 * at it — its real subject, not its printed headline, because several print
 * production labels ("Headline:", "Hero Illustration") that must never become
 * a control's name. A guide restored later without a line here falls back to
 * its number, so nothing breaks; add its subject when it comes back.
 *
 * These name the subject only. A text version of what each guide SAYS needs
 * the clinic to approve the medical wording first.
 */
const GUIDE_TOPICS: Record<string, string> = {
  '/images/gallery-02.webp': 'Sciatica: three common causes',
  '/images/gallery-03.webp': 'Understanding sciatica',
  '/images/gallery-05.webp': 'The path of the sciatic nerve',
  '/images/gallery-06.webp': 'The sciatic nerve through the hip and leg',
  '/images/gallery-07.webp': 'Sciatica: its three main causes and how each is treated',
  '/images/gallery-08.webp': 'How a compressed spine irritates the sciatic nerve',
  '/images/gallery-09.webp': 'Sciatica: warning signs and self-help',
  '/images/gallery-11.webp': 'Sciatica: its three main causes, in a table',
  '/images/gallery-13.webp': 'Neck-related headaches, tennis elbow and heel pain',
  '/images/gallery-14.webp': 'Headaches that start in the neck',
  '/images/gallery-15.webp': 'Plantar fasciitis: heel and arch pain',
  '/images/gallery-16.webp': "Tennis elbow and golfer's elbow",
  '/images/gallery-17.webp': 'Headaches that start in the neck',
  '/images/gallery-18.webp': 'Arch and heel pain',
  '/images/gallery-19.webp': 'Headaches that start in the neck',
  '/images/gallery-22.webp': 'Head posture and neck-related headaches',
  '/images/gallery-24.webp': 'Knee pain: easing pressure on the joint',
  '/images/gallery-25.webp': 'Knee pain: easing pressure on the joint',
  '/images/gallery-26.webp': 'Knee pain: easing pressure on the joint',
  '/images/gallery-28.webp': 'Sports massage for active people',
  '/images/gallery-29.webp': 'Hip, pelvic and back changes in pregnancy',
  '/images/gallery-31.webp': 'Jaw pain (TMJ)',
  '/images/gallery-33.webp': 'Rib pain and breathing',
  '/images/gallery-35.webp': 'Ankle sprains and balance',
  '/images/gallery-37.webp': 'Knee pain in growing young athletes',
  '/images/gallery-38.webp': 'Long-lasting pain and a sensitive nervous system',
  '/images/gallery-40.webp': 'Long-lasting pain and a sensitive nervous system',
  '/images/gallery-41.webp': 'Wear and tear in the hip (osteoarthritis)',
  '/images/gallery-42.webp': 'How your treatment is chosen with you',
  '/images/gallery-44.webp': 'Neck strain from screens and desk work',
  '/images/gallery-45.webp': 'Sitting well: the pelvis at a desk',
  '/images/gallery-46.webp': 'Neck strain from screens and desk work',
  '/images/gallery-47.webp': 'Massage for muscle tension from stress',
  '/images/gallery-49.webp': 'Sleeping positions and a pillow between the knees',
  '/images/gallery-50.webp': "The clinic's approach to recovery",
  '/images/gallery-51.webp': 'Spinal stenosis: a narrowed spinal canal',
  '/images/gallery-52.webp': 'Piriformis syndrome: a hip muscle and the sciatic nerve',
  '/images/gallery-53.webp': 'A slipped (herniated) disc',
  '/images/gallery-54.webp': 'Sciatica: how lying, sitting and standing change it',
  '/images/gallery-55.webp': 'Sciatica: the different kinds of symptoms',
  '/images/gallery-56.webp': 'The sciatic nerve, the largest nerve in the body',
  '/images/gallery-57.webp': 'Sciatica: similar symptoms, different causes',
};

const guideTopic = (src: string, index: number) =>
  GUIDE_TOPICS[src] ?? `Patient guide ${index + 1}`;

/*
 * The clinic's own film, read from the list of films rather than typed here.
 *
 * This section used to be a "Virtual Clinic Tour" whose button opened a Google
 * Drive file that is a still picture (a patient guide, "56.png"), beside a
 * stock photograph of a Spanish hospital corridor captioned as the tour. There
 * has never been a tour film. Until the clinic supplies one, the section shows
 * a real film from the practice's own YouTube channel and says so.
 */
const clinicFilm = VIDEOS[1];
const clinicFilmEmbed = `https://www.youtube-nocookie.com/embed/${clinicFilm.youtubeId}?rel=0`;

/*
 * Keyboard focus for a pop-up window.
 *
 * Opening a guide with Enter used to leave focus on the tile behind the dark
 * overlay, so Tab walked through every hidden tile before reaching Close, and
 * closing dropped focus to the top of the page. This moves focus into the
 * window when it opens, keeps Tab inside it (the same pattern as the phone
 * menu drawer in App.tsx), and hands focus back to whatever opened it.
 * Focus that escapes by another route, such as out of the film player, is
 * brought back too.
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

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { showToast } = useToast();
  const { trackClick } = useAnalytics();

  /*
   * The filters that used to sit here - All / Interior / Clinical / Equipment -
   * did not filter anything. They cut the list by position, as the comment on
   * them admitted ("simulated categorization based on index"), so "Interior"
   * showed the first four guides, which are sciatica infographics, and
   * "Equipment" showed everything from the ninth onward. A control that
   * promises to sort by subject and instead returns an arbitrary slice is
   * worse than no control, so it is gone until the guides carry real subjects.
   */
  const filteredImages = GALLERY_IMAGES;

  const [isFilmOpen, setIsFilmOpen] = useState(false);

  const guideDialogRef = useRef<HTMLDivElement>(null);
  const filmDialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(selectedIndex !== null, guideDialogRef);
  useDialogFocus(isFilmOpen, filmDialogRef);

  /*
   * Some of the artwork was saved on its side, so it opens portrait when the
   * content is landscape. Rotation is per-image and resets when you move on,
   * so turning one does not leave the next one crooked.
   */
  const [rotation, setRotation] = useState(0);

  const rotate = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation((current) => (current + 90) % 360);
  }, []);

  const close = useCallback(() => {
    setSelectedIndex(null);
    setIsFilmOpen(false);
    setRotation(0);
  }, []);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation(0);
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % GALLERY_IMAGES.length));
  }, []);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotation(0);
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length));
  }, []);

  const download = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const link = document.createElement('a');
    const href = GALLERY_IMAGES[selectedIndex];
    // Take the extension from the file itself; these are WebP, not JPEG, and a
    // wrong extension saves a file the visitor's computer cannot open.
    const extension = href.split('.').pop()?.split('?')[0] || 'webp';
    link.href = href;
    link.download = `ct6-patient-guide-${selectedIndex + 1}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* Escape must also reach the film, which opens without a
         selected guide — the arrow keys stay lightbox-only. */
      if (e.key === 'Escape' && (selectedIndex !== null || isFilmOpen)) {
        close();
        return;
      }
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'r' || e.key === 'R') rotate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isFilmOpen, close, next, prev, rotate]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-16">

      <header className="text-center space-y-6 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">
          <Sparkles size={16} /> Guides & film
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-50 tracking-tight leading-tight">Patient <span className="text-teal-600">guides</span></h1>
        <p className="text-xl text-slate-300 font-light leading-relaxed">Illustrated guides to the problems we treat, and a short film from the clinic.</p>
      </header>

      <div className="space-y-10">

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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredImages.map((src, index) => (
            <motion.figure
              layout
              key={src}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 10 },
                show: { opacity: 1, scale: 1, y: 0 }
              }}
              className="space-y-3"
            >
            <motion.div
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              /*
               * These are portrait guides, not square photographs. A square
               * tile cropped away the top and bottom of every one - which is
               * where their headings and conclusions live.
               */
              className="aspect-[788/1400] rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-premium transition-all cursor-pointer relative group border border-white/60 crystal-glass holographic-border focus-visible:outline-teal-500"
              onClick={() => setSelectedIndex(GALLERY_IMAGES.indexOf(src))}
              /* A tile that only answers the mouse shuts out everyone on a
                 keyboard; role="button" + tabIndex puts it in the tab order,
                 and Enter/Space have to be wired by hand on a div. */
              role="button"
              tabIndex={0}
              aria-label={`Open guide: ${guideTopic(src, index)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(GALLERY_IMAGES.indexOf(src));
                }
              }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" width={788} height={1400} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all duration-500 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 flex items-center justify-center text-white">
                  <Maximize2 size={20} />
                </div>
              </div>
            </motion.div>
            {/* The subject in words, so a patient can choose by reading, not
                only by squinting at a thumbnail. Hidden from screen readers
                because the tile above already says it. On its own dark
                backing, so it stays readable whatever the moving wallpaper
                behind it is doing. */}
            <figcaption aria-hidden="true" className="rounded-xl bg-slate-950/80 px-3 py-2 text-sm font-medium leading-snug text-white">
              {guideTopic(src, index)}
            </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-16 holographic-border shadow-glow-teal"
      >
        <div className="relative z-10 flex-1 space-y-8">
           <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-tight">A film from the clinic</h2>
           <p className="text-lg text-slate-300 font-light leading-relaxed">
             The practice's own short film about the treatments it offers, from its YouTube channel.
           </p>
           <button
             onClick={() => {
                setIsFilmOpen(true);
                trackClick("Clinic Film Started");
             }}
             className="focus-inset px-10 py-5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-teal-500/10 group active:scale-95"
           >
             Watch the clinic's film <Play size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
        {/* A real button, so the picture answers a keyboard as well as a
            mouse. The picture is the film's own thumbnail from YouTube. */}
        <button
          type="button"
          onClick={() => {
             setIsFilmOpen(true);
             trackClick("Clinic Film Thumbnail Clicked");
          }}
          aria-label={`Play the clinic's film: ${clinicFilm.title}`}
          className="focus-inset relative flex-1 w-full aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group cursor-pointer bg-slate-950"
        >
          <img src={`https://i.ytimg.com/vi/${clinicFilm.youtubeId}/hqdefault.jpg`} loading="lazy" decoding="async" width={480} height={360} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play size={32} fill="white" className="ml-1" />
            </div>
          </div>
        </button>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      </motion.section>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            key="guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            ref={guideDialogRef}
            className="fixed inset-0 z-[var(--z-modal)] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`Patient guide ${selectedIndex + 1} of ${GALLERY_IMAGES.length}: ${guideTopic(GALLERY_IMAGES[selectedIndex], selectedIndex)}`}
          >
            <button aria-label="Close guide" className="absolute top-4 right-4 text-white hover:text-teal-400 p-2 transition" onClick={close}><X size={28} /></button>
            <button aria-label="Download this guide" className="absolute top-4 right-16 text-white hover:text-teal-400 p-2 transition" onClick={download}><Download size={28} /></button>
            <button
              aria-label={`Rotate this guide (currently ${rotation} degrees)`}
              title="Rotate — or press R"
              className="absolute top-4 right-28 text-white hover:text-teal-400 p-2 transition"
              onClick={rotate}
            >
              <RotateCw size={28} />
            </button>

            <div className="absolute top-4 left-4 text-white font-mono text-sm tracking-widest bg-slate-900/50 px-3 py-1 rounded-full">
                {selectedIndex + 1} / {GALLERY_IMAGES.length}
            </div>

            <button aria-label="Previous guide" className="absolute left-4 text-white hover:text-teal-400 p-2 md:p-6 transition-transform hover:scale-110" onClick={prev}><ChevronLeft size={48} /></button>
            <button aria-label="Next guide" className="absolute right-4 text-white hover:text-teal-400 p-2 md:p-6 transition-transform hover:scale-110" onClick={next}><ChevronRight size={48} /></button>

            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              /* Rotation goes through motion, not an inline style: motion owns
                 the transform on this element and would overwrite it. */
              animate={{ scale: 1, opacity: 1, rotate: rotation }}
              transition={{ rotate: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              src={GALLERY_IMAGES[selectedIndex]}
              alt={`${CLINIC.name} patient guide: ${guideTopic(GALLERY_IMAGES[selectedIndex], selectedIndex)}`}
              width={788}
              height={1400}
              /*
               * A rotated element keeps its original layout box, so at 90 or
               * 270 degrees the picture would spill off the screen unless the
               * limits are swapped: its width is now bound by the height of
               * the viewport, and vice versa.
               */
              className={cn(
                'object-contain shadow-2xl border border-white/5 rounded-lg',
                rotation % 180 === 0 ? 'max-w-full max-h-full' : 'max-w-[88vh] max-h-[88vw]'
              )}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}

        {isFilmOpen && (
          <motion.div
            key="clinic-film"
            ref={filmDialogRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="The clinic's film"
          >
            <button aria-label="Close the film" className="absolute top-8 right-8 text-white hover:text-teal-400 p-2 transition-all hover:rotate-90" onClick={close}><X size={32} /></button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-[3rem] overflow-hidden shadow-glow-teal border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
               {/* nocookie, as on the Resources page: a patient should not be
                   tracked by a video host just for watching the clinic's film. */}
               <iframe
                 src={clinicFilmEmbed}
                 className="w-full h-full"
                 allow="autoplay; encrypted-media; picture-in-picture"
                 allowFullScreen
                 title={clinicFilm.title}
               />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
