import React from 'react';
import { Battery, Wifi, Signal } from 'lucide-react';

interface ViewportFrameProps {
  isMobileDeviceView: boolean;
  children: React.ReactNode;
}

export const ViewportFrame: React.FC<ViewportFrameProps> = ({ isMobileDeviceView, children }) => {
  if (!isMobileDeviceView) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">{children}</div>;
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 transition-all">
      {/* Android Device Shell Container */}
      <div className="w-full max-w-[430px] h-[880px] max-h-[92vh] bg-slate-900 border-[10px] border-slate-800 rounded-[48px] shadow-2xl shadow-purple-950/40 flex flex-col overflow-hidden relative ring-1 ring-slate-700/50">
        
        {/* Android Punch-hole Camera Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800/80">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60" />
          </div>
        </div>

        {/* Android Status Bar */}
        <div className="pt-2 px-6 pb-1 bg-slate-950 text-slate-400 text-xs flex items-center justify-between z-40 select-none">
          <span className="font-semibold text-slate-300 text-[11px]">{currentTime}</span>
          <div className="flex items-center gap-2 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Device Screen Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 relative pb-20 scrollbar-none">
          {children}
        </div>

        {/* Android Bottom Navigation Pill Bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50 w-32 h-1 bg-slate-600/70 rounded-full" />
      </div>
    </div>
  );
};
