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
