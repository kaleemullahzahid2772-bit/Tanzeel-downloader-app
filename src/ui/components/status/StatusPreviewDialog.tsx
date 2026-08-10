import React from 'react';
import { X, Download, Share2, Check, Clock } from 'lucide-react';
import type { StatusMediaItem } from '../../../domain/models/StatusMedia';

interface StatusPreviewDialogProps {
  item: StatusMediaItem | null;
  onClose: () => void;
  onSave: (item: StatusMediaItem) => void;
  onShare: (item: StatusMediaItem) => void;
}

export const StatusPreviewDialog: React.FC<StatusPreviewDialogProps> = ({
  item,
  onClose,
  onSave,
  onShare,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 capitalize">
              WhatsApp {item.type} Status
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[500px]">
          <img
            src={item.mediaUrl}
            alt="Status Full Preview"
            className="max-h-[500px] w-full object-contain"
          />
          {item.duration && (
            <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-slate-950/80 text-white font-mono text-xs flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" /> {item.duration}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
          <button
            onClick={() => onSave(item)}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              item.isSaved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
            }`}
          >
            {item.isSaved ? (
              <>
                <Check className="w-4 h-4" /> Saved to Gallery
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Save to Device Gallery
              </>
            )}
          </button>

          <button
            onClick={() => onShare(item)}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
