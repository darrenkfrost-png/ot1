import { CLINIC } from './clinic';

export interface Review {
  author: string;
  quote: string;
}

/**
 * Real reviews, left as the patients wrote them.
 *
 * The site previously carried five invented testimonials — "James T.",
 * "Emma L.", "Mark S.", "David R." — written to sound like marketing copy. The
 * practice has genuine reviews on its Google listing, and a real one signed
 * "Perry Kemp" is worth more than any invented one.
 *
 * Wording, spelling and punctuation are the reviewers' own. Tidying someone's
 * words and keeping their name on them makes it a different statement.
 */
export const REVIEWS: Review[] = [
  {
    author: 'Julia Rumsey',
    quote:
      'Shoulder injury giving me pain and after unsuccessful physio sessions decided to try here, glad I did. After a few sessions Shoulder feeling more comfortable and mobile. Highly recommend',
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
    author: 'Brian Jarman',
    quote: 'Leon is the best.',
  },
  {
    author: 'Sharon Moon',
    quote: 'Absolutely brilliant',
  },
  {
    author: 'Treat Queen',
    quote:
      "Come to Monique for beauty treatments. She's very thorough and caring and always does a fantastic job. Lovely positive girl, thoroughly recommend.",
  },
];

/** Where these came from, so a reader can check them. */
export const REVIEWS_SOURCE = {
  label: 'Google reviews',
  url: CLINIC.reviewsUrl,
};
