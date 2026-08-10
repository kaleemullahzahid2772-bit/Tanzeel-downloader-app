import React from 'react';
import { X, ShieldCheck, FileText, Info } from 'lucide-react';

export type InfoModalType = 'about' | 'privacy' | 'terms' | null;

interface InfoDialogProps {
  type: InfoModalType;
  onClose: () => void;
  appVersion: string;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ type, onClose, appVersion }) => {
  if (!type) return null;

  const contentMap = {
    about: {
      title: 'About Tanzeel Pro',
      icon: Info,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Tanzeel Pro</strong> is a premium, modern Android video downloader companion app engineered with Clean Scalable Architecture.
          </p>
          <p>
            It is designed to seamlessly process video links from YouTube, TikTok, Facebook, Instagram, and extract WhatsApp Status media on Android devices.
          </p>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">App Version:</span>
              <span className="text-purple-300 font-bold">{appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Framework:</span>
              <span className="text-slate-200">Vite + React + Material 3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Android Build Engine:</span>
              <span className="text-slate-200">Capacitor Native Target</span>
            </div>
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            We take your privacy seriously. Tanzeel Pro operates under strict privacy-first guidelines:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
            <li><strong>No Tracking:</strong> We do not track, collect, or share your video downloads or personal data.</li>
            <li><strong>Local Processing:</strong> WhatsApp status files and download metadata remain entirely on your device.</li>
            <li><strong>Zero Hidden Telemetry:</strong> No third-party background analytics or spyware.</li>
          </ul>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      body: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            By using Tanzeel Pro, you agree to comply with copyright laws and content creators' ownership rights:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
            <li>Download media only for personal, non-commercial offline viewing.</li>
            <li>Do not re-upload or redistribute copyrighted material without permission.</li>
            <li>Respect individual platform Terms of Service.</li>
          </ul>
        </div>
      ),
    },
  };

  const current = contentMap[type];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Icon className="w-4 h-4 text-purple-400" />
            <span>{current.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">{current.body}</div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
