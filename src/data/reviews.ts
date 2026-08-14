import { CLINIC } from './clinic';

export interface Review {
  author: string;
  quote: string;
}

/**
 * Real reviews from the practice's Google listing, left exactly as written.
 *
 * Spelling, punctuation and the odd typo are the reviewers' own. Tidying
 * someone's words while keeping their name on them makes it a different
 * statement, and these read as genuine precisely because they are not polished.
 *
 * Reviews that Google had truncated with "… More" are not included: the visible
 * half is not the review, and completing someone else's sentence is inventing
 * a testimonial.
 *
 * Order matters — the first three appear on the treatments page, the next two
 * on practitioner pages, and the sixth is the spotlight quote.
 */
export const REVIEWS: Review[] = [
  {
    author: 'Andrew & Charlie Heap',
    quote:
      'I’ve been going to Adrian for around 8 years, he’s brilliant, nothing is too much trouble. A bonus is how friendly he is! He also sees my husband and both my parents.',
  },
  {
    author: 'Tomas White',
    quote:
      'Great service, I had an injury on my back which put me out of work for a while, Adrian done a fantastic job and within a few weeks i was back at work. I now visit on a regular basis. Highly recommended.',
  },
  {
    author: 'Julia Rumsey',
    quote:
      'Shoulder injury giving me pain and after unsuccessful physio sessions decided to try here, glad I did. After a few sessions Shoulder feeling more comfortable and mobile. Highly recommend',
  },
  {
    author: 'Jen Goodman',
    quote:
      'Thank you to Adrian for fitting me in in an emergency and helping me out with my horrendous back pain! Brilliant Osteopath, highly recommended.',
  },
  {
    author: 'Julie Sculfor',
    quote: 'Leon is so goo, definitely pleased and wouldn’t hesitate recommending',
  },
  {
    author: 'Kris Holden',
    quote:
      'Great treatments and sound advice, Adrian has helped me recover from painful back injury and offered constructive ideas so that I can get back in the gym without doing any further damage. Happy to recommend.',
  },
  {
    author: 'Bob Eager',
    quote:
      'Great people, effective treatment. I have been using this place for years, for ongoing problems and also to treat short term injuries. I would recommend it!',
  },
  {
    author: 'angela smith',
    quote:
      'Fantastic osteopath, massage therapy and foot care,10/10.I have been coming here for years,can’t recommend this practice enough',
  },
  {
    author: 'karen kendall',
    quote: 'Professional, caring and knowledgeable. Always able to offer an appointment when required.',
  },
  {
    author: 'Micky Orr',
    quote: 'Very professional and sorted the bulge on my Disc in no time top class',
  },
  {
    author: 'Max (Maximus)',
    quote:
      'Had a fall snowboarding earlier in the year and pulled a tricep muscle. I received a couple of treatments at the Osteopathy & Wellbeing Clinic which really helped the healing process. I was back up and running in just a few weeks. Thanks guys.',
  },
  {
    author: 'Geoff Lane',
    quote:
      'Always sorts out my problems. I have had 2 back surgeries and have problems from time to time, but I am straightened out with treatments carried out.',
  },
  {
    author: 'Peter Coyston',
    quote: 'Fantastic service My back issue is so much better after 2 visits, I would highly recommend',
  },
  {
    author: 'Perry Kemp',
    quote:
      'Top man help me out and now I am so happy and grateful pain as drop off now thank you Perry kemp',
  },
  {
    author: 'Derek Harris',
    quote: 'Great for osteopathy and chiropody',
  },
  {
    author: 'Sharon Moon',
    quote: 'Absolutely brilliant',
  },
];

/**
 * Reviews to show on a named practitioner's page.
 *
 * Practitioner pages used to show a fixed slice of the list, so Adrian's page
 * carried a review praising Leon by name. Putting one practitioner's praise
 * under another's photograph misattributes it, and a reader who notices stops
 * believing the rest of the page.
 *
 * A review is only shown on a practitioner's page if it names them. Reviews
 * that name a *different* practitioner are excluded outright; the remainder,
 * which praise the practice without naming anyone, are used to make up the
 * numbers — they are true of whoever the reader is looking at.
 */
export function reviewsForPractitioner(fullName: string, limit = 2): Review[] {
  const firstName = fullName.trim().split(/\s+/)[0];
  const everyFirstName = ['Adrian', 'Leon', 'Keri'];
  const names = (r: Review) => everyFirstName.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(r.quote));

  const aboutThem = REVIEWS.filter((r) => names(r).some((n) => n.toLowerCase() === firstName.toLowerCase()));
  const aboutNobody = REVIEWS.filter((r) => names(r).length === 0);

  return [...aboutThem, ...aboutNobody].slice(0, limit);
}

/** Where these came from, so a reader can check them. */
export const REVIEWS_SOURCE = {
  label: 'Google reviews',
  url: CLINIC.reviewsUrl,
  writeUrl: CLINIC.writeReviewUrl,
};
