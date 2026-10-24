import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { WhatsappIcon } from '../common/BrandIcons';

interface WhatsAppComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppComingSoonModal: React.FC<WhatsAppComingSoonModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-2xl border border-emerald-500/25 overflow-hidden text-center"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Top Accent Line */}
            <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon with Glowing Rings */}
            <div className="pt-2 pb-3 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[2px] shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <WhatsappIcon className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Badges & Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Feature In Development</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-teal-300 drop-shadow-sm font-sans">
                Coming Soon
              </h2>

              <p className="text-sm font-semibold text-emerald-300/90 font-arabic">
                واٹس ایپ سٹیٹس سیور جلد دستیاب ہوگا
              </p>

              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto pt-1">
                This premium feature is being crafted with perfection. Soon you will be able to view and download all WhatsApp statuses with a single tap.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-5 space-y-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700/60 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-tap HD Status Video & Photo Save</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Offline Access & Fast Player</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>100% Secure, Safe & Private Storage</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5 pt-1">
              <button
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                GOT IT • ٹھیک ہے
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
