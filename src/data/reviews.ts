import { CLINIC } from './clinic';
import { PRACTITIONERS, type Practitioner } from './index';

export interface Review {
  author: string;
  quote: string;
  /**
   * Set only on a review about the practice as a whole: it names no
   * practitioner and describes no single patient's injury or condition.
   * `treatments` lists the treatments the reviewer mentions, as words matched
   * against a practitioner's role and specialisations; it is empty when they
   * mention none. A review that names treatments is only shown beside a
   * practitioner who gives one of them, so a foot care review never sits on
   * the hypnotherapist's page.
   */
  practiceWide?: { treatments: string[] };
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
 * Order matters — the treatments page, the treatment pages and the home page
 * pick reviews by their position in this list, so add new ones at the end.
 * Practitioner pages choose theirs with reviewsForPractitioner below.
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
    practiceWide: { treatments: ['osteopath', 'massage', 'foot care'] },
  },
  {
    author: 'karen kendall',
    quote: 'Professional, caring and knowledgeable. Always able to offer an appointment when required.',
    practiceWide: { treatments: [] },
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
    // "Chiropodist" is a protected title, and the clinic does not describe
    // its foot care practitioner as one — so this matches the osteopaths only.
    practiceWide: { treatments: ['osteopath', 'chiropod'] },
  },
  {
    author: 'Sharon Moon',
    quote: 'Absolutely brilliant',
    practiceWide: { treatments: [] },
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
 * The page gets two separate lists, shown under separate headings:
 *
 * - `named`: reviews that name this practitioner. Reviews naming a
 *   *different* practitioner are never used.
 * - `general`: reviews about the practice as a whole (marked `practiceWide`
 *   above). These used to be merged into the first list to make up the
 *   numbers, so a shoulder-injury review sat under the hypnotherapist's photo
 *   as if she had treated it. Now they are labelled as being about the clinic,
 *   and one that names treatments only appears beside someone who gives them.
 */
export interface PractitionerReviews {
  named: Review[];
  general: Review[];
}

const firstNameOf = (fullName: string) => fullName.trim().split(/\s+/)[0].toLowerCase();

/** The first names of the whole team, read from the roster, never typed. */
const TEAM_FIRST_NAMES = PRACTITIONERS.map((p) => firstNameOf(p.name));

const namesIn = (r: Review) =>
  TEAM_FIRST_NAMES.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(r.quote));

export function reviewsForPractitioner(
  practitioner: Pick<Practitioner, 'name' | 'role' | 'specialisations'>,
  limit = 2,
): PractitionerReviews {
  const firstName = firstNameOf(practitioner.name);
  const named = REVIEWS.filter((r) => namesIn(r).includes(firstName));

  const gives = [practitioner.role, ...(practitioner.specialisations ?? [])].map((s) => s.toLowerCase());
  const fits = (treatment: string) => gives.some((g) => g.includes(treatment.toLowerCase()));

  const practiceWide = REVIEWS.filter((r) => r.practiceWide && namesIn(r).length === 0);
  const aboutTheirWork = practiceWide.filter((r) => r.practiceWide!.treatments.some(fits));
  const aboutNoTreatment = practiceWide.filter((r) => r.practiceWide!.treatments.length === 0);

  return {
    named: named.slice(0, limit),
    general: [...aboutTheirWork, ...aboutNoTreatment].slice(0, limit),
  };
}

/** Where these came from, so a reader can check them. */
export const REVIEWS_SOURCE = {
  label: 'Google reviews',
  url: CLINIC.reviewsUrl,
  writeUrl: CLINIC.writeReviewUrl,
  /* The rating snapshot, typed ONCE. Three pages used to hand-type
   * "5.0" and "56 reviews" separately - a lie waiting to happen the
   * moment one page is updated and the others are not. Update these two
   * numbers here when the Google listing moves. */
  rating: '5.0',
  count: 56,
};
