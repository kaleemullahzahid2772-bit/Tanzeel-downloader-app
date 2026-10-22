import React, { useState } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    await installApp();
    setInstalling(false);
  };

  return (
    <div className="relative mx-auto max-w-md w-full px-4 mb-4 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-emerald-700/90 backdrop-blur-md rounded-2xl p-3 text-white shadow-xl shadow-emerald-950/20 border border-emerald-400/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 shadow-sm flex items-center justify-center overflow-hidden">
            <img src="/icons/icon-96x96.png" alt="App Icon" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs tracking-tight truncate">Install Tanzeel Pro</h4>
              <Sparkles className="w-3 h-3 text-yellow-300 shrink-0" />
            </div>
            <p className="text-[10px] text-emerald-100 truncate">Fast downloads & offline home screen app</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{installing ? '...' : 'Install'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
