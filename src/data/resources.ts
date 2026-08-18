/**
 * Patient guides offered on the Resources page.
 *
 * These were listed as "Manual 1" and "Manual 2", labelled "Download PDF", and
 * pointed at Google Drive. Everything about that was wrong:
 *
 *  · They are not PDFs. Drive serves them as image/png.
 *  · They are not manuals, and nobody clicks a link called "Manual 2".
 *  · They were 19MB and 17MB, from a host that throttles browsers. The same
 *    artwork already sits in this project at 33KB, served from the site - the
 *    reason the gallery stopped using Drive (see src/data/images.ts).
 *  · "Manual 1" was not a document at all. It is the file the gallery holds as
 *    gallery-58: a blank page carrying two logo marks. A patient clicking
 *    "Download PDF" was handed 19MB of branding.
 *
 * What remains is the one real guide, under the title printed on the artwork.
 */
export const PDFs = [
  { title: 'Sciatica: similar symptoms, different causes', url: '/images/gallery-57.webp' },
];

/**
 * The practice's own films, from its YouTube channel.
 *
 * These replace three Google Drive links titled "Walkthrough Video 1", "2" and
 * "Care Video" — Drive is not a video host, it throttles browser traffic the
 * same way it did the gallery images, and nobody clicks a link called
 * "Walkthrough Video 2".
 *
 * Titles are the channel's own, taken from YouTube rather than written here.
 */
export const VIDEOS = [
  {
    title: "@CT6: Watch what osteopaths do",
    youtubeId: "ijh25NCyYBQ",
    url: "https://www.youtube.com/watch?v=ijh25NCyYBQ",
    blurb: "What actually happens in an osteopathy appointment.",
  },
  {
    title: "@CT6: Our range of services",
    youtubeId: "XSvtMHyJDeQ",
    url: "https://www.youtube.com/watch?v=XSvtMHyJDeQ",
    blurb: "The treatments offered at the clinic, in brief.",
  },
  {
    title: "What osteopaths do — trailer 1",
    youtubeId: "CicpQ0CryNQ",
    url: "https://www.youtube.com/watch?v=CicpQ0CryNQ",
    blurb: "A short introduction to osteopathic care.",
  },
  {
    title: "What osteopaths do — trailer 2",
    youtubeId: "TmNCs5r7kb4",
    url: "https://www.youtube.com/watch?v=TmNCs5r7kb4",
    blurb: "More on how an osteopath assesses and treats.",
  },
];

export const YOUTUBE_CHANNEL = "https://www.youtube.com/@OsteopathyWellbeingCT6HerneBay";
