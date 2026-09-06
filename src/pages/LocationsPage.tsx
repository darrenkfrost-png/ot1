import { motion } from 'motion/react';
import { Globe, Navigation, Shield, MapPin, Clock, Phone, Mail, ChevronRight } from 'lucide-react';
import { BOOKING_URL, CLINIC } from '../constants';
import { REVIEWS_SOURCE } from '../data/reviews';
import { useAnalytics } from '../context/AnalyticsContext';

/*
 * One clinic, because there is one clinic.
 *
 * This page previously advertised three: a Canterbury centre, a Harley Street
 * studio in Marylebone, and a Whitstable practice — with telephone numbers that
 * counted upwards (123456, 987654) and email addresses on a domain the practice
 * does not own. A patient could have driven to any of them and found nothing.
 */
/*
 * Directions come from the address record, not a hand-typed string, so the
 * pin can never point somewhere the letterhead does not.
 */
const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CLINIC.address.line1} ${CLINIC.address.town} ${CLINIC.address.postcode}`
)}`;

const LOCATIONS = [
  {
    id: 'herne-bay',
    name: CLINIC.name,
    address: CLINIC.addressLine,
    phone: CLINIC.telephone,
    phoneLink: CLINIC.telephoneLink,
    email: CLINIC.email,
    hours: CLINIC.openingHours.map((s) => `${s.days}: ${s.hours}`).join(' | '),
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    tags: ['Osteopathy', 'Acupuncture', 'Sports Massage', 'Footcare']
  }
];

export default function LocationsPage() {
  const { trackClick } = useAnalytics();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-6 py-12"
    >
      <div className="text-center mb-16 space-y-4">
        <span className="text-sm font-black text-teal-600 uppercase tracking-[0.4em]">Herne Bay, Kent</span>
        <h1 className="text-5xl md:text-7xl font-display font-medium text-slate-50 tracking-tight">Find the Clinic</h1>
        <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto">
          One accessible, professional clinical space on Herne Bay High Street, designed for your comfort and recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LOCATIONS.map((loc, i) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[3rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all overflow-hidden flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={loc.image} alt={loc.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                {loc.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-10 flex-1 flex flex-col space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">{loc.name}</h3>
                <div className="flex gap-2 text-slate-600 font-medium text-sm">
                  <MapPin size={16} className="shrink-0 text-teal-500" />
                  <span>{loc.address}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600">
                    <Clock size={16} />
                  </div>
                  <span>{loc.hours}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600">
                    <Phone size={16} />
                  </div>
                  <span>{loc.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600">
                    <Mail size={16} />
                  </div>
                  <span className="truncate">{loc.email}</span>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(`Get Directions: ${loc.name}`)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white rounded-2xl font-bold transition-all hover:bg-teal-700 group/btn"
                >
                  <Navigation size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  Get Directions
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
        {/*
          * This panel once promised "AI and voice-guided diagnostic hubs" and a
          * "100% Certified Spaces" figure — none of which exist. What is true:
          * the practitioners are GOsC-registered, appointments book online any
          * time, and the phone is answered during opening hours. Everything
          * below is read from CLINIC and REVIEWS_SOURCE so it stays true.
          */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                <Shield size={14} /> {CLINIC.regulator.name} registered
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
                Questions before <br />
                <span className="text-teal-400">your first visit?</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Appointments can be booked online at any time. If you would rather talk it
                through first, call us on {CLINIC.telephone} during opening hours or email{' '}
                {CLINIC.email} and we will help you choose the right appointment.
              </p>
              <div className="flex flex-wrap gap-4">
                 <button
                   onClick={() => window.open(BOOKING_URL, '_blank')}
                   className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-teal-500 transition-all flex items-center gap-2"
                 >
                    <Globe size={18} /> Book Online
                 </button>
                 <a
                   href="#/faq"
                   className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                 >
                    Common Questions <ChevronRight size={18} />
                 </a>
              </div>
           </div>
           <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10">
                 <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-50" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              </div>
              <a
                href={REVIEWS_SOURCE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-6 -left-6 bg-teal-700 p-8 rounded-[2.5rem] shadow-2xl text-white block hover:bg-teal-800 transition-colors"
              >
                 <div className="text-4xl font-bold mb-1">{REVIEWS_SOURCE.rating}</div>
                 <div className="text-[10px] uppercase font-black tracking-widest opacity-80">{REVIEWS_SOURCE.count} {REVIEWS_SOURCE.label}</div>
              </a>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-150 duration-1000"></div>
      </div>
    </motion.div>
  );
}
