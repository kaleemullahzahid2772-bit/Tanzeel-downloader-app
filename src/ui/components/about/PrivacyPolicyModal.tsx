import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Privacy Policy</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            <strong className="text-slate-100">1. Data Privacy Principle</strong><br />
            Tanzeel Pro is designed with strict 100% local privacy protection. We do not collect, store, track, or share your personal information, search history, or media files.
          </p>

          <p>
            <strong className="text-slate-100">2. Video URL Analysis</strong><br />
            When you enter a public video URL, the application sends the URL to our secure backend API solely to extract media metadata and generate direct media streams. Video URLs are processed ephemerally and are not linked to your identity.
          </p>

          <p>
            <strong className="text-slate-100">3. WhatsApp Status Media</strong><br />
            WhatsApp Status media is scanned, displayed, previewed, and saved 100% locally on your device via Android Storage Access Framework (SAF). Status media files are NEVER uploaded or transmitted to external servers.
          </p>

          <p>
            <strong className="text-slate-100">4. Local Device Storage</strong><br />
            Downloaded videos, saved statuses, user preferences, and history records are stored exclusively on your local device. You retain full control to clear history or delete files at any time.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
