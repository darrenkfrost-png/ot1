import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, ChevronRight, ArrowRight, Clock, ShieldCheck, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useToast } from '../components/ToastSystem';
import { BOOKING_URL, CLINIC } from '../constants';

export default function ContactPage() {
  const { trackClick } = useAnalytics();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  /*
   * This used to wait two seconds and then announce "Message sent
   * successfully. Our clinical team will respond within 24 hours." Nothing was
   * ever sent. Patients were told their enquiry had arrived and then heard
   * nothing back, because there was nothing to hear back from.
   *
   * Success is now claimed only when the server confirms delivery. Anything
   * else says so and offers a route that does work.
   */
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSendFailed(false);
    trackClick("Contact Form Submission Started");

    // Client-side validation
    if (!formData.name.trim()) {
      setSendFailed(true);
      showToast('Please enter your name.', 'error');
      setIsSubmitting(false);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setSendFailed(true);
      showToast('Please enter a valid email address.', 'error');
      setIsSubmitting(false);
      return;
    }
    if (!formData.message.trim()) {
      setSendFailed(true);
      showToast('Please enter your message.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({ ok: false }));

      if (response.ok && result.ok) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
        showToast('Message sent. We will come back to you as soon as we can.', 'success');
        trackClick('Contact Form Submission Success');
      } else {
        setSendFailed(true);
        showToast('That message could not be sent. Please use online booking or call the clinic.', 'error');
        trackClick(`Contact Form Submission Failed: ${result.error ?? response.status}`);
      }
    } catch {
      setSendFailed(true);
      showToast('That message could not be sent. Please use online booking or call the clinic.', 'error');
      trackClick('Contact Form Submission Failed: network');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-6 py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Info */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <span className="text-sm font-black text-teal-600 uppercase tracking-[0.4em]">Get in Touch</span>
            <h1 className="text-5xl md:text-7xl font-display font-medium text-slate-900 tracking-tight leading-[0.9]">
              Let's start your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">recovery.</span>
            </h1>
            <p className="text-xl text-slate-500 font-light leading-relaxed max-w-sm">
              Professional osteopathic care and holistic wellbeing support is just a message away.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-teal-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telephone</p>
                <a href={`tel:${CLINIC.telephoneLink}`} className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors block">
                  {CLINIC.telephone}
                </a>
                <p className="text-xs text-slate-500 font-medium">{CLINIC.openingHours[0].days}, {CLINIC.openingHours[0].hours}</p>
              </div>
            </div>

            <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-teal-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                <a href={`mailto:${CLINIC.email}`} className="text-lg font-bold text-slate-900 hover:text-teal-600 transition-colors block break-all">
                  {CLINIC.email}
                </a>
                <p className="text-xs text-slate-500 font-medium">We answer as soon as we can</p>
              </div>
            </div>

            <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-teal-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The Clinic</p>
                <p className="text-xl font-bold text-slate-900">{CLINIC.address.town}, {CLINIC.address.county}</p>
                <p className="text-xs text-slate-500 font-medium">{CLINIC.address.line1}, {CLINIC.address.postcode}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-950 rounded-[3rem] text-white space-y-6 relative overflow-hidden group">
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 shrink-0">
                  <ShieldCheck size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-bold">Data Privacy Guaranteed</h3>
                   <p className="text-slate-400 text-sm font-light">Your clinical information is encrypted and handled following GDPR protocols.</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-premium"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="contact-name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Full Name</label>
                      <input
                        required
                        id="contact-name"
                        autoComplete="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contact-email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Email Address</label>
                      <input
                        required
                        id="contact-email"
                        autoComplete="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="contact-phone" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Phone Number</label>
                      <input
                        id="contact-phone"
                        autoComplete="tel"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+44 7000 000000"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contact-subject" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Subject</label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium appearance-none"
                      >
                        <option>General Inquiry</option>
                        <option>Booking Request</option>
                        <option>Treatment Information</option>
                        <option>Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="contact-message" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Message</label>
                    <textarea
                      required
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium resize-none"
                    />
                  </div>

                  {sendFailed && (
                    <div
                      role="alert"
                      className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 flex gap-4"
                    >
                      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} aria-hidden="true" />
                      <div className="space-y-3">
                        <p className="font-bold text-amber-900">
                          We could not send that message
                        </p>
                        <p className="text-sm text-amber-900/80 leading-relaxed font-light">
                          Nothing has reached us, so please do not wait for a reply to this. Booking
                          online works and reaches the clinic directly — or call us if it is urgent.
                        </p>
                        <a
                          href={BOOKING_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900 text-white text-sm font-bold hover:bg-amber-800 transition-colors focus-visible:outline-amber-700"
                          aria-label="Book online instead — opens our booking system in a new tab"
                        >
                          <Calendar size={16} /> Book online instead
                          <ExternalLink size={12} className="opacity-70" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      disabled={isSubmitting}
                      className="w-full py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-3xl font-bold text-xl transition-all shadow-xl shadow-teal-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send size={24} />
                          Send Message
                          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 pt-4">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Clock size={12} className="text-teal-500" />
                        Response within 24h
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <MessageSquare size={12} className="text-teal-500" />
                        Professional Advice
                     </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full bg-teal-600 rounded-[4rem] p-16 text-center flex flex-col items-center justify-center text-white space-y-8"
              >
                <div className="w-32 h-32 rounded-[3rem] bg-white/20 flex items-center justify-center mb-4">
                   <CheckCircle2 size={64} className="text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-display font-medium tracking-tight">Message Received.</h2>
                  <p className="text-xl text-teal-50 font-light max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A clinical associate has been notified and will contact you shortly.
                  </p>
                </div>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-10 py-4 bg-white text-teal-600 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
