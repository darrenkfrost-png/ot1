/**
 * Clinic gallery artwork.
 *
 * These were previously hot-linked from Google Drive, which is not a CDN: it
 * throttles browser requests, so visitors saw batches of broken images, and
 * the originals totalled 113.9MB of PNG. They are now served from this
 * project as WebP capped at a 1400px long edge - 5.1MB for all 58.
 */
const ALL_GUIDE_IMAGES = [
  "/images/gallery-01.webp",
  "/images/gallery-02.webp",
  "/images/gallery-03.webp",
  "/images/gallery-04.webp",
  "/images/gallery-05.webp",
  "/images/gallery-06.webp",
  "/images/gallery-07.webp",
  "/images/gallery-08.webp",
  "/images/gallery-09.webp",
  "/images/gallery-10.webp",
  "/images/gallery-11.webp",
  "/images/gallery-12.webp",
  "/images/gallery-13.webp",
  "/images/gallery-14.webp",
  "/images/gallery-15.webp",
  "/images/gallery-16.webp",
  "/images/gallery-17.webp",
  "/images/gallery-18.webp",
  "/images/gallery-19.webp",
  "/images/gallery-20.webp",
  "/images/gallery-21.webp",
  "/images/gallery-22.webp",
  "/images/gallery-23.webp",
  "/images/gallery-24.webp",
  "/images/gallery-25.webp",
  "/images/gallery-26.webp",
  "/images/gallery-27.webp",
  "/images/gallery-28.webp",
  "/images/gallery-29.webp",
  "/images/gallery-30.webp",
  "/images/gallery-31.webp",
  "/images/gallery-32.webp",
  "/images/gallery-33.webp",
  "/images/gallery-34.webp",
  "/images/gallery-35.webp",
  "/images/gallery-36.webp",
  "/images/gallery-37.webp",
  "/images/gallery-38.webp",
  "/images/gallery-39.webp",
  "/images/gallery-40.webp",
  "/images/gallery-41.webp",
  "/images/gallery-42.webp",
  "/images/gallery-43.webp",
  "/images/gallery-44.webp",
  "/images/gallery-45.webp",
  "/images/gallery-46.webp",
  "/images/gallery-47.webp",
  "/images/gallery-48.webp",
  "/images/gallery-49.webp",
  "/images/gallery-50.webp",
  "/images/gallery-51.webp",
  "/images/gallery-52.webp",
  "/images/gallery-53.webp",
  "/images/gallery-54.webp",
  "/images/gallery-55.webp",
  "/images/gallery-56.webp",
  "/images/gallery-57.webp",
  "/images/gallery-58.webp",
];

/**
 * GUIDES HELD BACK FROM THE GALLERY — audited 2026-08-17.
 *
 * These are not deleted and nothing is lost: the artwork is still in
 * public/images and this list is the record of why each one is not shown.
 * Restoring a guide is a matter of deleting its line once the image is fixed.
 *
 * They are withheld because the artwork carries mistakes that would mislead a
 * patient. The clinic's real details are the ones in src/data/clinic.ts:
 * 180 High Street, Herne Bay, Kent, CT6 5AJ · 01227 366473 ·
 * osteopathyandwellbeing.co.uk.
 *
 * There are no source files for these — they exist only as images — so they
 * cannot be text-edited. Correcting one means regenerating the artwork.
 */
const WITHHELD: Record<string, string> = {
  // Prints an address that is not the clinic's: "70 Canterbury Road, Herne
  // Bay, CT6 5SB". Someone following it arrives at the wrong building.
  '/images/gallery-04.webp': 'wrong address',
  '/images/gallery-12.webp': 'wrong address',
  '/images/gallery-21.webp': 'wrong address',
  '/images/gallery-23.webp': 'wrong address',
  '/images/gallery-27.webp': 'wrong address',
  '/images/gallery-30.webp': 'wrong address',
  '/images/gallery-34.webp': 'wrong address',
  '/images/gallery-36.webp': 'wrong address',
  '/images/gallery-39.webp': 'wrong address',
  '/images/gallery-48.webp': 'wrong address',

  // A clinic name, telephone number and domain that are all somebody else's:
  // "Herne Bay Clinic · T: 0123 456 7857 · hernebayclinic.com".
  '/images/gallery-01.webp': 'fake phone number and wrong practice name',

  // The template was never filled in - these render the field names.
  '/images/gallery-20.webp': 'placeholder "[Address], [Phone Number], [Website]"',
  '/images/gallery-10.webp': 'placeholder "[CT6 Logo]"',

  // The body text is meaningless - garbled characters rendered as if they were
  // clinical explanation ("Cavitation is a neroromary of cavitation... broazing
  // the element and the neural reset in the neural reset"), and it is signed
  // "Safe, Regulated, Evidence-Based." This is the most serious of the set.
  '/images/gallery-43.webp': 'body text is gibberish',

  // Not a patient guide at all - the bare CT6 logo, 512x512, sitting in the
  // gallery as though it were one.
  '/images/gallery-32.webp': 'not a guide, just the logo mark',
};

/** The guides actually shown to patients. */
export const GALLERY_IMAGES = ALL_GUIDE_IMAGES.filter((src) => !(src in WITHHELD));

/** What is being held back and why - for the clinic's own reference. */
export const WITHHELD_GUIDES = WITHHELD;
