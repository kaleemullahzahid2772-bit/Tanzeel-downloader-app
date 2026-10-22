import React from 'react';
import { X, Download, Share2, Check } from 'lucide-react';
import type { StatusMedia } from '../../../domain/models/StatusMedia';

interface StatusPreviewModalProps {
  item: StatusMedia | null;
  onClose: () => void;
  onSave: (item: StatusMedia) => void;
  onShare: (item: StatusMedia) => void;
}

export const StatusPreviewModal: React.FC<StatusPreviewModalProps> = ({
  item,
  onClose,
  onSave,
  onShare,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-4 animate-fadeIn select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h3 className="font-bold text-sm text-slate-100">{item.displayName}</h3>
          <p className="text-xs text-slate-400 font-mono">
            {item.dateFormatted} • {item.fileSizeFormatted}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center my-4 overflow-hidden rounded-2xl relative bg-slate-900 border border-slate-800">
        {item.type === 'VIDEO' ? (
          <video
            src={item.uri}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        ) : (
          <img
            src={item.uri}
            alt={item.displayName}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-center gap-3 py-2 z-10 max-w-md mx-auto w-full">
        <button
          onClick={() => onSave(item)}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ${
            item.isSaved
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-600/30'
          }`}
        >
          {item.isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Status</span>
            </>
          )}
        </button>

        <button
          onClick={() => onShare(item)}
          className="py-3.5 px-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          title="Share Status"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
