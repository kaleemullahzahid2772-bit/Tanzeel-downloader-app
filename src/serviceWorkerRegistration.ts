/**
 * Service Worker Registration for Tanzeel Pro PWA
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl, { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          // Check if there is already a waiting service worker
          if (registration.waiting) {
            window.dispatchEvent(new Event('swUpdateFound'));
          }

          // Check for service worker updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Reloading or ready.');
                  window.dispatchEvent(new Event('swUpdateFound'));
                } else {
                  console.log('[PWA] App is cached for offline use.');
                }
              }
            });
          });
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}
