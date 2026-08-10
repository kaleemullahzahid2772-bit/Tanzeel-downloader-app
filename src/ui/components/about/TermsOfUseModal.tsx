import React from 'react';
import { FileText, X } from 'lucide-react';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">Terms of Use</h3>
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
            <strong className="text-slate-100">1. User Responsibility</strong><br />
            You are solely responsible for all content you download, save, or share using Tanzeel Pro. You must ensure you have legal authorization or ownership rights before downloading any media file.
          </p>

          <p>
            <strong className="text-slate-100">2. Copyright Compliance</strong><br />
            Tanzeel Pro respects intellectual property rights. The application is intended strictly for personal, non-commercial offline backup and fair-use access to public media.
          </p>

          <p>
            <strong className="text-slate-100">3. Prohibited Use</strong><br />
            You may not use this application to download copyrighted content without authorization, bypass Digital Rights Management (DRM) protections, or access private content restrictions.
          </p>

          <p>
            <strong className="text-slate-100">4. Service Availability</strong><br />
            Media extraction availability depends on third-party platform public interfaces. Functionality may change or be limited without prior notice.
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
