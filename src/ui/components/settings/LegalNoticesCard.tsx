import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import { PrivacyPolicyModal } from '../about/PrivacyPolicyModal';
import { TermsOfUseModal } from '../about/TermsOfUseModal';

export const LegalNoticesCard: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl select-none">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-purple-400" />
        <h3 className="font-bold text-sm text-slate-100">Legal & Transparency</h3>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPrivacy(true)}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setShowTerms(true)}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Terms of Use</span>
        </button>
      </div>

      {/* Platform Non-Affiliation Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Platform Disclaimer</span>
        </div>
        <p className="leading-normal">
          Tanzeel Pro is an independent utility and is not affiliated, associated, or endorsed by YouTube, TikTok, Facebook, Instagram, or WhatsApp. All product names, logos, and trademarks belong to their respective owners.
        </p>
      </div>

      {/* Modals */}
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsOfUseModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
