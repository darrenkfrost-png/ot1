/**
 * Free read-aloud, using the speech engine already inside the browser
 * (the Web Speech API). No account, no network call, no per-word charge —
 * the voices ship with the reader's own device, so this costs the clinic
 * nothing and keeps working with the internet off.
 *
 * Two traps this file exists to contain:
 *
 * 1. VOICES LOAD LATE. getVoices() is often empty on first call and fills in
 *    after a `voiceschanged` event. The list is re-read on that event, and
 *    if no voice has arrived yet an utterance is still spoken with the
 *    engine's default rather than refusing.
 *
 * 2. LONG UTTERANCES DIE. Some engines silently cut off long text mid-flow.
 *    Text is split into sentences and spoken as a queue, which also gives a
 *    natural cancel point between sentences.
 */

let voices: SpeechSynthesisVoice[] = [];

export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

if (speechSupported()) {
  const load = () => { voices = window.speechSynthesis.getVoices(); };
  load();
  window.speechSynthesis.addEventListener?.('voiceschanged', load);
}

/** A British voice suits a Herne Bay clinic; any English voice is the fallback. */
const pickVoice = (): SpeechSynthesisVoice | null =>
  voices.find((v) => v.lang === 'en-GB' && v.localService) ||
  voices.find((v) => v.lang === 'en-GB') ||
  voices.find((v) => v.lang.startsWith('en')) ||
  null;

const toSentences = (text: string): string[] =>
  text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [];

let queue: string[] = [];
let active = false;
let onFinish: (() => void) | null = null;

const speakNext = (rate: number) => {
  const next = queue.shift();
  if (next === undefined) {
    active = false;
    const cb = onFinish;
    onFinish = null;
    cb?.();
    return;
  }
  const u = new SpeechSynthesisUtterance(next);
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = Math.min(2, Math.max(0.5, rate));
  u.onend = () => speakNext(rate);
  u.onerror = () => speakNext(rate);
  window.speechSynthesis.speak(u);
};

/**
 * Speak `text` aloud. Returns false when the browser has no speech engine or
 * the text is empty. `done` fires when the reading finishes naturally OR is
 * stopped, so a play button can always find its way back to its resting state.
 */
export const speak = (text: string, rate = 1, done?: () => void): boolean => {
  if (!speechSupported()) return false;
  stop();
  queue = toSentences(text);
  if (!queue.length) return false;
  active = true;
  onFinish = done ?? null;
  speakNext(rate);
  return true;
};

export const stop = (): void => {
  queue = [];
  // Clear the callback BEFORE cancel(): cancel fires the live utterance's
  // onend, which drains the (now empty) queue — the old callback must not
  // run twice, and a new speak()'s callback must not be eaten.
  const cb = onFinish;
  onFinish = null;
  active = false;
  if (speechSupported()) window.speechSynthesis.cancel();
  cb?.();
};

export const isSpeaking = (): boolean => active;
