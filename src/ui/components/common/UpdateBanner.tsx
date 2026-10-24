import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdateBannerProps {
  hasUpdate: boolean;
  version?: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  hasUpdate,
  version = '1.2.0',
  onUpdate,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full flex justify-center py-2 px-2 z-50 sticky top-2"
        >
          <div className="relative group max-w-md w-full mx-auto">
            {/* Ambient Animated Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse" />

            {/* Banner Container */}
            <div className="relative flex items-center justify-between gap-3 px-4 py-2 sm:py-2.5 bg-slate-950/90 backdrop-blur-xl border border-emerald-400/30 rounded-full shadow-2xl text-white">
              
              {/* Left Indicator & Text */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold tracking-wide text-slate-100 truncate">
                    نئی اپڈیٹ دستیاب ہے <span className="text-[10px] text-emerald-400 font-mono font-medium">(v{version})</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={onUpdate}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-md shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Update Now"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-950 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Update</span>
                </button>

                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
