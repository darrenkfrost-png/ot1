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
  /*
   * A mistake in what was typed is not a failed send. A mistyped email used to
   * raise the big amber "We could not send that message … Nothing has reached
   * us" box, which reads as the website being broken, while the real reason
   * sat in a toast in the corner that vanished after ten seconds. The problem
   * is now named under the field itself, and focus goes there to fix it.
   */
  const [fieldError, setFieldError] = useState<{ field: 'name' | 'email' | 'message'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
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

    // Client-side validation: point at the field, never at the delivery.
    const invalid = (field: 'name' | 'email' | 'message', text: string) => {
      setFieldError({ field, text });
      setIsSubmitting(false);
      document.getElementById(`contact-${field}`)?.focus();
    };
    setFieldError(null);
    if (!formData.name.trim()) {
      invalid('name', 'Please enter your name.');
      return;
    }
    if (!isValidEmail(formData.email.trim())) {
      invalid('email', 'Please check your email address. It should look like name@example.co.uk.');
      return;
    }
    if (!formData.message.trim()) {
      invalid('message', 'Please write your message.');
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
        setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
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

  /*
   * THE RESCUE ROUTE.
   *
   * When the send fails there is no server to retry against, so the next
   * best thing is to hand the message to the patient's own email client
   * with every word they typed already in it. Nothing is lost and nothing
   * has to be retyped — and unlike the form, this genuinely arrives.
   *
   * mailto: has no formal length limit but clients impose their own, so a
   * very long message can be cut short by the email app. The words stay in
   * the form either way, which is the safety net.
   */
  const rescueMailto = () => {
    const body = [
      formData.message,
      '',
      '---',
      `From: ${formData.name || '(no name given)'}`,
      `Email: ${formData.email || '(none given)'}`,
      formData.phone ? `Phone: ${formData.phone}` : null,
      `Subject: ${formData.subject}`,
    ].filter((l) => l !== null).join('\n');
    return `mailto:${CLINIC.email}?subject=${encodeURIComponent(formData.subject || 'Website enquiry')}` +
      `&body=${encodeURIComponent(body)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldError?.field === e.target.name) setFieldError(null);
  };

  /** Wires a field to its error message, if it has one. */
  const errorProps = (field: 'name' | 'email' | 'message') =>
    fieldError?.field === field
      ? { 'aria-invalid': true as const, 'aria-describedby': `contact-${field}-error` }
      : {};
  const errorText = (field: 'name' | 'email' | 'message') =>
    fieldError?.field === field ? (
      <p id={`contact-${field}-error`} className="ml-1 text-sm font-semibold text-red-700">
        {fieldError.text}
      </p>
    ) : null;

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
            <span className="text-sm font-black text-teal-400 uppercase tracking-[0.4em]">Get in Touch</span>
            <h1 className="text-5xl md:text-7xl font-display font-medium text-slate-50 tracking-tight leading-[0.9]">
              Let's start your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">recovery.</span>
            </h1>
            <p className="text-xl text-slate-300 font-light leading-relaxed max-w-sm">
              Questions about a treatment, times or prices? Send a message, or ring the clinic.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-teal-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Telephone</p>
                <a href={`tel:${CLINIC.telephoneLink}`} className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors block">
                  {CLINIC.telephone}
                </a>
                <p className="text-xs text-slate-500 font-medium">{CLINIC.openingHours.slice(0, 2).map((h) => `${h.days}, ${h.hours}`).join(" · ")}</p>
              </div>
            </div>

            <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-teal-500/30 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email</p>
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
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">The Clinic</p>
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
                   <h2 className="text-lg font-bold">What happens to your message</h2>
                   {/*
                     * This said "kept in line with GDPR": a legal claim made on
                     * the clinic's behalf, with nothing to point to. It should
                     * link the clinic's privacy statement instead — but that
                     * page (CLINIC.policies.privacy) shows only its heading;
                     * checked in a real browser, its document area is empty.
                     * A link to a blank page would be a second false comfort,
                     * so the claim is gone and the link waits for a real
                     * privacy notice from the clinic.
                     */}
                   <p className="text-slate-300 text-sm font-light">What you send here goes to the clinic and is used only to answer your message. It travels over an encrypted connection. If you would like to know how the clinic keeps your details, please ask.</p>
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
                      <label htmlFor="contact-name" className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1 block">Full Name</label>
                      <input
                        required
                        id="contact-name"
                        autoComplete="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        {...errorProps('name')}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium aria-invalid:border-red-700"
                      />
                      {errorText('name')}
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="contact-email" className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1 block">Email Address</label>
                      <input
                        required
                        id="contact-email"
                        autoComplete="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        {...errorProps('email')}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium aria-invalid:border-red-700"
                      />
                      {errorText('email')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label htmlFor="contact-phone" className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1 block">Phone Number</label>
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
                      <label htmlFor="contact-subject" className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1 block">Subject</label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium appearance-none"
                      >
                        <option>General Enquiry</option>
                        <option>Booking Request</option>
                        <option>Treatment Information</option>
                        <option>Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="contact-message" className="text-xs font-black text-slate-600 uppercase tracking-widest ml-1 block">Message</label>
                    <textarea
                      required
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      {...errorProps('message')}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium resize-none aria-invalid:border-red-700"
                    />
                    {errorText('message')}
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
                        {/* First, because it carries their words with it. */}
                        <a
                          href={rescueMailto()}
                          onClick={() => trackClick('Contact Failure: Rescued By Email')}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition-colors focus-visible:outline-teal-500"
                        >
                          <Mail size={16} aria-hidden="true" /> Send this by email instead
                        </a>
                        <p className="text-sm text-amber-900/80 leading-relaxed font-light">
                          That opens your email app with everything you have written already in it,
                          addressed to the clinic — nothing to retype.
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
                      className="w-full py-6 bg-teal-700 hover:bg-teal-700 text-white rounded-3xl font-bold text-xl transition-all shadow-xl shadow-teal-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale group"
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
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <Clock size={12} className="text-teal-500" />
                        {CLINIC.openingHours.slice(0, 2).map((h) => `${h.days}, ${h.hours}`).join(" · ")}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
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
                className="h-full bg-teal-700 rounded-[4rem] p-16 text-center flex flex-col items-center justify-center text-white space-y-8"
              >
                <div className="w-32 h-32 rounded-[3rem] bg-white/20 flex items-center justify-center mb-4">
                   <CheckCircle2 size={64} className="text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-display font-medium tracking-tight">Message sent.</h2>
                  {/* This promised that "a clinical associate has been notified
                      and will contact you shortly" — a job title the clinic
                      does not use, and a reply time nobody has agreed to. The
                      toast and the email card both say "as soon as we can". */}
                  <p className="text-xl text-white font-light max-w-sm mx-auto leading-relaxed">
                    Thank you. Your message has reached the clinic and we will reply as soon as we can.
                    If it is urgent, please ring{' '}
                    <a href={`tel:${CLINIC.telephoneLink}`} className="font-semibold underline underline-offset-4 whitespace-nowrap">
                      {CLINIC.telephone}
                    </a>.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-10 py-4 bg-white text-teal-800 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95"
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
