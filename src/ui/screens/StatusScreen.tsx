import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { WhatsappIcon } from '../components/common/BrandIcons';

interface StatusScreenProps {
  onBackToHome?: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn pb-24 select-none text-slate-900">
      
      {/* Premium Hero Card */}
      <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[36px] p-6 sm:p-9 shadow-2xl shadow-emerald-950/10 border border-white/90 ring-1 ring-emerald-100/80 text-center relative overflow-hidden space-y-5">
        
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

        {/* Floating Glowing Icon */}
        <div className="pt-2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[2.5px] shadow-2xl shadow-emerald-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[21px] flex items-center justify-center">
                <WhatsappIcon className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Under Development</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Coming Soon
          </h1>

          <p className="text-base sm:text-lg font-bold text-emerald-800 font-arabic">
            واٹس ایپ سٹیٹس سیور جلد دستیاب ہوگا
          </p>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            We are engineering a super-fast, private, and high-definition WhatsApp status downloader. Stay tuned for the upcoming update!
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>HD Media</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Original quality video and photo status downloads</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
              <Zap className="w-4 h-4 shrink-0" />
              <span>Instant Save</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">One-click download directly to your gallery</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Private & Safe</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">No account needed, completely on-device</p>
          </div>
        </div>

        {/* Back Button */}
        {onBackToHome && (
          <div className="pt-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Downloader</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
