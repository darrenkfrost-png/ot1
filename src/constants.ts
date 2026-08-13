/**
 * Online booking.
 *
 * The previous link pointed at the embedded booking flow
 * (/booking/client-details?serial=555088). That page needs third-party cookies,
 * which browsers now block by default, so patients arrived at "Unable to start
 * Online Booking" and reasonably concluded the clinic's booking was broken.
 *
 * This is the standalone page the provider itself falls back to. It loads the
 * real form directly.
 */
export const BOOKING_URL = "https://ob.rushcliff.com/holding-page/555088";

/** Shown next to booking links so nobody is surprised by a new tab. */
export const BOOKING_PROVIDER = "Rushcliff";

import { CLINIC } from './data/clinic';
export { CLINIC };

/**
 * Social profiles.
 *
 * The footer used to show Instagram, Twitter and LinkedIn buttons that opened
 * nothing — they popped a message saying "Opening Instagram…" and stopped
 * there. Buttons are only rendered for entries with a real address, so an
 * empty string means the icon simply is not shown.
 */
export const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: 'Instagram', url: '' },
  { label: 'Facebook', url: '' },
  { label: 'LinkedIn', url: '' },
];

/**
 * Governance documents.
 *
 * These were listed as clickable items that did nothing. A practice does need
 * to be able to produce them — a privacy notice in particular, since this site
 * collects personal details through the contact form — so they are listed
 * honestly: linked when there is something to link to, and otherwise shown as
 * available on request rather than pretending to open.
 */
export const GOVERNANCE_DOCS: { title: string; url: string }[] = [
  { title: 'Privacy Statement', url: CLINIC.policies.privacy },
  { title: 'Cookie Policy', url: CLINIC.policies.cookies },
  { title: 'Disclaimer', url: CLINIC.policies.disclaimer },
];
