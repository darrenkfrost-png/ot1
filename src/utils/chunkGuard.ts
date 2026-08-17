/**
 * Deploy-skew guard.
 *
 * THE PROBLEM THIS SOLVES
 * Every deploy renames every file in /assets (they carry a content hash). A
 * browser tab that was opened *before* a deploy is still running the old
 * index, which points at the old file names. The moment the visitor clicks a
 * link, the app tries to fetch a page chunk that no longer exists.
 *
 * On this host that request does not fail cleanly - it answers 200 with the
 * HTML of a fallback page. The browser then refuses to run HTML as JavaScript,
 * the module never loads, and React ends up undefined. What the visitor sees
 * is the crash card and "Cannot read properties of null (reading 'useRef')".
 *
 * THE FIX
 * A stale tab only needs to fetch the page again: index.html is served
 * no-cache, so one reload picks up the new file names and everything works.
 *
 * THE TRAP
 * Reloading on every failed import creates an infinite reload loop whenever
 * the server is genuinely inconsistent (mid-deploy, or a half-finished
 * upload). So reloads are rationed by a budget that is *never* reset on
 * success - if it were, a single successful chunk would re-arm the loop.
 * Once the budget is spent the error is allowed through to the error card,
 * which gives the visitor a real way out instead of a flickering screen.
 */

const KEY = 'ct6:chunk-reloads';
const MAX_RELOADS = 2;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/** Timestamps of reloads we have already spent, most recent last. */
function readHistory(): number[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === 'number');
  } catch {
    // Private browsing, storage disabled, or corrupt value. Treat as empty:
    // the worst case is that we allow the reloads, which is the safe default
    // for a visitor who would otherwise be stuck on a crash screen.
    return [];
  }
}

function writeHistory(history: number[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(history));
  } catch {
    /* nothing we can do; the budget simply won't persist */
  }
}

/**
 * Claim one reload. Returns false when the budget for this window is gone,
 * which means the caller must let the error surface instead.
 *
 * Deliberately has no counterpart that clears the history on a successful
 * import - see THE TRAP above.
 */
export function spendReloadBudget(): boolean {
  const now = Date.now();
  const recent = readHistory().filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_RELOADS) {
    writeHistory(recent);
    return false;
  }

  recent.push(now);
  writeHistory(recent);
  return true;
}

/**
 * Does this error look like a tab running against a deploy that has moved on?
 *
 * Browsers word this failure differently, and the null-property variant is
 * what surfaces when a chunk loaded as HTML leaves a module half-initialised,
 * so all the known spellings are matched here.
 */
export function isDeploySkewError(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '');

  return [
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'Importing a module script failed',
    // Chrome's wording when a chunk comes back as HTML. It has changed at
    // least once ("JavaScript module script" -> "JavaScript-or-Wasm module
    // script"), so match the stable fragments rather than the whole phrase.
    'Failed to load module script',
    'MIME type',
    'Unexpected token', // HTML served where JavaScript was expected
    "expected expression, got '<'",
    'ChunkLoadError',
    'Loading chunk',
    'Loading CSS chunk',
    "reading 'useRef'", // React itself came back null - see the header comment
    "reading 'useState'",
    "reading 'useEffect'",
  ].some((needle) => message.includes(needle));
}

/**
 * Reload once to pick up the current deploy, if the budget allows.
 * Returns false when the caller should show an error instead.
 */
export function reloadForFreshDeploy(): boolean {
  if (!spendReloadBudget()) return false;
  window.location.reload();
  return true;
}
