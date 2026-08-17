import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, HelpCircle, ShieldCheck, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { FAQS, FaqItem } from '../data/faq';
import { SpineMotif } from '../components/AnatomyMotif';
import { BOOKING_URL } from '../constants';
import { useAnalytics } from '../context/AnalyticsContext';

const CATEGORY_ORDER: FaqItem['category'][] = [
  'Getting started',
  'Your appointment',
  'Safety & regulation',
  'Treatments',
];

export default function FaqPage() {
  const { trackClick } = useAnalytics();

  /*
   * Search engines read this to show questions directly in results. It is built
   * from the same source as the visible answers, so the two cannot drift apart -
   * marking up text that is not on the page is a guidelines violation as well as
   * a lie to the reader.
   */
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-14"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Quiet anatomy in the margin — texture, not illustration. */}
      <SpineMotif className="hidden xl:block fixed top-24 right-10 w-24 h-[460px] text-teal-700" opacity={7} />

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <li>
            <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1.5 focus-visible:outline-teal-500 rounded px-1 py-0.5">
              <Home size={14} /> Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={14} /></li>
          <li className="text-slate-700" aria-current="page">Questions</li>
        </ol>
      </nav>

      <header className="space-y-6">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-black uppercase tracking-[0.3em]">
          <HelpCircle size={15} /> Before you book
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-900 tracking-tight leading-[1.05]">
          Questions people ask <span className="text-teal-600">before their first visit.</span>
        </h1>
        <p className="text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
          Straight answers about what osteopathy is, what happens in an appointment, and how the
          profession is regulated. If your question is not here, ask us — we would rather answer it
          than have you guess.
        </p>
      </header>

      {CATEGORY_ORDER.map((category) => {
        const items = FAQS.filter((f) => f.category === category);
        if (!items.length) return null;
        return (
          <section key={category} className="space-y-4" aria-labelledby={`faq-${category.replace(/\W+/g, '-').toLowerCase()}`}>
            <h2
              id={`faq-${category.replace(/\W+/g, '-').toLowerCase()}`}
              className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-600"
            >
              {category}
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                /* <details> keeps every answer in the page for search engines and
                   gives keyboard and screen-reader behaviour for free. */
                <details
                  key={item.q}
                  className="group bg-white rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-premium transition-shadow overflow-hidden"
                  onToggle={(e) => {
                    if ((e.currentTarget as HTMLDetailsElement).open) trackClick(`FAQ: ${item.q}`);
                  }}
                >
                  <summary className="cursor-pointer list-none px-7 py-6 flex items-start justify-between gap-6 font-bold text-slate-900 focus-visible:outline-teal-500 rounded-[1.75rem]">
                    <h3 className="text-base md:text-lg leading-snug">{item.q}</h3>
                    <ChevronRight
                      size={20}
                      className="shrink-0 mt-0.5 text-teal-600 transition-transform duration-300 group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-7 pb-7 -mt-1">
                    <p className="text-slate-600 leading-relaxed font-light">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}

      <aside className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7 flex gap-5">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} aria-hidden="true" />
        <div className="space-y-2">
          <h2 className="font-bold text-amber-900">If symptoms are urgent, do not wait for an appointment</h2>
          <p className="text-sm text-amber-900/80 leading-relaxed font-light">
            Loss of bladder or bowel control, numbness around the saddle area, sudden severe leg
            weakness, or back pain with fever or unexplained weight loss all need emergency
            assessment. Go to A&amp;E or call 999.
          </p>
        </div>
      </aside>

      <section className="rounded-[2.5rem] bg-slate-900 text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-8 justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-teal-400 text-[11px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={16} /> Registered practice
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tight">Still deciding?</h2>
          <p className="text-slate-400 font-light max-w-md leading-relaxed">
            Book an assessment and you will get an honest answer about whether we can help — including
            if the answer is someone else.
          </p>
        </div>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick('FAQ Book Online')}
          className="shrink-0 inline-flex items-center justify-center gap-3 px-9 py-5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-teal-500/25 focus-visible:outline-teal-400"
          aria-label="Book an appointment online — opens our booking system in a new tab"
        >
          <Calendar size={20} />
          Book online
          <ExternalLink size={14} className="opacity-70" aria-hidden="true" />
        </a>
      </section>
    </motion.div>
  );
}
