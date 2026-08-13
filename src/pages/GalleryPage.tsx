import { GALLERY_IMAGES } from '../data/images';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Home, Play, Sparkles, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';
import { useAnalytics } from '../context/AnalyticsContext';

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const { showToast } = useToast();
  const { trackClick } = useAnalytics();

  const categories = ['All', 'Interior', 'Clinical', 'Equipment'];

  // Categorize images (simulated categorization based on index)
  const filteredImages = useMemo(() => {
    if (activeCategory === 'All') return GALLERY_IMAGES;
    if (activeCategory === 'Interior') return GALLERY_IMAGES.slice(0, 4);
    if (activeCategory === 'Clinical') return GALLERY_IMAGES.slice(4, 8);
    return GALLERY_IMAGES.slice(8);
  }, [activeCategory]);

  const [isTourOpen, setIsTourOpen] = useState(false);
  const tourVideoUrl = "https://drive.google.com/file/d/1WyllusrCUOg_Vo7qmkwZPhlI74PaOfug/preview";

  const close = useCallback(() => {
    setSelectedIndex(null);
    setIsTourOpen(false);
  }, []);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % GALLERY_IMAGES.length));
  }, []);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      if (selectedIndex === null) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, close, next, prev]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-16">
      <nav aria-label="Breadcrumb" className="mt-4">
        <ol className="flex items-center gap-2 text-sm text-slate-400 font-medium whitespace-nowrap overflow-x-auto text-center justify-center sm:justify-start">
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
              Clinic Gallery
            </span>
          </li>
        </ol>
      </nav>

      <header className="text-center space-y-6 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-[0.3em]">
          <Sparkles size={16} /> Visual Journey
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-tight">State-of-the-Art <span className="text-teal-600">Clinical Spaces</span></h1>
        <p className="text-xl text-slate-500 font-light leading-relaxed">Explore our modern clinics in Canterbury, designed for comfort, healing, and clinical excellence.</p>
      </header>

      <div className="space-y-10">
        <div className="flex items-center justify-center flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
                activeCategory === cat 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20" 
                  : "bg-white text-slate-400 border border-slate-100 hover:border-teal-200 hover:text-teal-600"
              )}
            >
              {cat}
            </button>
          ))}
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredImages.map((src, index) => (
            <motion.div
              layout
              key={src}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 10 },
                show: { opacity: 1, scale: 1, y: 0 }
              }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              /*
               * These are portrait guides, not square photographs. A square
               * tile cropped away the top and bottom of every one - which is
               * where their headings and conclusions live.
               */
              className="aspect-[788/1400] rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-premium transition-all cursor-pointer relative group border border-white/60 crystal-glass holographic-border"
              onClick={() => setSelectedIndex(GALLERY_IMAGES.indexOf(src))}
            >
              <img src={src} alt={`CT6 Wellbeing patient guide ${index + 1} — open to read in full`} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all duration-500 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 flex items-center justify-center text-white">
                  <Maximize2 size={20} />
                </div>
              </div>
            </motion.div>
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
           <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-tight">Virtual Clinic Tour</h2>
           <p className="text-lg text-slate-400 font-light leading-relaxed">
             Take a guided virtual tour of our CT6 Canterbury clinics. See our treatment rooms, diagnostic suites, and patient recovery areas from the comfort of your home.
           </p>
           <button 
             onClick={() => {
                setIsTourOpen(true);
                trackClick("Virtual Tour Video Started");
             }}
             className="px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-teal-500/10 group active:scale-95"
           >
             Watch Tour Video <Play size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
        <div 
          onClick={() => {
             setIsTourOpen(true);
             trackClick("Virtual Tour Thumbnail Clicked");
          }}
          className="relative flex-1 w-full aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
        >
          <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" alt="Clinic tour video" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play size={32} fill="white" className="ml-1" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      </motion.section>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`Patient guide ${selectedIndex + 1} of ${GALLERY_IMAGES.length}`}
          >
            <button aria-label="Close guide" className="absolute top-4 right-4 text-white hover:text-teal-400 p-2 transition" onClick={close}><X size={28} /></button>
            <button aria-label="Download this guide" className="absolute top-4 right-16 text-white hover:text-teal-400 p-2 transition" onClick={download}><Download size={28} /></button>

            <div className="absolute top-4 left-4 text-white font-mono text-sm tracking-widest bg-slate-900/50 px-3 py-1 rounded-full">
                {selectedIndex + 1} / {GALLERY_IMAGES.length}
            </div>

            <button aria-label="Previous guide" className="absolute left-4 text-white hover:text-teal-400 p-2 md:p-6 transition-transform hover:scale-110" onClick={prev}><ChevronLeft size={48} /></button>
            <button aria-label="Next guide" className="absolute right-4 text-white hover:text-teal-400 p-2 md:p-6 transition-transform hover:scale-110" onClick={next}><ChevronRight size={48} /></button>

            <motion.img
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={GALLERY_IMAGES[selectedIndex]}
              alt={`CT6 Wellbeing patient guide ${selectedIndex + 1} of ${GALLERY_IMAGES.length}`}
              className="max-w-full max-h-full object-contain shadow-2xl border border-white/5 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}

        {isTourOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4" 
            onClick={close}
          >
            <button className="absolute top-8 right-8 text-white hover:text-teal-400 p-2 transition-all hover:rotate-90" onClick={close}><X size={32} /></button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-[3rem] overflow-hidden shadow-glow-teal border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
               <iframe 
                 src={tourVideoUrl}
                 className="w-full h-full"
                 allow="autoplay"
                 title="Clinical Virtual Tour"
               />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
