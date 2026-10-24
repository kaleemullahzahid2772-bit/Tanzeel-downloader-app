import { useState, useEffect, useCallback } from 'react';

const CURRENT_CLIENT_VERSION = '1.2.0';
const STORAGE_KEY = 'tanzeel_app_version';

export interface AppUpdateState {
  hasUpdate: boolean;
  version: string;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function useAppUpdate(): AppUpdateState {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>(CURRENT_CLIENT_VERSION);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    try {
      // 1. Check ServiceWorker registration updates
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.update().catch(() => {});
          if (registration.waiting) {
            setHasUpdate(true);
            return;
          }
        }
      }

      // 2. Check version.json from server
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        const serverVersion = data.version || CURRENT_CLIENT_VERSION;
        const storedVersion = localStorage.getItem(STORAGE_KEY);

        // If server version is newer or stored version is outdated
        if (storedVersion && storedVersion !== serverVersion) {
          setNewVersion(serverVersion);
          setHasUpdate(true);
        } else if (!storedVersion) {
          localStorage.setItem(STORAGE_KEY, serverVersion);
        }
      }
    } catch (err) {
      console.debug('[AppUpdate] Update check skipped:', err);
    }
  }, []);

  useEffect(() => {
    // Initial check on load
    checkForUpdates();

    // Listen for Service Worker update found
    const handleSwUpdate = () => {
      setHasUpdate(true);
    };

    window.addEventListener('swUpdateFound', handleSwUpdate);

    return () => {
      window.removeEventListener('swUpdateFound', handleSwUpdate);
    };
  }, [checkForUpdates]);

  const applyUpdate = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, newVersion);
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    } finally {
      window.location.reload();
    }
  }, [newVersion]);

  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
  }, []);

  return {
    hasUpdate,
    version: newVersion,
    applyUpdate,
    dismissUpdate,
  };
}
