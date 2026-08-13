/**
 * The clinic. One place, one set of facts.
 *
 * Everything here comes from the practice's own published details. The site
 * previously advertised three clinics — Canterbury, a Harley Street studio in
 * London, and Whitstable — with placeholder telephone numbers (123456, 987654)
 * and email addresses on a domain the practice does not use. None of it was
 * real. Anything patient-facing should be read from here so it can never drift
 * apart again.
 */
export const CLINIC = {
  name: 'Osteopathy & Wellbeing @CT6',
  legalName: 'Osteopathy & Wellbeing @CT6 Limited',
  companyNumber: '07936142',

  address: {
    line1: '180 High Street',
    town: 'Herne Bay',
    county: 'Kent',
    postcode: 'CT6 5AJ',
    country: 'GB',
  },
  /** Single line, for compact places. */
  addressLine: '180 High Street, Herne Bay, Kent, CT6 5AJ',

  telephone: '01227 366473',
  /** E.164, for tel: links so a phone dials it correctly from anywhere. */
  telephoneLink: '+441227366473',
  email: 'info@osteopathyandwellbeing.co.uk',
  website: 'https://osteopathyandwellbeing.co.uk',

  openingHours: [
    { days: 'Monday – Friday', hours: '8am – 8pm' },
    { days: 'Saturday', hours: '8am – 12 noon' },
    { days: 'Sunday', hours: 'Closed' },
  ],

  /** schema.org form, for the structured data in index.html. */
  openingHoursSpec: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '20:00' },
    { days: ['Saturday'], opens: '08:00', closes: '12:00' },
  ],

  regulator: {
    name: 'General Osteopathic Council',
    abbreviation: 'GOsC',
    url: 'https://www.osteopathy.org.uk',
  },

  reviewsUrl: 'https://g.page/r/CSpDdGsX79iwEB0/review',

  policies: {
    privacy: 'https://osteopathyandwellbeing.co.uk/privacy-statement-uk/',
    cookies: 'https://osteopathyandwellbeing.co.uk/cookie-policy-uk/',
    disclaimer: 'https://osteopathyandwellbeing.co.uk/disclaimer/',
  },
} as const;
