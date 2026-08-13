import { motion } from 'motion/react';
import { Globe, Navigation, Shield, MapPin, Clock, Phone, Mail, ChevronRight } from 'lucide-react';
import { BOOKING_URL, CLINIC } from '../constants';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../components/ToastSystem';

/*
 * One clinic, because there is one clinic.
 *
 * This page previously advertised three: a Canterbury centre, a Harley Street
 * studio in Marylebone, and a Whitstable practice — with telephone numbers that
 * counted upwards (123456, 987654) and email addresses on a domain the practice
 * does not own. A patient could have driven to any of them and found nothing.
 */
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
  const { showToast } = useToast();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-6 py-12"
    >
      <div className="text-center mb-16 space-y-4">
        <span className="text-sm font-black text-teal-600 uppercase tracking-[0.4em]">Clinical Network</span>
        <h1 className="text-5xl md:text-7xl font-display font-medium text-slate-900 tracking-tight">Our Locations</h1>
        <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
          Accessible, professional clinical spaces designed for your comfort and recovery across Kent and London.
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
                <div className="flex gap-2 text-slate-400 font-medium text-sm">
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
                <button 
                  onClick={() => {
                    trackClick(`Get Directions: ${loc.name}`);
                    showToast(`Launching navigation to ${loc.name}...`, 'info');
                  }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 text-white rounded-2xl font-bold transition-all hover:bg-teal-600 group/btn"
                >
                  <Navigation size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  Get Directions
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                <Shield size={14} /> Clinical Excellence Verified
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
                Can't make it to a <br />
                <span className="text-teal-400">physical location?</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Our advanced AI and voice-guided hubs offer diagnostic preliminary insights and wellbeing advice accessible from anywhere in the world.
              </p>
              <div className="flex flex-wrap gap-4">
                 <button 
                   onClick={() => window.open(BOOKING_URL, '_blank')}
                   className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-teal-500 transition-all flex items-center gap-2"
                 >
                    <Globe size={18} /> Online Portal
                 </button>
                 <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    Learn More <ChevronRight size={18} />
                 </button>
              </div>
           </div>
           <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10">
                 <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-50" alt="Clinical Hub" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-teal-600 p-8 rounded-[2.5rem] shadow-2xl text-white">
                 <div className="text-4xl font-bold mb-1">100%</div>
                 <div className="text-[10px] uppercase font-black tracking-widest opacity-80">Certified Spaces</div>
              </div>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-150 duration-1000"></div>
      </div>
    </motion.div>
  );
}
