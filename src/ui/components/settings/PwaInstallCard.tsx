import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, Share, PlusSquare, Sparkles } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export const PwaInstallCard: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePwaInstall();
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await installApp();
    setInstalling(false);
    if (success) {
      setJustInstalled(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 space-y-3.5 shadow-xl relative overflow-hidden">
      {/* Decorative emerald ambient glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>App Installation (PWA)</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h3>
            <p className="text-[10px] text-slate-400">Install directly on mobile & desktop</p>
          </div>
        </div>

        {(isInstalled || justInstalled) ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Installed</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
            PWA Ready
          </span>
        )}
      </div>

      {(isInstalled || justInstalled) ? (
        <div className="flex items-center gap-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-3 text-xs text-emerald-200/90">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Tanzeel Pro is installed on this device. You can launch it anytime from your home screen or apps menu.
          </p>
        </div>
      ) : isInstallable ? (
        <div className="space-y-2.5 pt-1">
          <p className="text-xs text-slate-300 leading-relaxed">
            Install Tanzeel Pro on your phone or PC for full screen experience, faster downloads, and offline status viewing.
          </p>
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{installing ? 'Installing...' : 'Install Tanzeel Pro App'}</span>
          </button>
        </div>
      ) : isIOS ? (
        <div className="space-y-2 pt-1 text-xs text-slate-300">
          <p className="text-[11px] leading-relaxed text-slate-300">
            To install on iPhone or iPad:
          </p>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300">
            <Share className="w-4 h-4 text-blue-400 shrink-0" />
            <span>1. Tap the <strong>Share</strong> button in Safari</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300">
            <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2. Select <strong>Add to Home Screen</strong></span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1 text-xs text-slate-300">
          <p className="text-[11px] leading-relaxed text-slate-400">
            PWA service worker is active. If your browser supports install prompts, an install icon appears in the address bar or menu.
          </p>
        </div>
      )}
    </div>
  );
};
