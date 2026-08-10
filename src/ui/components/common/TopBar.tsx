import React from 'react';
import { Download, Smartphone, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  isMobileDeviceView?: boolean;
  setIsMobileDeviceView?: (val: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ isMobileDeviceView = false, setIsMobileDeviceView }) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-900/80 dark:bg-slate-950/85 border-b border-slate-200/10 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* App Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                Tanzeel Pro
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Phase 4 Complete
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Status Saver & Video Downloader
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Viewport Toggle if handler passed */}
          {setIsMobileDeviceView && (
            <button
              onClick={() => setIsMobileDeviceView(!isMobileDeviceView)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isMobileDeviceView
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="Toggle Android Device Frame Simulation"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">
                {isMobileDeviceView ? 'Mobile Frame' : 'Full Screen'}
              </span>
            </button>
          )}

          {/* Secure Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure</span>
          </div>
        </div>
      </div>
    </header>
  );
};
