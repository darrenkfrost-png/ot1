import { useParams, Link } from 'react-router-dom';
import { PRACTITIONERS } from '../data';
import { BOOKING_URL, CLINIC } from '../constants';
import { reviewsForPractitioner } from '../data/reviews';
import { Award, Stethoscope, Mail, CheckCircle2, ChevronRight, Home, Calendar, MapPin, Star, Shield, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/ToastSystem';
import { useAnalytics } from '../context/AnalyticsContext';

export default function PractitionerDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { trackClick } = useAnalytics();
  const practitioner = PRACTITIONERS.find(p => p.id === id);

  if (!practitioner) {
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
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Practitioner Not Found</h3>
          <p className="text-slate-500 max-w-md mx-auto font-light text-lg">
            We couldn't locate the clinical professional you were searching for. They may have moved to a different department.
          </p>
        </div>
        <Link 
          to="/practitioners" 
          className="group flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-teal-900/20 hover:bg-teal-500 hover:-translate-y-1 transition-all active:scale-[0.98] z-10 relative"
        >
          <Home size={20} />
          Back to Team
        </Link>
      </div>
    );
  }

  // Only osteopaths are on the GOsC register — a massage therapist or
  // reflexologist is not, and implying otherwise would be misleading.
  const isOsteopath = /osteopath/i.test(practitioner.role);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-10"
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
          <li aria-current="page">
            <span className="text-teal-600 font-bold px-1 py-0.5 truncate block" title={practitioner.name}>
              {practitioner.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-8">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-premium border border-slate-100"
          >
            <img src={practitioner.image} alt={practitioner.name} fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/40 backdrop-blur-3xl crystal-glass p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6 holographic-border"
          >
            <div className="flex items-center gap-4 text-slate-700 relative z-10">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Award size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Qualifications</span>
                <span className="font-semibold">{practitioner.qualifications || 'Certified Professional'}</span>
              </div>
            </div>
            
            <div className="w-full h-px bg-slate-100" />
            
            <div className="flex items-center gap-4 text-slate-700">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Stethoscope size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Role</span>
                <span className="font-semibold">{practitioner.role}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                trackClick(`Contact Practitioner: ${practitioner.name}`);
                showToast(`Opening secure message portal for ${practitioner.name}...`, 'info');
              }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] cursor-pointer"
            >
              <Mail size={18} />
              <span>Contact {practitioner.name.split(' ')[0]}</span>
            </button>
          </motion.div>
        </div>

        <div className="md:col-span-8 space-y-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-4 tracking-tight">{practitioner.name}</h1>
            <p className="text-2xl text-teal-600 font-light tracking-tight">{practitioner.role}</p>
          </div>

          <div className="space-y-4">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-3xl crystal-glass p-10 rounded-[2.5rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group relative overflow-hidden holographic-border"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 text-teal-600 pointer-events-none group-hover:scale-125 transition-transform duration-[2000ms]">
                <Stethoscope size={120} />
              </div>
              <h2 className="text-sm font-black text-teal-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                Executive Summary
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-5 text-xl font-light relative z-10">
                <p>{practitioner.bio}</p>
              </div>
            </motion.section>

            <div className="grid md:grid-cols-2 gap-8">
                {practitioner.philosophy && (
                    <motion.section 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-xl transition-all"
                    >
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-teal-50 text-teal-600 rounded-xl font-display font-black">P</div>
                        Core Philosophy
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-light text-lg">{practitioner.philosophy}</p>
                    </motion.section>
                )}                
                {practitioner.approach && (
                    <motion.section 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-xl transition-all"
                    >
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-teal-50 text-teal-600 rounded-xl font-display font-black">A</div>
                        Strategic Approach
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-light text-lg">{practitioner.approach}</p>
                    </motion.section>
                )}
            </div>

            {practitioner.caseStudies && practitioner.caseStudies.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900 p-10 rounded-[2.5rem] text-slate-100 shadow-lg"
              >
                <h3 className="text-2xl font-display font-semibold text-white mb-8 tracking-tight">Clinical Outcomes</h3>
                <ul className="space-y-6">
                  {practitioner.caseStudies.map((cs, i) => (
                    <li key={i} className="flex gap-4 text-slate-300 leading-relaxed text-lg font-light">
                      <div className="mt-1.5 p-1 rounded-full bg-teal-500/20 text-teal-400">
                         <CheckCircle2 size={16} />
                      </div>
                      {cs}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {practitioner.specialisations && practitioner.specialisations.length > 0 && (
                <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Shield size={16} /> Core Specialisations
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {practitioner.specialisations.map((spec, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest border border-slate-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {practitioner.services && practitioner.services.length > 0 && (
                <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Clinical Services
                  </h2>
                  <div className="flex flex-col gap-3">
                    {practitioner.services.map((service, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={12} />
                        </div>
                        {service}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/*
              This was a "Professional Timeline" listing three jobs — Senior
              Practitioner here since 2020, Clinical Osteopath at "London
              Health", Junior Associate at "Kent Medical". It was hardcoded, so
              every practitioner was shown the same career, and none of it was
              real. Inventing an employment history for a named, regulated
              healthcare professional is a false claim about that person.

              What replaces it is only what the practice actually publishes:
              the role, the letters after their name, and who regulates them.
            */}
            <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
              <h2 className="text-2xl font-display font-semibold text-slate-900 mb-10 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                Credentials
              </h2>
              <dl className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                  <dt className="text-[10px] font-bold text-teal-600 uppercase tracking-widest sm:w-40 shrink-0">Role</dt>
                  <dd className="text-lg font-bold text-slate-800">{practitioner.role}</dd>
                </div>
                {practitioner.qualifications && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                    <dt className="text-[10px] font-bold text-teal-600 uppercase tracking-widest sm:w-40 shrink-0">Qualifications</dt>
                    <dd className="text-lg font-bold text-slate-800">{practitioner.qualifications}</dd>
                  </div>
                )}
                {isOsteopath && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                    <dt className="text-[10px] font-bold text-teal-600 uppercase tracking-widest sm:w-40 shrink-0">Regulated by</dt>
                    <dd className="text-base text-slate-600 font-light leading-relaxed">
                      <a
                        href={CLINIC.regulator.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-800 hover:text-teal-600 transition-colors focus-visible:outline-teal-500"
                      >
                        {CLINIC.regulator.name}
                      </a>
                      <span className="block text-sm mt-1">
                        Every osteopath in the UK must be registered with the {CLINIC.regulator.abbreviation} by law. You can check the register yourself.
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="bg-teal-50/50 p-10 rounded-[3rem] border border-teal-100/50">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-display font-semibold text-slate-900 tracking-tight">Patient Experiences</h2>
                <div className="flex gap-1 text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviewsForPractitioner(practitioner.name).map((testimonial, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-white/50 space-y-4">
                    <p className="text-slate-600 font-light italic leading-relaxed">"{testimonial.quote}"</p>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden holographic-border crystal-glass border border-slate-800">
               <div className="absolute inset-0 neural-grid opacity-20 mix-blend-screen pointer-events-none z-0"></div>
               <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-display font-medium text-white tracking-tight">
                  Start Your Recovery with {practitioner.name.split(' ')[0]}
                </h2>
                <p className="text-slate-400 max-w-md mx-auto font-light">
                  Book a direct session or initial assessment to begin your tailored health journey today.
                </p>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(`Book Practitioner: ${practitioner.name}`)}
                  className="w-full sm:w-auto px-12 py-5 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-500 transition-all shadow-xl shadow-teal-900/40 active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-3 group"
                  aria-label={`Book an appointment with ${practitioner.name} — opens our booking system in a new tab`}
                >
                  Book Now
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
