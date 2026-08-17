import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isDeploySkewError, reloadForFreshDeploy } from './utils/chunkGuard';
import './index.css';

/*
 * Vite preloads a page's file in the background as soon as it thinks the
 * visitor is heading there. When a deploy has renamed that file the preload
 * fails here, before React.lazy is ever involved, so lazyWithRetry never sees
 * it. Same recovery: reload once to pick up the current deploy, rationed by
 * the shared budget so a broken server cannot spin the tab.
 */
window.addEventListener('vite:preloadError', (event) => {
  const reason = (event as Event & { payload?: unknown }).payload;
  if (!isDeploySkewError(reason)) return;

  // Stop Vite throwing this into the console as an unhandled error; we are
  // handling it. If the budget is gone we leave it alone and let the normal
  // failure path show the visitor the error card.
  if (reloadForFreshDeploy()) event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
