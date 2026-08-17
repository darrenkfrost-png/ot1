import { lazy, type ComponentType } from 'react';
import { reloadForFreshDeploy } from './chunkGuard';

/**
 * React.lazy, but survives a deploy landing under an open tab.
 *
 * Two things are wrong with plain React.lazy here:
 *
 * 1. A page chunk that has been renamed by a deploy fails to import, and the
 *    visitor gets the crash card on an ordinary link click. See chunkGuard.ts
 *    for why that request comes back as HTML rather than a clean 404.
 *
 * 2. React.lazy remembers the *first* result forever. Once an import has
 *    failed, every later attempt to open that page replays the same failure
 *    from memory - it never retries, even after the network is fine again.
 *    So the retry has to happen inside the factory, before React sees it.
 *
 * The recovery is a page reload, because index.html is served no-cache: one
 * reload is enough to pick up the new file names. Reloads are rationed by the
 * shared budget so a genuinely broken server cannot spin the tab.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error: unknown) => {
      /*
       * Any failure to load a page is treated as recoverable, rather than
       * matching on the browser's wording for it. That wording is not stable:
       * Chrome reports a chunk that came back as HTML with a MIME-type
       * message that has already been reworded once, and Safari and Firefox
       * word it differently again. Matching strings here meant the real
       * production failure slipped straight past the guard.
       *
       * Being permissive is safe because the budget is what bounds this: at
       * most two reloads, after which the error is allowed through to the
       * card. A page that genuinely cannot load costs the visitor one reload
       * before they are told so - which is the same thing they would have
       * tried themselves.
       */
      if (reloadForFreshDeploy()) {
        // The reload is already underway. Hand back a promise that never
        // settles so React keeps showing the loading state instead of
        // flashing the error card during the fraction of a second before
        // the page goes away.
        return new Promise<{ default: T }>(() => {});
      }

      // Budget spent: let the error boundary show the visitor something they
      // can act on, rather than leaving them on a spinner forever.
      throw error;
    })
  );
}
