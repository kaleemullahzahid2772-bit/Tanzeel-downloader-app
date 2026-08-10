import React from 'react';
import { MessageSquare, AlertCircle, Sparkles, FolderLock } from 'lucide-react';
import type { StatusPermissionState } from '../../../domain/models/StatusMedia';

interface StatusPermissionCardProps {
  permissionState: StatusPermissionState;
  setPermissionState: (state: StatusPermissionState) => void;
}

export const StatusPermissionCard: React.FC<StatusPermissionCardProps> = ({
  permissionState,
  setPermissionState,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Header Info */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">WhatsApp Status Extractor</h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Detects and saves WhatsApp and WhatsApp Business status media directly from your Android device storage.
          </p>
        </div>
      </div>

      {/* Demo State Switcher Bar for Phase 1 testing */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Phase 1 Architectural State Switcher:
          </span>
          <span className="font-mono text-slate-400 uppercase font-bold">{permissionState}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setPermissionState('required')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
              permissionState === 'required'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Permission Required
          </button>
          <button
            onClick={() => setPermissionState('granted')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
              permissionState === 'granted'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Granted / Statuses
          </button>
          <button
            onClick={() => setPermissionState('empty')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
              permissionState === 'empty'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            No Statuses
          </button>
          <button
            onClick={() => setPermissionState('error')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
              permissionState === 'error'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Permission Error
          </button>
        </div>
      </div>

      {/* Active State Details Banner */}
      {permissionState === 'required' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <FolderLock className="w-4 h-4 text-amber-400" />
            <span>Android Storage Access Permission Required (Phase 5)</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            In Phase 5, this feature will request Storage Access Framework (SAF) permission to locate WhatsApp status files at <code className="font-mono text-[10px] bg-slate-950/60 px-1 py-0.5 rounded">Android/media/com.whatsapp/WhatsApp/Media/.Statuses</code>.
          </p>
          <button
            onClick={() => setPermissionState('granted')}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Simulate Granting Permission
          </button>
        </div>
      )}

      {permissionState === 'error' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Permission Denied or WhatsApp Folder Not Found</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            Could not read WhatsApp status directory. Please ensure WhatsApp is installed and media storage permissions are granted in Android App Info settings.
          </p>
        </div>
      )}
    </div>
  );
};
